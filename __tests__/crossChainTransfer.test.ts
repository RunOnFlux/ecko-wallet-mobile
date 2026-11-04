import {beforeEach, describe, expect, it, jest} from '@jest/globals';

jest.mock('../src/utils/hooksHelpers', () => ({
  wait: () => Promise.resolve(),
}));
jest.mock('../src/store/transfer/services', () => ({
  getContinuationTransferRequest: jest.fn(),
  getCrossTransferRequest: jest.fn(),
  getSendRequest: jest.fn(),
  getSimpleTransferRequest: jest.fn(),
  getSpvRequest: jest.fn(),
  getPollRequest: jest.fn(),
  swapApiRequest: jest.fn(),
}));

import * as services from '../src/store/transfer/services';
import {
  finishTransferThunk,
  makeTransferThunk,
} from '../src/store/transfer/effects';
import historyReducer from '../src/store/history';
import {fetchPollData} from '../src/store/history/effects';
import {canFinishCrossChainTransfer} from '../src/store/history/crossChain';
import {TActivity} from '../src/store/history/types';

const mocked = services as unknown as Record<string, jest.Mock<any>>;

const network = {
  name: 'Mainnet',
  network: 'https://api.chainweb.com',
  instance: 'mainnet01',
  version: '0.0',
} as any;

const SOURCE_KEY = 'step0-request-key';
const CONT_KEY = 'step1-request-key';
const PROOF = 'spv-proof-string';
// Chainweb's /send rejection when a relayer already ran step 1 of the pact.
const ALREADY_COMPLETED = `One or more transactions were invalid: Transaction "cont-hash" at index 0 failed with: This transaction is attempting to complete an already-completed defpact ID: "${SOURCE_KEY}"`;

const step0Continuation = {
  pactId: SOURCE_KEY,
  step: 0,
  stepCount: 2,
  yield: {provenance: {targetChainId: '1'}},
};

const crossChainPayload = {
  gatheredInfo: {
    chainId: '2',
    amount: 0.5,
    predicate: 'keys-all',
    destinationAccount: {accountName: 'k:receiver', chainId: '1'},
  },
  sourceAccount: {
    privateKey: 'not-a-real-key',
    accountName: 'k:sender',
    publicKey: 'sender-pub',
  },
  networkDetail: network,
  sourceToken: {tokenName: 'KDA', tokenAddress: 'coin'},
  estimatedGasFee: {gasLimit: 2500, gasPrice: 0.00000001},
} as any;

const initialState = () => ({
  history: {activities: [], pollReqState: {}},
  networks: {activeNetworkState: {data: network}},
});

// Runs a thunk with a dispatch that feeds plain history actions through the
// real history reducer, so tests can assert on the stored History entries.
const runThunk = async (thunk: any) => {
  let historyState = historyReducer(undefined, {type: '@@init'});
  const actions: any[] = [];
  const dispatch = jest.fn((action: any) => {
    if (typeof action === 'function') {
      return undefined;
    }
    actions.push(action);
    if (String(action.type).startsWith('history/')) {
      historyState = historyReducer(historyState, action);
    }
    return action;
  });
  const getState = () => ({...initialState(), history: historyState});
  await thunk(dispatch, getState, undefined);
  return {actions, history: () => historyState};
};

const transferResults = (actions: any[]) =>
  actions
    .filter(a => a.type === 'transfer/setTransferResult')
    .map(a => a.payload);

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  [
    'getContinuationTransferRequest',
    'getCrossTransferRequest',
    'getSendRequest',
    'getSimpleTransferRequest',
    'getSpvRequest',
    'getPollRequest',
  ].forEach(name => mocked[name].mockReset());
  mocked.getCrossTransferRequest.mockResolvedValue({cmd: 'burn'});
  mocked.getSimpleTransferRequest.mockResolvedValue({cmd: 'simple'});
  mocked.getContinuationTransferRequest.mockResolvedValue({cmd: 'cont'});
  mocked.getSpvRequest.mockResolvedValue(PROOF);
  mocked.getSendRequest
    .mockResolvedValueOnce({requestKeys: [SOURCE_KEY]})
    .mockResolvedValueOnce({requestKeys: [CONT_KEY]});
  mocked.getPollRequest.mockImplementation(async ({requestKeys}: any) => {
    const key = requestKeys[0];
    if (key === SOURCE_KEY) {
      return {
        [key]: {
          reqKey: key,
          result: {status: 'success', data: 'Write succeeded'},
          continuation: step0Continuation,
        },
      };
    }
    return {
      [key]: {
        reqKey: key,
        result: {status: 'success', data: 'Write succeeded'},
        continuation: {...step0Continuation, step: 1},
      },
    };
  });
});

describe('makeTransferThunk cross-chain', () => {
  it('fetches the SPV proof from the source chain and sends the continuation on the target chain', async () => {
    await runThunk(makeTransferThunk(crossChainPayload));

    expect(mocked.getSpvRequest).toHaveBeenCalledTimes(1);
    const spvArgs = mocked.getSpvRequest.mock.calls[0][0] as any;
    expect(spvArgs.sourceChainId).toBe('2');
    expect(JSON.parse(spvArgs.cmdValue)).toEqual({
      targetChainId: '1',
      requestKey: SOURCE_KEY,
    });

    expect(mocked.getContinuationTransferRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        pactId: SOURCE_KEY,
        proof: PROOF,
        targetChainId: '1',
        instance: 'mainnet01',
        version: '0.0',
      }),
    );

    expect(mocked.getSendRequest).toHaveBeenCalledTimes(2);
    const contSend = mocked.getSendRequest.mock.calls[1][0] as any;
    expect(contSend.sourceChainId).toBe('1');
    expect(JSON.parse(contSend.cmdValue)).toEqual({cmd: 'cont'});
  });

  it('ends with a successful transfer result and a successful History entry for the continuation', async () => {
    const {actions, history} = await runThunk(
      makeTransferThunk(crossChainPayload),
    );

    const results = transferResults(actions);
    expect(results[results.length - 1]).toEqual(
      expect.objectContaining({status: 'success', requestKey: CONT_KEY}),
    );

    const entries = history().activities;
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(
      expect.objectContaining({
        requestKey: CONT_KEY,
        sourceRequestKey: SOURCE_KEY,
        sourceChainId: '2',
        targetChainId: '1',
        status: 'success',
      }),
    );
  });

  it('keeps a finishable History entry when the proof never arrives', async () => {
    mocked.getSpvRequest.mockReset();
    mocked.getSpvRequest.mockRejectedValue(
      new Error('SPV target not reachable'),
    );

    const {actions, history} = await runThunk(
      makeTransferThunk(crossChainPayload),
    );

    expect(mocked.getSendRequest).toHaveBeenCalledTimes(1);
    const results = transferResults(actions);
    expect(results[results.length - 1].status).toBe('failure');

    const entries = history().activities;
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(
      expect.objectContaining({
        requestKey: SOURCE_KEY,
        sourceChainId: '2',
        targetChainId: '1',
        continuation: step0Continuation,
      }),
    );
    expect(canFinishCrossChainTransfer(entries[0])).toBe(true);
  });

  it('reports success when another party already completed the continuation', async () => {
    mocked.getSendRequest.mockReset();
    mocked.getSendRequest
      .mockResolvedValueOnce({requestKeys: [SOURCE_KEY]})
      .mockRejectedValueOnce(new Error(ALREADY_COMPLETED));

    const {actions, history} = await runThunk(
      makeTransferThunk(crossChainPayload),
    );

    const results = transferResults(actions);
    expect(results[results.length - 1]).toEqual(
      expect.objectContaining({status: 'success'}),
    );
    const entries = history().activities;
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(
      expect.objectContaining({requestKey: SOURCE_KEY, status: 'success'}),
    );
    expect(canFinishCrossChainTransfer(entries[0])).toBe(false);
  });

  it('does not run a continuation for a same-chain transfer', async () => {
    mocked.getPollRequest.mockImplementation(async ({requestKeys}: any) => ({
      [requestKeys[0]]: {
        reqKey: requestKeys[0],
        result: {status: 'success'},
        continuation: null,
      },
    }));
    const payload = {
      ...crossChainPayload,
      gatheredInfo: {
        ...crossChainPayload.gatheredInfo,
        destinationAccount: {accountName: 'k:receiver', chainId: '2'},
      },
    };

    const {history} = await runThunk(makeTransferThunk(payload));

    expect(mocked.getSimpleTransferRequest).toHaveBeenCalledTimes(1);
    expect(mocked.getSpvRequest).not.toHaveBeenCalled();
    expect(mocked.getSendRequest).toHaveBeenCalledTimes(1);
    expect(history().activities[0]).toEqual(
      expect.objectContaining({requestKey: SOURCE_KEY, status: 'success'}),
    );
  });
});

describe('finishTransferThunk', () => {
  it('finishes a stuck History entry using its stored continuation', async () => {
    mocked.getSendRequest.mockReset();
    mocked.getSendRequest.mockResolvedValue({requestKeys: [CONT_KEY]});
    const activity = {
      network,
      requestKey: SOURCE_KEY,
      createdTime: new Date().toISOString(),
      sourceChainId: '2',
      targetChainId: '1',
      sender: 'k:sender',
      receiver: 'k:receiver',
      status: 'success',
      coinShortName: 'KDA',
      amount: 0.5,
      type: 'TRANSFER',
      continuation: step0Continuation,
    } as unknown as TActivity;

    const {actions} = await runThunk(
      finishTransferThunk({networkDetail: network, activity}),
    );

    const spvArgs = mocked.getSpvRequest.mock.calls[0][0] as any;
    expect(spvArgs.sourceChainId).toBe('2');
    expect(mocked.getContinuationTransferRequest).toHaveBeenCalledWith(
      expect.objectContaining({pactId: SOURCE_KEY, targetChainId: '1'}),
    );
    expect((mocked.getSendRequest.mock.calls[0][0] as any).sourceChainId).toBe(
      '1',
    );
    const results = transferResults(actions);
    expect(results[results.length - 1].status).toBe('success');
  });

  it('marks a stuck entry done when the pact was already completed elsewhere', async () => {
    mocked.getSendRequest.mockReset();
    mocked.getSendRequest.mockRejectedValue(new Error(ALREADY_COMPLETED));
    const activity = {
      network,
      requestKey: SOURCE_KEY,
      createdTime: new Date().toISOString(),
      sourceChainId: '2',
      targetChainId: '1',
      sender: 'k:sender',
      receiver: 'k:receiver',
      status: 'success',
      coinShortName: 'KDA',
      amount: 0.5,
      type: 'TRANSFER',
      continuation: step0Continuation,
    } as unknown as TActivity;

    let historyState = historyReducer(undefined, {
      type: 'history/setSendResult',
      payload: activity,
    });
    const actions: any[] = [];
    const dispatch = jest.fn((action: any) => {
      if (typeof action !== 'function') {
        actions.push(action);
        if (String(action.type).startsWith('history/')) {
          historyState = historyReducer(historyState, action);
        }
      }
      return action;
    });
    await finishTransferThunk({networkDetail: network, activity})(
      dispatch,
      () => ({...initialState(), history: historyState}),
      undefined,
    );

    const results = transferResults(actions);
    expect(results[results.length - 1].status).toBe('success');
    expect(historyState.activities).toHaveLength(1);
    expect(canFinishCrossChainTransfer(historyState.activities[0])).toBe(
      false,
    );
  });
});

describe('canFinishCrossChainTransfer', () => {
  const base = {
    requestKey: SOURCE_KEY,
    sourceChainId: '2',
    targetChainId: '1',
    status: 'success',
  } as unknown as TActivity;

  it('is true for a transfer whose step 0 ran but step 1 did not', () => {
    expect(
      canFinishCrossChainTransfer({
        ...base,
        type: 'TRANSFER',
        continuation: step0Continuation,
      }),
    ).toBe(true);
    expect(
      canFinishCrossChainTransfer({...base, continuation: step0Continuation}),
    ).toBe(true);
  });

  it('is false once the continuation step ran, for swaps, failures and plain transfers', () => {
    expect(
      canFinishCrossChainTransfer({
        ...base,
        continuation: {...step0Continuation, step: 1},
      }),
    ).toBe(false);
    expect(
      canFinishCrossChainTransfer({
        ...base,
        type: 'SWAP',
        continuation: step0Continuation,
      }),
    ).toBe(false);
    expect(
      canFinishCrossChainTransfer({
        ...base,
        status: 'failure',
        continuation: step0Continuation,
      }),
    ).toBe(false);
    expect(canFinishCrossChainTransfer({...base, continuation: null})).toBe(
      false,
    );
  });
});

describe('history poll results', () => {
  it('keep the continuation of a polled transfer so it can be finished later', () => {
    const start = historyReducer(undefined, {type: '@@init'});
    const withEntry = historyReducer(start, {
      type: 'history/setSendResult',
      payload: {
        requestKey: SOURCE_KEY,
        sourceChainId: '2',
        targetChainId: '1',
        status: 'pending',
        type: 'TRANSFER',
        createdTime: new Date().toISOString(),
      },
    });
    const polled = historyReducer(withEntry, {
      type: fetchPollData.fulfilled.type,
      payload: [
        {
          [SOURCE_KEY]: {
            reqKey: SOURCE_KEY,
            result: {status: 'success'},
            continuation: step0Continuation,
          },
        },
      ],
    });

    expect(polled.activities[0].continuation).toEqual(step0Continuation);
    expect(canFinishCrossChainTransfer(polled.activities[0])).toBe(true);
  });

  it('do not reopen a transfer whose continuation already completed', () => {
    const start = historyReducer(undefined, {type: '@@init'});
    const finished = historyReducer(start, {
      type: 'history/setSendResult',
      payload: {
        requestKey: SOURCE_KEY,
        sourceChainId: '2',
        targetChainId: '1',
        status: 'success',
        type: 'TRANSFER',
        createdTime: new Date().toISOString(),
        continuation: {...step0Continuation, step: 1},
      },
    });
    // Polling the source request key always returns the step-0 continuation.
    const polled = historyReducer(finished, {
      type: fetchPollData.fulfilled.type,
      payload: [
        {
          [SOURCE_KEY]: {
            reqKey: SOURCE_KEY,
            result: {status: 'success'},
            continuation: step0Continuation,
          },
        },
      ],
    });

    expect(polled.activities[0].continuation?.step).toBe(1);
    expect(canFinishCrossChainTransfer(polled.activities[0])).toBe(false);
  });
});

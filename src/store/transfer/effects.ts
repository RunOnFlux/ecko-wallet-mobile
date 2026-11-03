import { AxiosError } from 'axios';

import {
  swapRequestError,
  swapRequestFulfilled,
  swapRequestPending,
} from './index';
import {
  TFinishTransferRequest,
  TGetTransferParams,
  TMakeTransferRequest,
  TSwapRequest,
} from './types';
import { setTransferResult } from './index';
import { wait } from '../../utils/hooksHelpers';
import {
  getContinuationTransferRequest,
  getCrossTransferRequest,
  getSendRequest,
  getSimpleTransferRequest,
  getSpvRequest,
  getPollRequest as getPollRequestAPI,
  swapApiRequest,
} from './services';
import { getNetworkParams } from '../../utils/networkHelpers';
import { replaceSendResult, setListenResult, setSendResult } from '../history';
import { getBalances } from '../userWallet/actions';
import { makeSelectActiveNetworkDetails } from '../networks/selectors';
import { makeSelectPollRequestParams } from '../history/selectors';
import { getPollRequest } from '../history/actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { TActivity } from '../history/types';
import { TNetworkDetail } from '../networks/types';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const makeTransferThunk = createAsyncThunk(
  'transfers/makeTransfer',
  async (payload: TMakeTransferRequest, { dispatch, getState }: any) => {
    const {
      gatheredInfo: {
        chainId: sourceChainId,
        destinationAccount,
        amount,
        predicate,
      },
      sourceAccount: { privateKey: signature, accountName: sender, publicKey },
      networkDetail,
      sourceToken,
      estimatedGasFee,
    } = payload;
    const { version, instance } = networkDetail;

    const isCrossTransfer = sourceChainId !== destinationAccount?.chainId;

    const getTransferCmd = () => {
      const transferParams: TGetTransferParams = {
        instance,
        version,
        sender,
        sourceChainId,
        predicate,
        receiverPublicKey: destinationAccount?.publicKey || undefined,
        targetChainId: destinationAccount?.chainId!,
        token: sourceToken?.tokenAddress || 'coin',
        gasLimit: estimatedGasFee?.gasLimit
          ? (Number(estimatedGasFee?.gasLimit) || 0).toFixed(2)
          : undefined,
        gasPrice: estimatedGasFee?.gasPrice
          ? (Number(estimatedGasFee?.gasPrice) || 0).toFixed(8)
          : undefined,
        receiver: destinationAccount!.accountName,
        publicKey,
        signature,
        amount,
        ...getNetworkParams(networkDetail),
        accountType: (payload?.sourceAccount as any)?.type,
      };

      return isCrossTransfer
        ? getCrossTransferRequest(transferParams)
        : getSimpleTransferRequest(transferParams);
    };

    try {
      const reqParams = {
        instance,
        version,
        sourceChainId,
        ...getNetworkParams(networkDetail),
      };

      let cmdValue = await getTransferCmd();

      const txRes = await getSendRequest({
        cmdValue: JSON.stringify(cmdValue),
        ...reqParams,
      });

      const reqKey = txRes.requestKeys[0];

      dispatch(
        setSendResult({
          amount,
          coinShortName:
            sourceToken?.tokenName || sourceToken?.tokenAddress || 'KDA',
          requestKey: reqKey,
          status: 'pending',
          createdTime: new Date().toISOString(),
          sender: sender,
          sourceChainId: sourceChainId,
          receiver: destinationAccount!.accountName,
          targetChainId: destinationAccount?.chainId!,
          type: 'TRANSFER',
          network: networkDetail,
        }),
      );
      dispatch(
        setTransferResult({
          message: 'Transfer Pending...',
          status: 'pending',
          date: new Date().toISOString(),
          network: networkDetail,
          requestKey: reqKey,
          sender,
          sourceChainId,
          receiver: destinationAccount!.accountName,
          targetChainId: destinationAccount?.chainId!,
        }),
      );

      let listenResult: any;
      let listenAttempt = 0;
      while (!listenResult && listenAttempt < 100) {
        await wait(10000);
        try {
          listenAttempt += 1;
          const pollApiResult = await getPollRequestAPI({
            requestKeys: [reqKey],
            ...reqParams,
            chainId: sourceChainId,
          });
          if (pollApiResult && pollApiResult[reqKey]) {
            listenResult = pollApiResult[reqKey];
          }
        } catch {}
      }

      if (!listenResult || listenResult.result?.status === 'failure') {
        dispatch(
          setSendResult({
            amount: amount,
            coinShortName:
              sourceToken?.tokenName || sourceToken?.tokenAddress || 'KDA',
            status: 'failure',
            createdTime: new Date().toISOString(),
            message: 'Transfer Failed',
            requestKey: reqKey,
            sender,
            sourceChainId,
            receiver: destinationAccount!.accountName,
            targetChainId: destinationAccount?.chainId!,
            type: 'TRANSFER',
            network: networkDetail,
          }),
        );
        dispatch(
          setTransferResult({
            status: 'failure',
            date: new Date().toISOString(),
            message: 'Transfer Failed',
            requestKey: reqKey,
            sender,
            sourceChainId,
            receiver: destinationAccount!.accountName,
            targetChainId: destinationAccount?.chainId!,
          }),
        );
        if (listenResult) dispatch(setListenResult(listenResult));
        return;
      }

      if (listenResult.continuation) {
        // Cross-chain: step 0 (burn) ran on the source chain. Store the
        // continuation on the History entry so it can be finished later,
        // then run step 1 on the target chain.
        const activity = {
          amount,
          coinShortName:
            sourceToken?.tokenName || sourceToken?.tokenAddress || 'KDA',
          requestKey: reqKey,
          status: 'pending',
          createdTime: new Date().toISOString(),
          sender,
          sourceChainId,
          receiver: destinationAccount!.accountName,
          targetChainId:
            listenResult.continuation?.yield?.provenance?.targetChainId ||
            destinationAccount?.chainId!,
          type: 'TRANSFER',
          network: networkDetail,
          continuation: listenResult.continuation,
        } as TActivity;
        dispatch(setSendResult(activity));
        await runCrossChainContinuation(
          dispatch,
          getState,
          networkDetail,
          activity,
        );
        return;
      }

      if (listenResult.result?.status === 'success') {
        dispatch(
          setSendResult({
            amount: amount,
            coinShortName:
              sourceToken?.tokenName || sourceToken?.tokenAddress || 'KDA',
            status: 'success',
            createdTime: new Date().toISOString(),
            message: 'Transfer Successful',
            requestKey: listenResult.reqKey,
            sender,
            sourceChainId,
            receiver: destinationAccount!.accountName,
            targetChainId: destinationAccount?.chainId!,
            type: 'TRANSFER',
            network: networkDetail,
          }),
        );

        dispatch(
          setTransferResult({
            status: 'success',
            date: new Date().toISOString(),
            message: 'Transfer Successful',
            requestKey: listenResult.reqKey,
            sender,
            sourceChainId,
            receiver: destinationAccount!.accountName,
            targetChainId: destinationAccount?.chainId!,
          }),
        );
        dispatch(setListenResult(listenResult));
      }

      const pollReqParams = makeSelectPollRequestParams(getState());
      dispatch(getPollRequest(pollReqParams));
      const selectedNetwork = makeSelectActiveNetworkDetails(getState());
      dispatch(
        getBalances({
          ...selectedNetwork,
          ...getNetworkParams(selectedNetwork as any),
        } as any),
      );
    } catch (err) {
      const error = err as AxiosError;
      dispatch(
        setSendResult({
          amount: amount,
          coinShortName:
            sourceToken?.tokenName || sourceToken?.tokenAddress || 'KDA',
          status: 'failure',
          createdTime: new Date().toISOString(),
          message: 'Transfer Failed',
          text: error?.response?.data || error?.message || '',
          requestKey: '',
          sender,
          sourceChainId,
          receiver: destinationAccount!.accountName,
          targetChainId: destinationAccount?.chainId!,
          type: 'TRANSFER',
          network: networkDetail,
        }),
      );
      dispatch(
        setTransferResult({
          status: 'failure',
          date: new Date().toISOString(),
          message: 'Transfer Failed',
          text: error?.response?.data || error?.message || '',
          requestKey: '',
          sender,
          sourceChainId,
          receiver: destinationAccount!.accountName,
          targetChainId: destinationAccount?.chainId!,
        }),
      );
    }
  },
);

const LOG_TAG = '[xchain]';

// Chainweb rejects a continuation whose pact step already ran, e.g. when a
// relayer finished the transfer first.
const isPactAlreadyCompleted = (err: unknown): boolean => {
  const error = err as AxiosError;
  const text = `${error?.message || ''} ${JSON.stringify(
    error?.response?.data ?? '',
  )}`;
  return text.includes('already-completed defpact');
};

const refreshAfterTransfer = (dispatch: any, getState: any) => {
  const pollReqParams = makeSelectPollRequestParams(getState());
  dispatch(getPollRequest(pollReqParams));
  const selectedNetwork = makeSelectActiveNetworkDetails(getState());
  dispatch(
    getBalances({
      ...selectedNetwork,
      ...getNetworkParams(selectedNetwork as any),
    } as any),
  );
};

// Step 1 of a cross-chain transfer: wait for the SPV proof of the step-0 burn
// on the source chain, then send the `continuation` on the target chain. The
// gas for it is paid by the xwallet-xchain-gas station (see
// getTransferContinuation). Used right after a cross-chain send and by the
// History "Finish" button for transfers whose continuation never ran.
export const runCrossChainContinuation = async (
  dispatch: any,
  getState: any,
  networkDetail: TNetworkDetail,
  activity: TActivity,
) => {
  const { version, instance } = networkDetail;
  const pactId = activity.continuation?.pactId || activity.requestKey;

  const reqParams = {
    instance,
    version,
    sourceChainId: activity.sourceChainId!,
    ...getNetworkParams(networkDetail),
  };

  try {
    console.log(
      `${LOG_TAG} waiting for SPV proof: pactId=${pactId} chain ${activity.sourceChainId} -> ${activity.targetChainId}`,
    );
    dispatch(
      setTransferResult({
        status: 'pending',
        date: new Date().toISOString(),
        message: `Initiated from the Source Chain: ${JSON.stringify(
          pactId,
        )}. Waiting for Proof...`,
        requestKey: activity.requestKey,
        sender: activity.sender,
        sourceChainId: activity.sourceChainId,
        receiver: activity.receiver,
        targetChainId: activity.targetChainId,
      }),
    );

    const spvCmd = {
      targetChainId: activity.targetChainId!,
      requestKey: pactId,
    };

    let proof: any = null;
    let proofAttempt = 0;
    while (!proof && proofAttempt < 100) {
      await wait(10000);
      try {
        proofAttempt++;
        const spvResultData = await getSpvRequest({
          ...reqParams,
          cmdValue: JSON.stringify(spvCmd),
          requestKey: activity.requestKey,
        });
        if (spvResultData) {
          proof = spvResultData;
        }
      } catch {}
    }

    if (!proof) {
      throw new Error('Waiting Proof failed with timeout');
    }
    console.log(
      `${LOG_TAG} SPV proof received after ${proofAttempt} attempt(s), sending continuation on chain ${activity.targetChainId}`,
    );

    let cmdValue = await getContinuationTransferRequest({
      instance,
      version,
      targetChainId: activity?.targetChainId!,
      proof,
      pactId,
      ...getNetworkParams(networkDetail),
    });

    await wait(30000);
    let txRes: any;
    try {
      txRes = await getSendRequest({
        cmdValue: JSON.stringify(cmdValue),
        ...reqParams,
        sourceChainId: activity.targetChainId!,
      });
    } catch (sendErr) {
      if (!isPactAlreadyCompleted(sendErr)) {
        throw sendErr;
      }
      // A relayer finished step 1 before us: the funds are on the target
      // chain, so this transfer is done.
      console.log(
        `${LOG_TAG} continuation for ${pactId} was already completed on chain ${activity.targetChainId}`,
      );
      dispatch(
        replaceSendResult({
          ...activity,
          status: 'success',
          continuation: activity.continuation && {
            ...activity.continuation,
            step: (activity.continuation.stepCount || 2) - 1,
          },
        }),
      );
      dispatch(
        setTransferResult({
          status: 'success',
          date: new Date().toISOString(),
          message: 'Transfer Successful',
          requestKey: pactId,
          sender: activity.sender,
          sourceChainId: activity.sourceChainId,
          receiver: activity.receiver,
          targetChainId: activity.targetChainId,
        }),
      );
      refreshAfterTransfer(dispatch, getState);
      return;
    }

    const reqKey = txRes.requestKeys[0];
    console.log(`${LOG_TAG} continuation sent: requestKey=${reqKey}`);
    const continuationEntry = {
      amount: activity.amount,
      requestKey: reqKey,
      sourceRequestKey: pactId,
      createdTime: new Date().toISOString(),
      sender: activity.sender,
      sourceChainId: activity.sourceChainId,
      receiver: activity.receiver,
      targetChainId: activity.targetChainId,
      coinShortName: activity.coinShortName,
      type: 'TRANSFER',
      network: networkDetail,
    };
    dispatch(replaceSendResult({ ...continuationEntry, status: 'pending' }));

    dispatch(
      setTransferResult({
        status: 'pending',
        message: `Initiated from the Source Chain: ${JSON.stringify(
          pactId,
        )}. Receiving from the Target Chain: ${reqKey}`,
        date: new Date().toISOString(),
        requestKey: reqKey,
        sender: activity.sender,
        sourceChainId: activity.sourceChainId,
        receiver: activity.receiver,
        targetChainId: activity.targetChainId,
      }),
    );

    let listenResult: any;
    let listenAttempt = 0;
    while (!listenResult && listenAttempt < 100) {
      await wait(10000);
      try {
        listenAttempt++;
        const pollApiResult = await getPollRequestAPI({
          requestKeys: [reqKey],
          ...reqParams,
          chainId: activity.targetChainId!,
        });
        if (pollApiResult && pollApiResult[reqKey]) {
          listenResult = pollApiResult[reqKey];
        }
      } catch {}
    }

    if (!listenResult) {
      throw new Error('Getting transaction result failed with timeout');
    }

    const isSuccess =
      listenResult?.result?.status === 'success' ||
      !!listenResult?.result?.error?.message?.includes(
        'resumePact: pact completed:',
      );
    console.log(
      `${LOG_TAG} continuation ${reqKey} result: ${
        isSuccess ? 'success' : 'failure'
      }`,
    );
    dispatch(
      setSendResult({
        ...continuationEntry,
        status: isSuccess ? 'success' : 'failure',
      }),
    );

    if (listenResult?.result?.status === 'failure') {
      if (
        listenResult?.result?.error?.message?.includes(
          'resumePact: pact completed:',
        )
      ) {
        dispatch(
          setTransferResult({
            status: 'success',
            date: new Date().toISOString(),
            message: 'Transfer Successful',
            requestKey: listenResult.reqKey,
            sender: activity.sender,
            sourceChainId: activity.sourceChainId,
            receiver: activity.receiver,
            targetChainId: activity.targetChainId,
          }),
        );
        dispatch(
          setListenResult({
            ...listenResult,
            result: {
              ...listenResult,
              status: 'success',
            },
          }),
        );
      } else {
        dispatch(
          setTransferResult({
            status: 'failure',
            date: new Date().toISOString(),
            message: 'Transfer Failed',
            requestKey: listenResult.reqKey,
            sender: activity.sender,
            sourceChainId: activity.sourceChainId,
            receiver: activity.receiver,
            targetChainId: activity.targetChainId,
          }),
        );
        dispatch(setListenResult(listenResult));
      }
    } else if (listenResult?.result?.status === 'success') {
      dispatch(
        setTransferResult({
          status: 'success',
          date: new Date().toISOString(),
          message: 'Transfer Successful',
          requestKey: listenResult.reqKey,
          sender: activity.sender,
          sourceChainId: activity.sourceChainId,
          receiver: activity.receiver,
          targetChainId: activity.targetChainId,
        }),
      );
      dispatch(setListenResult(listenResult));
    } else {
      dispatch(
        setTransferResult({
          status: 'failure',
          date: new Date().toISOString(),
          message: 'Transfer Failed',
          requestKey: reqKey,
          sender: activity.sender,
          sourceChainId: activity.sourceChainId,
          receiver: activity.receiver,
          targetChainId: activity.targetChainId,
        }),
      );
    }

    refreshAfterTransfer(dispatch, getState);
  } catch (err) {
    const error = err as AxiosError;
    console.warn(
      `${LOG_TAG} continuation for ${pactId} did not finish: ${
        error?.message || ''
      }`,
    );
    dispatch(
      setTransferResult({
        status: 'failure',
        date: new Date().toISOString(),
        message: 'Transfer Failed',
        text: error?.response?.data || error?.message || '',
        requestKey: '',
        sender: activity.sender,
        sourceChainId: activity.sourceChainId,
        receiver: activity.receiver,
        targetChainId: activity.targetChainId,
      }),
    );
  }
};

export const finishTransferThunk = createAsyncThunk(
  'transfers/finishTransfer',
  async (payload: TFinishTransferRequest, { dispatch, getState }: any) => {
    const { networkDetail, activity } = payload;
    await runCrossChainContinuation(
      dispatch,
      getState,
      networkDetail,
      activity,
    );
  },
);

export const swapRequestThunk = createAsyncThunk(
  'transfers/swapRequest',
  async (payload: TSwapRequest, { dispatch, getState }: any) => {
    dispatch(swapRequestPending());
    try {
      const txRes = await swapApiRequest(payload);

      dispatch(
        setSendResult({
          amount: 0,
          coinShortName: '',
          amountFrom: payload.token0Amount,
          amountTo: payload.token1Amount,
          tokenAddressFrom: payload.token0Address,
          tokenAddressTo: payload.token1Address,
          coinFrom: payload.token0Coin,
          coinTo: payload.token1Coin,
          requestKey: txRes.requestKeys[0],
          status: 'pending',
          createdTime: new Date().toISOString(),
          sender: '',
          sourceChainId: payload.chainId,
          receiver: '',
          targetChainId: payload.chainId,
          type: 'SWAP',
        }),
      );

      let listenResult: any;
      let listenAttempt = 0;
      while (!listenResult && listenAttempt < 100) {
        await wait(10000);
        try {
          listenAttempt++;
          const pollApiResult = await getPollRequestAPI({
            requestKeys: [txRes.requestKeys[0]],
            ...payload,
          });
          if (pollApiResult && pollApiResult[txRes.requestKeys[0]]) {
            listenResult = pollApiResult[txRes.requestKeys[0]];
          }
        } catch {}
      }

      if (!listenResult) {
        throw new Error('Getting transaction result failed with timeout');
      }

      dispatch(setListenResult(listenResult));
      const pollReqParams = makeSelectPollRequestParams(getState());
      dispatch(getPollRequest(pollReqParams));
      const selectedNetwork = makeSelectActiveNetworkDetails(getState());
      dispatch(
        getBalances({
          ...selectedNetwork,
          ...getNetworkParams(selectedNetwork as any),
        } as any),
      );

      dispatch(swapRequestFulfilled());
    } catch {
      dispatch(swapRequestError());
    }
  },
);

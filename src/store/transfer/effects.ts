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
        } catch (e) {}
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

export const finishTransferThunk = createAsyncThunk(
  'transfers/finishTransfer',
  async (payload: TFinishTransferRequest, { dispatch, getState }: any) => {
    const { networkDetail, activity } = payload;
    const { version, instance } = networkDetail;

    const reqParams = {
      instance,
      version,
      sourceChainId: activity.sourceChainId!,
      ...getNetworkParams(networkDetail),
    };

    try {
      dispatch(
        setTransferResult({
          status: 'pending',
          date: new Date().toISOString(),
          message: `Initiated from the Source Chain: ${JSON.stringify(
            activity.continuation.pactId! || activity.requestKey,
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
        requestKey: activity.continuation.pactId! || activity.requestKey,
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
        } catch (e) {}
      }

      if (!proof) {
        throw new Error('Waiting Proof failed with timeout');
      }

      let cmdValue = await getContinuationTransferRequest({
        instance,
        version,
        targetChainId: activity?.targetChainId!,
        proof,
        pactId: activity?.continuation?.pactId!,
        ...getNetworkParams(networkDetail),
      });

      await wait(30000);
      const txRes = await getSendRequest({
        cmdValue: JSON.stringify(cmdValue),
        ...reqParams,
        sourceChainId: activity.targetChainId!,
      });

      const reqKey = txRes.requestKeys[0];
      dispatch(
        replaceSendResult({
          amount: activity.amount,
          requestKey: reqKey,
          sourceRequestKey:
            activity.continuation.pactId! || activity.requestKey,
          status: 'pending',
          createdTime: new Date().toISOString(),
          sender: activity.sender,
          sourceChainId: activity.sourceChainId,
          receiver: activity.receiver,
          targetChainId: activity.targetChainId,
          coinShortName: activity.coinShortName,
        }),
      );

      dispatch(
        setTransferResult({
          status: 'pending',
          message: `Initiated from the Source Chain: ${JSON.stringify(
            activity?.continuation?.pactId! || activity.requestKey,
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
        } catch (e) {}
      }

      if (!listenResult) {
        throw new Error('Getting transaction result failed with timeout');
      }

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
        } catch (e) {}
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
    } catch (err) {
      dispatch(swapRequestError());
    }
  },
);

import {TActivity} from './types';

type TContinuation = TActivity['continuation'];

// The further-along of two continuations of the same pact.
export const laterContinuation = (
  stored: TContinuation,
  polled: TContinuation,
): TContinuation => {
  if (!polled) {
    return stored;
  }
  if (!stored) {
    return polled;
  }
  return (stored.step || 0) > (polled.step || 0) ? stored : polled;
};

// A cross-chain transfer whose burn (step 0) ran on the source chain but whose
// continuation on the target chain has not: History offers "Finish" for it.
export const canFinishCrossChainTransfer = (
  activity: Pick<TActivity, 'type' | 'status' | 'continuation'>,
): boolean => {
  const {type, status, continuation} = activity;
  if (type === 'SWAP' || status === 'failure' || !continuation?.pactId) {
    return false;
  }
  return (continuation.step || 0) < (continuation.stepCount || 0) - 1;
};

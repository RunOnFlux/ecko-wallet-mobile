import {createAsyncThunk} from '@reduxjs/toolkit';
import {TPollRequestParams} from './types';
import {setGetPollError, setGetPollLoading, setGetPollSuccess} from './index';
import {getPoll} from '../../api/kadena/poll';

export const fetchPollData = createAsyncThunk<
  any[],
  TPollRequestParams[],
  {rejectValue: any}
>('history/fetchPollData', async (payload, {dispatch, rejectWithValue}) => {
  try {
    dispatch(setGetPollLoading(true));

    const responses = await Promise.all(payload.map(getPoll as any));
    dispatch(setGetPollSuccess(responses));

    return responses;
  } catch (e) {
    dispatch(setGetPollError(e));
    return rejectWithValue(e);
  } finally {
    dispatch(setGetPollLoading(false));
  }
});

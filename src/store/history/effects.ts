import {createAsyncThunk} from '@reduxjs/toolkit';
import {TPollRequestParams, TPollResp} from './types';
import {getPoll} from '../../api/kadena/poll';

export const fetchPollData = createAsyncThunk<
  TPollResp[],
  TPollRequestParams[],
  {rejectValue: any}
>('history/fetchPollData', async (payload, {rejectWithValue}): Promise<any> => {
  try {
    const responses = await Promise.all(payload.map(getPoll as any));
    return responses;
  } catch (e) {
    return rejectWithValue(e);
  } finally {
    //
  }
});

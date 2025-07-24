import {createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

import {
  setNetworkDetailsError,
  setNetworkDetailsLoading,
  setNetworkDetailsSuccess,
} from './index';
import {TNetwork} from '../../screens/Networks/components/Item/types';
import {TNetworkDetail} from './types';

export const fetchNetworkDetails = createAsyncThunk<
  TNetworkDetail,
  TNetwork,
  {rejectValue: any}
>(
  'networks/fetchNetworkDetails',
  async (payload, {dispatch, rejectWithValue}) => {
    dispatch(setNetworkDetailsLoading(true));

    try {
      const {
        data: {nodeApiVersion, nodeVersion, nodeChains},
      } = await axios.get(`${payload.host}/info`);

      const {data} = await axios.get(
        `${payload.host}/chainweb/${nodeApiVersion}/${nodeVersion}/cut`,
      );

      const resp: TNetworkDetail = {
        ...payload,
        ...data,
        instance: nodeVersion,
        version: nodeApiVersion,
        chainIds: nodeChains,
      };

      dispatch(setNetworkDetailsSuccess(resp));
      return resp;
    } catch (err) {
      dispatch(setNetworkDetailsError(err));
      return rejectWithValue(err);
    } finally {
      dispatch(setNetworkDetailsLoading(false));
    }
  },
);

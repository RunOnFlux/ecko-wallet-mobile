import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const walletConnectSchema = yupResolver(
  yup
    .object({
      projectId: yup.string().required(),
      relayUrl: yup.string().required(),
    })
    .required(),
);

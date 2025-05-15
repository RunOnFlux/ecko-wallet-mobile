import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const addCreateNetworkSchema = yupResolver(
  yup
    .object({
      name: yup.string(),
      host: yup.string().required(),
      explorerUrl: yup.string().required(),
    })
    .required(),
);

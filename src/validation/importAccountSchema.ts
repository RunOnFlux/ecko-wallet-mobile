import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const importAccountSchema = yupResolver(
  yup
    .object({
      accountName: yup.string().required(),
      chainId: yup.string().required(),
      privateKey: yup.string().required(),
    })
    .required(),
);

import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const addCreateContactSchema = yupResolver(
  yup
    .object({
      contactName: yup.string().required(),
      accountName: yup.string().required(),
      chainId: yup.string().required(),
    })
    .required(),
);

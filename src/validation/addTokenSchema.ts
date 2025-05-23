import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const addTokenSchema = yupResolver(
  yup
    .object({
      tokenAddress: yup.string().required(),
      tokenName: yup.string().required(),
    })
    .required(),
);

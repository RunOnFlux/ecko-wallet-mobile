import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const recoverAccountSchema = yupResolver(
  yup
    .object({
      seeds: yup.string().required(),
      accountIndex: yup.number(),
    })
    .required(),
);

import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const exportRecoveryPhraseSchema = yupResolver(
  yup
    .object({
      password: yup.string().required(),
    })
    .required(),
);

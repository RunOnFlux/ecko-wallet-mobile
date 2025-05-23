import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const verifyRecoveryPhraseSchema = yupResolver(
  yup
    .object({
      input1: yup.string().required(),
      input2: yup.string().required(),
      input3: yup.string().required(),
      input4: yup.string().required(),
      input5: yup.string().required(),
      input6: yup.string().required(),
      input7: yup.string().required(),
      input8: yup.string().required(),
      input9: yup.string().required(),
      input10: yup.string().required(),
      input11: yup.string().required(),
      input12: yup.string().required(),
    })
    .required(),
);

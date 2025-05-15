import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const estimatedGasFeeSchema = yupResolver(
  yup.object({
    speed: yup.string(),
    gasLimit: yup.number().required(),
    gasPrice: yup.number().required(),
  }),
);

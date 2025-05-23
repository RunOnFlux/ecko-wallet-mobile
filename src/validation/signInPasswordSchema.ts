import {yupResolver} from '@hookform/resolvers/yup';
import {TFunction} from 'i18next';
import * as yup from 'yup';

export const signInPasswordSchema = (t: TFunction<'translation', undefined>) =>
  yupResolver(
    yup
      .object({
        password: yup
          .string()
          .required()
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
            t('validation.passwordComplexity'),
          ),
      })
      .required(),
  );

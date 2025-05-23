import {yupResolver} from '@hookform/resolvers/yup';
import {TFunction} from 'i18next';
import * as yup from 'yup';

export const resetAccountPassword = (t: TFunction<'translation', undefined>) =>
  yupResolver(
    yup
      .object({
        currentPassword: yup.string().required(),
        newPassword: yup
          .string()
          .required()
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
            t('validation.passwordComplexity'),
          ),
        confirmPassword: yup
          .string()
          .required()
          .oneOf(
            [yup.ref('newPassword'), null],
            t('validation.passwordsMatch'),
          ),
      })
      .required(),
  );

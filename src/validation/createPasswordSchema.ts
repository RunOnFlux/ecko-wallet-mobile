import {yupResolver} from '@hookform/resolvers/yup';
import {TFunction} from 'i18next';
import * as yup from 'yup';

export const createPasswordSchema = (t: TFunction<'translation', undefined>) =>
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
        confirmPassword: yup
          .string()
          .required()
          .test(
            'passwordMatch',
            t('validation.passwordsMatch'),
            function (value) {
              return value === this.parent.password;
            },
          ),
      })
      .required(),
  );

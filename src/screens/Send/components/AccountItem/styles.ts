import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    accountLabel: {
      marginLeft: 12,
      color: theme.text.primary,
    },
    noBorder: {borderTopWidth: 0},
  });

import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../../../themes/types';
import {
  BOLD_MONTSERRAT,
  MEDIUM_MONTSERRAT,
} from '../../../../../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    leftSide: {
      flex: 1,
      marginRight: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      flex: 1,
      marginLeft: 12,
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
      color: theme.text.primary,
    },
    currency: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.secondary,
    },
  });

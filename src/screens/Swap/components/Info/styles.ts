import {StyleSheet} from 'react-native';
import {
  REGULAR_MONTSERRAT,
  SEMI_BOLD_MONTSERRAT,
} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: 12,
    },
    item: {
      marginVertical: 8,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      color: theme.error.color,
    },
    title: {
      fontFamily: SEMI_BOLD_MONTSERRAT,
      fontSize: 14,
      marginRight: 12,
      color: theme.text.primary,
    },
    text: {
      fontFamily: REGULAR_MONTSERRAT,
      fontSize: 14,
      color: theme.text.secondary,
    },
  });

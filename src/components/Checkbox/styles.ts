import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    textStyle: {
      textDecorationLine: 'none',
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    textContainerStyle: {
      marginLeft: 8,
      width: '90%',
    },
    iconStyle: {
      borderColor: theme.border,
    },
  });

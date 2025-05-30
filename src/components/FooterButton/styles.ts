import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    btn: {
      backgroundColor: theme.brand,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 28,
      borderRadius: 25,
    },
    disabledBtn: {
      backgroundColor: theme.surface,
    },
    text: {
      color: theme.text.primary,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
    },
  });

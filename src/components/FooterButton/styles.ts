import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    btn: {
      backgroundColor: theme.button.primary,
      color: 'white',
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
      color: 'white',
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
    },
  });

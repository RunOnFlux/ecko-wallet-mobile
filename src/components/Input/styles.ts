import {StyleSheet} from 'react-native';
import {MAIN_COLOR, MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    label: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    inputStyle: {
      backgroundColor: theme.input.background,
      paddingTop: 14,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 16,
      borderRadius: 10,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    error: {
      fontFamily: MEDIUM_MONTSERRAT,
      marginTop: 4,
      color: 'red',
    },
  });

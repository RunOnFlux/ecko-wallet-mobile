import {StyleSheet} from 'react-native';
import {
  BOLD_MONTSERRAT,
  MEDIUM_MONTSERRAT,
  REGULAR_MONTSERRAT,
} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingHorizontal: 32,
    },
    label: {
      fontFamily: BOLD_MONTSERRAT,
      color: '#959AB3',
      marginLeft: 16,
      marginTop: 10,
      textTransform: 'uppercase',
      fontWeight: '700',
      fontSize: 12,
    },
    inputContainer: {
      flexDirection: 'row',
      marginTop: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    input: {
      width: '100%',
      fontFamily: REGULAR_MONTSERRAT,
      color: theme.text.primary,
      paddingVertical: 0,
      paddingLeft: 0,
      paddingRight: 56,
    },
    secureIcon: {
      position: 'absolute',
      right: 0,
    },
    error: {
      fontFamily: MEDIUM_MONTSERRAT,
      marginTop: 2,
      marginLeft: 16,
      marginBottom: 10,
      color: theme.error.color,
    },
  });

import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../constants/styles';
import {IAppTheme} from '../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    button: {
      height: 48,
      flex: 1,
      backgroundColor: theme.button.secondary,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeButton: {
      backgroundColor: theme.button.primary,
    },
    text: {
      textAlign: 'center',
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 14,
      color: 'white',
    },
    activeText: {
      color: 'white',
    },
  });

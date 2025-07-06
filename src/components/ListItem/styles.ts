import {StyleSheet} from 'react-native';
import {SEMI_BOLD_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontFamily: SEMI_BOLD_MONTSERRAT,
      fontWeight: '600',
      fontSize: 14,
      color: theme.text.secondary,
      marginLeft: 10,
    },
  });

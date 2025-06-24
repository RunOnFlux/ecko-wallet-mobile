import {StyleSheet} from 'react-native';
import {BOLD_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      flexDirection: 'column',
      paddingTop: 20,
    },
    text: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
  });

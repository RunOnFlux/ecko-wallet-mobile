import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      marginTop: 12,
      paddingHorizontal: 20,
    },
    title: {
      marginLeft: 3,
      marginBottom: 4,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
      color: theme.text.primary,
    },
  });

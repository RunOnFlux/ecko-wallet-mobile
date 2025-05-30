import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      backgroundColor: theme.background,
    },
    listWrapper: {
      width: '100%',
      paddingBottom: 20,
      paddingHorizontal: 24,
    },
  });

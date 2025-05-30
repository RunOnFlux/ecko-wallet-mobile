import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.background,
    },
    scroll: {
      flex: 1,
      width: '100%',
    },
    content: {
      alignItems: 'center',
      width: '100%',
    },
  });

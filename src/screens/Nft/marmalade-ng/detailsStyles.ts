import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
      paddingBottom: 24,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    emptyWrapper: {
      width: '100%',
      alignItems: 'center',
      marginTop: 40,
    },
    emptyText: {
      color: theme.text.secondary,
      fontSize: 13,
    },
  });

import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';
import {BOLD_MONTSERRAT} from '../../constants/styles';

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
    title: {
      color: theme.text.primary,
      fontSize: 18,
      fontFamily: BOLD_MONTSERRAT,
      textTransform: 'uppercase',
      marginBottom: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    loading: {
      marginTop: 40,
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

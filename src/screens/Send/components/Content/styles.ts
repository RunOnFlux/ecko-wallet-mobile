import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    contentWrapper: {
      marginTop: 20,
      paddingBottom: 8,
      marginBottom: 8,
      paddingLeft: 20,
      paddingRight: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    text: {
      fontSize: 12,
      color: theme.text.secondary,
    },
    headerTitle: {
      marginLeft: 3,
      marginBottom: 4,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
      color: theme.text.primary,
    },
    itemWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      marginLeft: 2,
      paddingBottom: 8,
      marginRight: 8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    kda: {
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    usd: {
      textTransform: 'uppercase',
      fontWeight: '600',
      marginLeft: 8,
      color: theme.text.secondary,
    },
    leftText: {
      fontWeight: '700',
      fontSize: 10,
      color: theme.text.secondary,
    },
    bottomHeaderWrapper: {
      marginTop: 24,
      marginBottom: 18,
    },
  });

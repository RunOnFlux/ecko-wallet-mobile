import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    contentWrapper: {
      marginTop: 22,
      marginRight: 11,
      marginLeft: 28,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    text: {
      fontSize: 12,
      textTransform: 'uppercase',
      color: theme.text.secondary,
    },
    headerTitle: {
      fontSize: 12,
      fontWeight: '700',
      fontFamily: MEDIUM_MONTSERRAT,
      color: theme.text.primary,
    },
    itemWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 13,
      paddingBottom: 18,
      marginRight: 17,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(223,223,237,0.5)',
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

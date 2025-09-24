import { StyleSheet } from 'react-native';
import { MEDIUM_MONTSERRAT } from '../../constants/styles';
import { IAppTheme } from '../../themes/types';

export const makeStyles = (
  theme: IAppTheme,
  {
    bottomSpace,
    statusBarHeight,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    topHeaderContent: {
      marginTop: 12,
      marginBottom: 24,
      paddingHorizontal: 20,
      width: '100%',
    },
    contentWrapper: {
      width: '100%',
      flex: 1,
    },
    content: {
      width: '100%',
    },
    footer: {
      paddingTop: 16,
      marginBottom: bottomSpace + 16,
      width: '100%',
    },
    margin: {
      width: '100%',
      height: 20,
      marginBottom: 24,
      borderBottomColor: theme.surface,
      borderBottomWidth: 1,
    },
    chainWrapper: {
      zIndex: 9,
    },
    chainSecondWrapper: {
      zIndex: 8,
    },
    balanceContainer: {
      marginTop: 16,
      flexDirection: 'column',
    },
    balanceLabel: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    balanceText: {
      backgroundColor: theme.input.background,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
      overflow: 'hidden',
    },
    warning: {
      marginHorizontal: 20,
      marginBottom: 12,
    },
  });

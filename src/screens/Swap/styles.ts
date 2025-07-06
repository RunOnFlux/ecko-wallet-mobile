import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const createStyles = (
  theme: IAppTheme,
  {
    statusBarHeight,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    screen: {
      flexDirection: 'column',
      flex: 1,
      paddingTop: statusBarHeight,
      backgroundColor: theme.background,
    },
    scroll: {
      flex: 1,
      width: '100%',
    },
    content: {
      paddingTop: 24,
      paddingBottom: 16,
      width: '100%',
      paddingHorizontal: 15,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 16,
      paddingTop: 16,
      backgroundColor: theme.surface,
      paddingHorizontal: 10,
    },
    title: {
      textAlign: 'center',
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 14,
      color: theme.text.primary,
    },
    gasButton: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      shadowColor: theme.shadow.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsButton: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      shadowColor: theme.shadow.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

import {Dimensions, StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

const windowHeight = Dimensions.get('window').height;

export const makeStyles = (
  theme: IAppTheme,
  {
    statusBarHeight,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: statusBarHeight,
      backgroundColor: theme.surface,
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 80,
      width: '100%',
      textAlign: 'center',
    },
    emptyText: {
      marginTop: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      textAlign: 'center',
      color: theme.text.secondary,
    },
    connectButton: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      ...theme.shadow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    connectIcon: {
      width: 28,
      height: 28,
      tintColor: theme.text.primary,
    },
    infoButton: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      ...theme.shadow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoIcon: {
      width: 24,
      height: 24,
      tintColor: theme.text.primary,
    },
    infoModalStyle: {
      minHeight: windowHeight * 0.4 - 48,
    },
  });

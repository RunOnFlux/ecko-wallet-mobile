import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';

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
      alignItems: 'center',
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
    },
    content: {
      width: '100%',
      paddingTop: statusBarHeight,
      paddingHorizontal: 24,
    },
    footer: {
      marginTop: 24,
      borderTopColor: theme.border,
      borderTopWidth: 1,
      borderStyle: 'solid',
      paddingTop: 48,
      width: '100%',
      paddingHorizontal: 24,
    },
    icon: {
      width: 24,
      height: 24,
      tintColor: theme.text.primary,
    },
  });

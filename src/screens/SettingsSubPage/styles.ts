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
    container: {
      flex: 1,
      paddingTop: statusBarHeight,
      backgroundColor: theme.background,
    },
    backBtnWrapper: {
      position: 'absolute',
      left: 14,
      top: 16,
    },
    header: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 18,
      color: theme.text.primary,
    },
    scroll: {
      flex: 1,
      width: '100%',
    },
    content: {
      paddingHorizontal: 20,
      width: '100%',
    },
  });

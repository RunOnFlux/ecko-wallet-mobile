import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme, statusBarHeight: number) =>
  StyleSheet.create({
    header: {
      width: '100%',
      paddingTop: statusBarHeight + 16,
      paddingBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backBtnWrapper: {
      position: 'absolute',
      left: 14,
      top: statusBarHeight + 16,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 18,
      color: theme.text.primary,
    },
  });

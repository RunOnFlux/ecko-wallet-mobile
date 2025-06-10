import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

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
    header: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 12,
      marginTop: statusBarHeight,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 18,
      color: theme.text.primary,
    },
  });

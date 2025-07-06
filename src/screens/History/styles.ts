import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const createStyles = ({
  statusBarHeight,
  theme,
}: {
  bottomSpace: number;
  statusBarHeight: number;
  theme: IAppTheme;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: statusBarHeight,
      backgroundColor: theme.background,
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      width: '100%',
      textAlign: 'center',
    },
    emptyText: {
      marginTop: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      textAlign: 'center',
      color: theme.text.secondary,
    },
  });

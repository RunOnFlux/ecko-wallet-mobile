import {StyleSheet} from 'react-native';
import {isIos} from '../../constants';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const createStyles = (
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
    screen: {
      flex: 1,
      width: '100%',
      paddingTop: statusBarHeight,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    camera: {
      flex: 1,
      width: '100%',
    },
    footer: {
      borderTopWidth: 1,
      width: '100%',
      paddingTop: 16,
      paddingBottom: bottomSpace + 16,
      borderTopColor: theme.border,
    },
    inputContainer: {
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: 19,
    },
    inputSection: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isIos ? 13 : 3,
      paddingLeft: 4,
      paddingRight: 4,
      backgroundColor: theme.input.background,
      borderRadius: 10,
    },
    input: {
      paddingHorizontal: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.input.color,
      width: '100%',
    },
    footerButton: {
      marginTop: 16,
      marginHorizontal: 19,
    },
  });

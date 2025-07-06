import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';

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
    header: {
      paddingTop: statusBarHeight + 16,
      paddingBottom: 16,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
      zIndex: 10,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 60,
      paddingLeft: 12,
      paddingRight: 4,
      paddingVertical: 5,
      backgroundColor: theme.surface,
    },
    accountButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonText: {
      marginRight: 16,
      color: theme.text.primary,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
    },
    rightSide: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      marginLeft: 8,
    },
    dropdownContainer: {
      width: 170,
    },
  });

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
      paddingTop: statusBarHeight,
      flex: 1,
      backgroundColor: theme.background,
    },
    form: {
      borderRadius: 10,
      paddingHorizontal: 15,
    },
    backBtnWrapper: {
      position: 'absolute',
      left: 14,
      top: 16,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 18,
      color: theme.text.primary,
    },
    password: {
      marginTop: 24,
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      borderRadius: 10,
      paddingHorizontal: 0,
      backgroundColor: theme.input.background,
    },
    resetBtn: {
      width: '90%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 15,
      backgroundColor: 'rgb(159,1,37)',
      borderRadius: 10,
      marginTop: 20,
      marginHorizontal: 20,
    },
    btnText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.background,
      fontFamily: MEDIUM_MONTSERRAT,
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
    inputContainer: {
      marginTop: 8,
    },
    input: {
      backgroundColor: theme.input.background,
      paddingTop: 14,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 16,
      borderRadius: 10,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.input.color,
    },
    icon: {
      right: 16,
    },
    footer: {
      position: 'absolute',
      bottom: 50,
      width: '100%',
      paddingHorizontal: 20,
    },
    footerBtn: {
      marginHorizontal: 0,
    },
  });

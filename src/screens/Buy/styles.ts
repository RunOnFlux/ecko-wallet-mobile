import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const createStyles = (
  theme: IAppTheme,
  {
    bottomSpace,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: bottomSpace,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
    },
    backButton: {
      fontSize: 16,
      color: theme.brand,
    },
    webview: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    consentContainer: {
      flex: 1,
      padding: 20,
      justifyContent: 'space-between',
    },
    consentText: {
      fontSize: 16,
      lineHeight: 24,
      marginTop: 20,
      fontFamily: MEDIUM_MONTSERRAT,
      textAlign: 'center',
      color: theme.text.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    cancelButtonStyle: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.shadow.shadowColor,
    },
    confirmButtonStyle: {
      backgroundColor: theme.brand,
      color: '#fff',
    },
    cancelButtonText: {
      color: theme.text.primary,
      fontWeight: '600',
    },
    confirmButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    errorText: {
      color: theme.error.color,
      marginTop: 10,
      textAlign: 'center',
      padding: 10,
    },
    cancelButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: theme.surface,
      borderRadius: 5,
    },
    header: {
      display: 'flex',
      width: '100%',
      paddingTop: 16,
      paddingBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(223,223,237,0.5)',
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
  });

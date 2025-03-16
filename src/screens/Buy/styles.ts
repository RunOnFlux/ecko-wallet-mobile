import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';

export const createStyles = ({
  statusBarHeight,
}: {
  bottomSpace: number;
  statusBarHeight: number;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    backButton: {
      fontSize: 16,
      color: '#46de8c',
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
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    cancelButtonStyle: {
      backgroundColor: '#f0f0f0',
      borderWidth: 1,
      borderColor: '#ddd',
    },
    confirmButtonStyle: {
      backgroundColor: '#46de8c',
    },
    cancelButtonText: {
      color: '#333',
      fontWeight: '600',
    },
    confirmButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    errorText: {
      color: 'red',
      marginTop: 10,
      textAlign: 'center',
      padding: 10,
    },
    cancelButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 5,
    },
    header: {
      display: 'flex',
      width: '100%',
      paddingTop: 16,
      paddingBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
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
      color: 'black',
    },
  });

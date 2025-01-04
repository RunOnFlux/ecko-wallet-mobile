import {StyleSheet} from 'react-native';
import {
  BOLD_MONTSERRAT,
  MEDIUM_MONTSERRAT,
  REGULAR_MONTSERRAT,
} from '../../constants/styles';

export const createStyles = ({
  bottomSpace,
}: {
  bottomSpace: number;
  statusBarHeight: number;
}) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
      paddingBottom: bottomSpace,
    },
    content: {
      width: '100%',
      alignItems: 'center',
    },
    container: {
      flex: 1,
    },
    contentWrapper: {
      width: '100%',
    },
    contentContainer: {
      alignItems: 'center',
      width: '100%',
      paddingTop: 32,
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    accountView: {
      borderTopWidth: 1,
      paddingBottom: 16,
      borderTopColor: 'rgba(223,223,237,0.5)',
    },
    warning: {
      paddingTop: 12,
      paddingHorizontal: 12,
    },
    svgWrapper: {
      height: 200,
      width: 200,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: 100,
      shadowColor: 'black',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    sendImage: {
      height: 200,
      width: 200,
      borderRadius: 100,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 45,
      color: 'black',
      marginTop: 40,
      marginBottom: 12,
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: '#787B8E',
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    transferResult: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: 'black',
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: 20,
      marginTop: 32,
      marginBottom: 4,
    },
    transferResultValue: {
      fontFamily: REGULAR_MONTSERRAT,
      fontWeight: '400',
      fontSize: 18,
      color: 'black',
      paddingHorizontal: 20,
      textAlign: 'center',
      width: '100%',
    },
    transferText: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: 'black',
      paddingHorizontal: 20,
      textAlign: 'center',
      width: '100%',
      marginTop: 24,
      marginBottom: 4,
    },
    transferTextValue: {
      fontFamily: REGULAR_MONTSERRAT,
      fontWeight: '400',
      fontSize: 18,
      color: 'black',
      paddingHorizontal: 20,
      textAlign: 'center',
      width: '100%',
    },
    transferRequestKey: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: 'black',
      paddingHorizontal: 20,
      textAlign: 'center',
      width: '100%',
      marginTop: 24,
      marginBottom: 4,
    },
    transferRequestKeyValue: {
      fontFamily: REGULAR_MONTSERRAT,
      fontWeight: '400',
      fontSize: 18,
      paddingHorizontal: 20,
      color: 'black',
      textAlign: 'center',
      width: '100%',
    },
    buttonContainer: {
      paddingHorizontal: 16,
      width: '100%',
    },
    button: {
      marginHorizontal: 0,
      width: '100%',
    },
  });

import {Dimensions, StyleSheet} from 'react-native';
import {BOLD_MONTSERRAT, MEDIUM_MONTSERRAT} from '../../constants/styles';

export const createStyles = ({
  bottomSpace,
  statusBarHeight,
}: {
  bottomSpace: number;
  statusBarHeight: number;
}) => {
  // The back arrow floats over the edge-to-edge background at
  // top: statusBarHeight + 12 and is 24px tall. The keyboard-avoiding scroll
  // area starts below it (+8px gap), so content scrolled up by the keyboard is
  // clipped there instead of passing under the status bar or the arrow.
  const headerOffset = statusBarHeight + 12 + 24 + 8;

  return StyleSheet.create({
    bgImage: {
      flex: 1,
    },
    header: {
      position: 'absolute',
      top: statusBarHeight + 12,
      left: 12,
      alignItems: 'flex-start',
      width: '100%',
    },
    keyboardAvoider: {
      flex: 1,
      marginTop: headerOffset,
    },
    contentWrapper: {
      width: '100%',
      paddingBottom: 80,
    },
    content: {
      width: '100%',
      // Was 108 / full window height measured from the screen top; the scroll
      // area now starts at headerOffset, so subtract it to keep the same
      // resting layout.
      paddingTop: Math.max(0, 108 - headerOffset),
      paddingBottom: bottomSpace,
      alignItems: 'center',
      justifyContent: 'flex-end',
      minHeight: Dimensions.get('window').height - headerOffset,
    },
    inputsWrapper: {
      paddingHorizontal: 20,
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    inputWrapper: {
      marginBottom: 20,
      width: 100,
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 0,
      height: 50,
      color: 'black',
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontSize: 24,
      fontWeight: '500',
      color: 'white',
      marginTop: 24,
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontSize: 15,
      fontWeight: '500',
      color: 'white',
      marginTop: 40,
      textAlign: 'center',
      marginHorizontal: 20,
    },
    warning: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontSize: 15,
      fontWeight: '500',
      color: 'white',
      marginTop: 16,
      marginBottom: 40,
      textAlign: 'center',
      marginHorizontal: 20,
    },
    errorText: {
      fontFamily: MEDIUM_MONTSERRAT,
      color: 'red',
    },
    button: {
      // marginTop: 24,
      backgroundColor: '#FAA41A',
      width: '100%',
      paddingVertical: 17,
    },
    disabledBtn: {
      opacity: 0.5,
    },
    buttonText: {
      fontFamily: BOLD_MONTSERRAT,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      color: 'white',
    },
  });
};

import {StyleSheet} from 'react-native';
import {BOLD_MONTSERRAT, MEDIUM_MONTSERRAT} from '../../constants/styles';

export const createStyles = ({
  statusBarHeight,
  bottomSpace,
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
      width: '100%',
    },
    header: {
      position: 'absolute',
      top: statusBarHeight + 12,
      left: 16,
      alignItems: 'flex-start',
      width: '100%',
      zIndex: 1,
    },
    keyboardAvoider: {
      flex: 1,
      marginTop: headerOffset,
    },
    contentWrapper: {
      flex: 1,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      // Was 96 from the screen top; the scroll area now starts at
      // headerOffset, so only the remainder keeps the same resting layout.
      paddingTop: Math.max(0, 96 - headerOffset),
      width: '100%',
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontSize: 24,
      fontWeight: '500',
      color: 'white',
      marginTop: 25,
      marginBottom: 51,
    },
    password: {
      width: '100%',
      paddingVertical: 32,
    },
    buttonContainer: {
      width: '100%',
      paddingBottom: bottomSpace + 16,
      backgroundColor: 'transparent',
    },
    button: {
      backgroundColor: '#FAA41A',
      width: '100%',
      paddingVertical: 17,
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

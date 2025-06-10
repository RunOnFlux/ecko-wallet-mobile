import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    modalContainer: {},
    qrCodeWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 24,
      backgroundColor: 'white',
      width: 210,
      height: 210,
      alignSelf: 'center',
    },
    qrCodeImage: {
      width: 200,
      height: 200,
    },
    footer: {
      paddingVertical: 24,
      paddingRight: 20,
      paddingLeft: 24,
      borderTopWidth: 1,
      borderTopColor: 'rgba(223,223,237,0.5)',
    },
    footerTitle: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    footerText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
      marginTop: 14,
    },
  });

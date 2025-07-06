import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    modalContainer: {
      marginTop: 32,
    },
    modalContentWrapper: {
      marginBottom: 8,
      marginHorizontal: 19,
      zIndex: 1,
    },
    checkBoxWrapper: {
      marginBottom: 24,
    },
    checkBoxText: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      color: theme.text.primary,
    },
    modalFooter: {
      zIndex: 0,
      borderTopColor: theme.border,
      borderTopWidth: 1,
      paddingTop: 29,
      paddingLeft: 21,
      marginBottom: 5,
    },
  });

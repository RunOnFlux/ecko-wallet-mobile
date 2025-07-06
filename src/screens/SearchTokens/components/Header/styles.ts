import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    header: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(223,223,237,0.5)',
    },
    backBtnWrapper: {
      position: 'absolute',
      left: 14,
      top: 16,
    },
    rightItemWrapper: {
      position: 'absolute',
      right: 14,
      top: 16,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 18,
      color: theme.text.primary,
    },
  });

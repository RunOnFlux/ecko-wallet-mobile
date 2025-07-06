import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      marginLeft: 8,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 14,
      color: theme.text.secondary,
    },
    image: {
      width: 26,
      height: 26,
      borderRadius: 13,
    },
  });

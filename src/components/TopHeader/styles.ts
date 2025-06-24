import {Dimensions, StyleSheet} from 'react-native';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: Dimensions.get('window').width,
      flexDirection: 'column',
      backgroundColor: theme.surface,
      alignItems: 'center',
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
      shadowColor: theme.shadow.shadowColor,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
      zIndex: 5,
    },
  });

import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../themes/types';

export const makeStyles = (_theme: IAppTheme) =>
  StyleSheet.create({
    loadingWrapper: {
      width: '100%',
      marginVertical: 24,
      alignItems: 'center',
    },
  });

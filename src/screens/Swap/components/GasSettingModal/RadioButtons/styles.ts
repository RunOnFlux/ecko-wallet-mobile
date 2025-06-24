import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: 250,
    },
    button: {
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.brand,
      backgroundColor: theme.background,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    text: {
      color: theme.brand,
      fontWeight: 'bold',
    },
    activeButton: {
      backgroundColor: theme.brand,
    },
    activeText: {
      color: theme.text.primary,
    },
  });

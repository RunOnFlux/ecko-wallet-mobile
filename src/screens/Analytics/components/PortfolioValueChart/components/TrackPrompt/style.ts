import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginTop: 20,
      height: 240,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(230,230,230,0.04)',
      marginHorizontal: 16,
      borderRadius: 8,
    },
    button: {
      borderWidth: 1,
      borderColor: theme.brand,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 20,
    },
    buttonText: { color: theme.brand, fontWeight: 'bold' },
  });

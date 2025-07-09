import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {height: 350, marginTop: 50},
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 35,
      alignItems: 'center',
      marginBottom: 4,
    },
    valueText: {color: theme.text.primary, fontSize: 16, fontWeight: 800},
    rangeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
      paddingHorizontal: 20,
    },
    rangeText: {
      color: 'gray',
      fontSize: 14,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    rangeTextActive: {
      color: 'white',
      borderWidth: 1,
      borderColor: 'white',
      borderRadius: 8,
    },
  });

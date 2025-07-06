import {Dimensions, StyleSheet} from 'react-native';
import {
  REGULAR_MONTSERRAT,
  SEMI_BOLD_MONTSERRAT,
} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

const windowHeight = Dimensions.get('window').height;

export const createStyles = (
  theme: IAppTheme,
  {
    statusBarHeight,
  }: {
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingTop: 8,
    },
    detailContainer: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: 'rgba(223,223,237,0.5)',
    },
    content: {
      minHeight: windowHeight * 0.75 - statusBarHeight - 56,
    },
    footer: {
      paddingHorizontal: 20,
      width: '100%',
    },
    item: {
      marginVertical: 8,
      color: 'red',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.text.primary,
      fontFamily: SEMI_BOLD_MONTSERRAT,
      fontSize: 14,
      marginRight: 12,
    },
    text: {
      color: theme.text.primary,
      fontFamily: REGULAR_MONTSERRAT,
      fontSize: 14,
    },
    button: {
      width: '100%',
      marginTop: 20,
      backgroundColor: theme.button.primary,
    },
  });

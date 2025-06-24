import {Dimensions, StyleSheet} from 'react-native';
import {
  BOLD_MONTSERRAT,
  SEMI_BOLD_MONTSERRAT,
} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

const windowHeight = Dimensions.get('window').height;

export const createStyles = (
  theme: IAppTheme,
  {
    statusBarHeight,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 25,
      paddingTop: 8,
    },
    content: {
      minHeight: windowHeight * 0.75 - statusBarHeight - 56,
    },
    title: {
      marginTop: 16,
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    value: {
      marginTop: 4,
      fontSize: 24,
      fontFamily: SEMI_BOLD_MONTSERRAT,
      color: theme.text.primary,
    },
    button: {
      width: '100%',
      marginTop: 20,
      backgroundColor: theme.button.primary,
    },
  });

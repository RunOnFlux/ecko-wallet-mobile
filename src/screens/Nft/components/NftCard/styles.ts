import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';
import {BOLD_MONTSERRAT} from '../../../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '48%',
      marginBottom: 16,
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      justifyContent: 'flex-end',
    },
    imageRadius: {
      borderRadius: 10,
      backgroundColor: theme.surface,
    },
    labelWrapper: {
      backgroundColor: theme.background,
      alignSelf: 'flex-start',
      margin: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      maxWidth: '85%',
    },
    label: {
      color: theme.text.primary,
      fontFamily: BOLD_MONTSERRAT,
      fontSize: 11,
    },
  });

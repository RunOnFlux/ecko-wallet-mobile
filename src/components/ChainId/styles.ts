import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      marginTop: 10,
      zIndex: 10,
    },
    label: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    dropdownContainer: {
      width: 180,
    },
    dropdownStyle: {
      borderRadius: 10,
      borderWidth: 0,
      backgroundColor: theme.input.background,
      height: 50,
      paddingHorizontal: 16,
    },
    dropdownLabel: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    dropdownPlaceholder: {
      color: theme.input.placeholder,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
    },
    error: {
      fontFamily: MEDIUM_MONTSERRAT,
      marginTop: 4,
      color: theme.error.color,
    },
  });

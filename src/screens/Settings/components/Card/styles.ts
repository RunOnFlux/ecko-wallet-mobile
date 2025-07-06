import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';
import {
  MEDIUM_MONTSERRAT,
  SEMI_BOLD_MONTSERRAT,
} from '../../../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 24,
      paddingBottom: 24,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconWrapper: {
      padding: 9,
      backgroundColor: theme.button.primary,
      borderRadius: 21,
    },
    rightSide: {
      marginLeft: 12,
    },
    rightSideWithoutIcon: {
      marginLeft: 0,
    },
    title: {
      fontFamily: SEMI_BOLD_MONTSERRAT,
      fontWeight: '600',
      fontSize: 16,
      color: theme.text.primary,
    },
    text: {
      marginTop: 9,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.secondary,
      width: '100%',
    },
  });

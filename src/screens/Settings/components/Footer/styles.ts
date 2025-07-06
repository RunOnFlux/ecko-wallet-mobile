import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';
import {
  MEDIUM_MONTSERRAT,
  SEMI_BOLD_MONTSERRAT,
} from '../../../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      borderTopColor: theme.border,
      borderTopWidth: 1,
      borderStyle: 'solid',
      paddingTop: 24,
      paddingBottom: 4,
      width: '100%',
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.secondary,
      marginBottom: 0,
    },
    tipsWrapper: {
      marginTop: 0,
    },
    tip: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    tipTitle: {
      color: theme.text.secondary,
      fontFamily: SEMI_BOLD_MONTSERRAT,
      fontWeight: '600',
      fontSize: 12,
      marginLeft: 8,
    },
    tipTitleNoIcon: {
      color: theme.text.secondary,
      fontFamily: SEMI_BOLD_MONTSERRAT,
      fontWeight: '600',
      fontSize: 12,
    },
    poweredByIcon: {
      width: 80,
      height: 20,
      marginBottom: 20,
    },
  });

import {StyleSheet} from 'react-native';
import {BOLD_MONTSERRAT, MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
    },
    container: {
      paddingVertical: 12,
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rightSide: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 40,
      height: 40,
      backgroundColor: theme.surface,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginRight: 12,
    },
    center: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    logo: {
      width: 32,
      height: 32,
    },
    title: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
      color: theme.text.primary,
      textAlign: 'left',
    },
    link: {
      marginTop: 4,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      textAlign: 'left',
      fontSize: 12,
      color: theme.text.secondary,
    },
    detail: {
      width: 24,
      height: 24,
      transform: [{rotate: '180deg'}],
    },
  });

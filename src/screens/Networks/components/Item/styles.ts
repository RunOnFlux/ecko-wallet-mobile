import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    icon: {
      color: theme.text.primary,
    },
    iconWrapper: {
      padding: 9,
      backgroundColor: theme.button.primary,
      borderRadius: 21,
      shadowColor: 'black',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    body: {
      marginLeft: 12,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 14,
      color: theme.text.primary,
    },
    rightWrapper: {
      flexDirection: 'row',
      width: 40,
      justifyContent: 'space-between',
    },
  });

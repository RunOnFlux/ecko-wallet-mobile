import {Dimensions, StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    modalContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 20,
      marginBottom: 20,
    },
    gasStation: {
      color: theme.text.primary,
      fontFamily: MEDIUM_MONTSERRAT,
      fontSize: 14,
      fontWeight: '600',
    },
    inputWrapper: {
      marginBottom: 24,
    },
    info: {
      borderTopColor: theme.border,
      borderTopWidth: 1,
      paddingTop: 20,
      marginTop: 25,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontSize: 14,
      color: theme.text.primary,
      flex: 1,
      marginRight: 12,
    },
    value: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontSize: 15,
      textAlign: 'right',
      color: theme.text.primary,
    },
    contentStyle: {
      height: Dimensions.get('window').height - 200,
    },
  });

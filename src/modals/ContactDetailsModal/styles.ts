import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    modalContainer: {
      marginTop: 24,
    },
    modalContentWrapper: {},
    image: {
      width: 71.63,
      height: 71.63,
    },
    accountNameSection: {
      paddingLeft: 24,
      paddingRight: 20,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    accountNameSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    accountName: {
      width: 294,
      fontSize: 14,
    },
    chainIdSection: {
      marginVertical: 24,
      marginHorizontal: 28,
    },
    chainIdText: {
      marginTop: 14,
    },
    modalFooter: {
      borderTopColor: theme.border,
      borderTopWidth: 1,
      paddingTop: 28,
      paddingLeft: 20,
      marginBottom: 5,
    },
    itemStyle: {
      marginBottom: 18,
    },
  });

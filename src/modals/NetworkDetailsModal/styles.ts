import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    modalContainer: {
      marginTop: 2,
    },
    modalContentWrapper: {},
    image: {
      width: 71.63,
      height: 71.63,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    section: {
      paddingVertical: 24,
      paddingHorizontal: 28,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    text: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 14,
      color: theme.text.primary,
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

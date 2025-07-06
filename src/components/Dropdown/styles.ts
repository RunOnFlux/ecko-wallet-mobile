import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    dropdownStyle: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 15,
    },
    containerStyle: {
      width: 140,
    },
    labelStyle: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.primary,
    },
    itemStyle: {
      paddingHorizontal: 22,
      paddingVertical: 4,
      backgroundColor: theme.background,
      zIndex: 9999,
    },
    search: {
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 18,
      marginLeft: 12,
      paddingVertical: 16,
      color: theme.text.primary,
    },
    itemLabelStyle: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text.primary,
    },
    dropdownContainerStyle: {
      borderRadius: 0,
      borderColor: theme.border,
    },
    listContainerStyle: {
      paddingVertical: 8,
    },
    modalContent: {
      flex: 1,
      backgroundColor: theme.background,
    },
  });

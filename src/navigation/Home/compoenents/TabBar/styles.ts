import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../themes/types';
import {BOLD_MONTSERRAT} from '../../../../constants/styles';

export const makeStyles = (
  theme: IAppTheme,
  {
    bottomSpace,
    statusBarHeight,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingBottom: bottomSpace + 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    tabBarItem: {
      flex: 1,
      alignItems: 'center',
      borderTopColor: theme.text.secondary,
      paddingTop: 14,
    },
    activeTab: {
      borderTopWidth: 2,
      marginTop: -2,
    },
    disabledTab: {
      opacity: 0.5,
    },
    label: {
      color: theme.text.secondary,
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      marginTop: 8,
      fontSize: 8,
      textTransform: 'uppercase',
    },
    activeLabel: {
      color: theme.button.primary,
    },
    brandLabel: {
      color: theme.brand,
    },
  });

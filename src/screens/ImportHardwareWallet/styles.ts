import { StyleSheet } from 'react-native';
import { IAppTheme } from '../../themes/types';

export const createStyles = (
  theme: IAppTheme,
  { bottomSpace }: { bottomSpace: number; statusBarHeight: number },
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentWrapper: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    selectorWrapper: {
      gap: 16,
      color: theme.text.primary,
    },
    selectorItem: {
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: 'transparent',
    },
    selectorItemSelected: {
      backgroundColor: theme.button.primary,
      borderColor: theme.border,
    },
    selectorItemDisabled: {
      opacity: 0.4,
    },
    instructionsWrapper: {
      marginTop: 50,
      gap: 10,
    },
    instructionsTitleWrapper: {
      gap: 10,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      color: theme.text.primary,
      marginBottom: 30,
    },
    instructionsTitle: {
      textAlign: 'center',
      color: theme.text.secondary,
    },
    errorTitle: {
      marginTop: 8,
      textAlign: 'center',
      color: theme.error.color,
    },
    deviceItem: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.button.primary,
    },
    deviceName: {
      fontSize: 16,
      color: theme.text.primary,
      fontWeight: '600',
    },
    deviceHeader: {
      marginVertical: 12,
      paddingVertical: 12,
    },
    deviceLabel: {
      color: theme.text.secondary,
      marginBottom: 8,
    },
    deviceValue: {
      color: theme.text.primary,
    },
    accountList: {
      marginTop: 8,
    },
    accountItem: {
      marginVertical: 8,
    },
    accountText: {
      color: theme.text.primary,
    },
    footer: {
      padding: 16,
      marginBottom: bottomSpace,
    },
  });

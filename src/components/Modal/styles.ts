import {Platform, StyleSheet, Dimensions} from 'react-native';
import {IAppTheme} from '../../themes/types';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';

const windowHeight = Dimensions.get('window').height;

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
    modal: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      margin: 0,
    },
    wrapper: {
      backgroundColor: theme.surface,
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      paddingTop: 25,
    },
    header: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 27,
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
    },
    logoWrapper: Platform.select({
      ios: {
        width: 89,
        height: 89,
        marginTop: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.surface,
        borderRadius: 45,
        shadowColor: theme.shadow.shadowColor,
        shadowOffset: theme.shadow.shadowOffset,
        shadowOpacity: theme.shadow.shadowOpacity,
        shadowRadius: theme.shadow.shadowRadius,
      },
      default: {
        width: 89,
        height: 89,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 85,
        backgroundColor: theme.surface,
        borderRadius: 45,
        elevation: theme.shadow.elevation,
      },
    }),
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 18,
      color: theme.text.primary,
    },
    titleWithLogo: Platform.select({
      ios: {
        marginTop: 24,
        fontSize: 24,
        marginBottom: 5,
      },
      default: {
        marginTop: 53,
        fontSize: 24,
        marginBottom: 5,
      },
    }),
    closeBtnWrapper: {
      position: 'absolute',
      right: 14,
      top: 0,
    },
    leftItemWrapper: {
      position: 'absolute',
      left: 20,
      top: 0,
    },
    contentWrapper: {
      width: '100%',
      minHeight: windowHeight * 0.65 - statusBarHeight,
      maxHeight: windowHeight * 0.8 - statusBarHeight - 56,
    },
    content: {
      width: '100%',
      paddingBottom: bottomSpace + 24,
    },
  });

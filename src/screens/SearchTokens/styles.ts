import {StyleSheet} from 'react-native';
import {isIos} from '../../constants';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (
  theme: IAppTheme,
  {
    statusBarHeight,
  }: {
    bottomSpace: number;
    statusBarHeight: number;
  },
) =>
  StyleSheet.create({
    container: {
      marginTop: statusBarHeight,
      flex: 1,
    },
    searchSection: {
      marginHorizontal: 19,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isIos ? 13 : 3,
      paddingLeft: 16,
      paddingRight: 40,
      backgroundColor: theme.input.background,
      borderRadius: 10,
    },
    input: {
      paddingHorizontal: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.input.color,
      width: '100%',
    },
    emptyList: {
      marginTop: 8,
      fontFamily: MEDIUM_MONTSERRAT,
      textAlign: 'center',
      color: theme.text.primary,
    },
    body: {
      flex: 1,
      marginTop: 12,
    },
    contactsWrapper: {
      flex: 1,
    },
    contactsContent: {
      paddingTop: 8,
      paddingHorizontal: 24,
    },
  });

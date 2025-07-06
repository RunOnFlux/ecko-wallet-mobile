import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../constants/styles';
import {IAppTheme} from '../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      paddingVertical: 24,
      paddingHorizontal: 19,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    fromWrapper: {flex: 1},
    toWrapper: {flex: 1},
    centerWrapper: {
      marginHorizontal: 8,
    },
    iconWrapper: {
      borderWidth: 1,
      borderColor: theme.border,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
    },
    text: {
      color: theme.text.primary,
    },
    chainId: {
      marginLeft: 33,
      marginTop: -5,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 12,
      color: theme.text.secondary,
    },
  });

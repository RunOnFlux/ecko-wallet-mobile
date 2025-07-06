import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    wrapper: {
      paddingVertical: 24,
      paddingRight: 20,
      paddingLeft: 24,
      borderTopWidth: 1,
      borderTopColor: 'rgba(223,223,237,0.5)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    content: {
      flexDirection: 'row',
    },
    image: {
      width: 26,
      height: 26,
      borderRadius: 13,
    },
    text: {
      marginTop: 3,
      width: 232,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 14,
      color: theme.text.primary,
    },
  });

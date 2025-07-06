import {StyleSheet} from 'react-native';
import {IAppTheme} from '../../../../../../themes/types';
import {BOLD_MONTSERRAT} from '../../../../../../constants/styles';

export const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    header: {
      marginTop: 24,
      flexDirection: 'row',
      marginRight: 11,
      marginLeft: 28,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: BOLD_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'uppercase',
    },
    rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    plusSvgWrapper: {
      borderRadius: 19,
      padding: 8,
      marginLeft: 4,
    },
    searchSvgWrapper: {
      borderRadius: 19,
      padding: 8,
      marginLeft: 20,
    },
  });

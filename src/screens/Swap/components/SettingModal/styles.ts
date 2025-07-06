import {StyleSheet} from 'react-native';
import {MEDIUM_MONTSERRAT} from '../../../../constants/styles';
import {IAppTheme} from '../../../../themes/types';

export const createStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 25,
    },
    slippageToleranceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    input: {
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      paddingHorizontal: 20,
      paddingVertical: 10,
      paddingRight: 25,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.text.primary,
    },
    percent: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: [{translateY: -8}],
      color: theme.text.primary,
      fontWeight: 'bold',
    },
    title: {
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '700',
      fontSize: 12,
      color: theme.text.primary,
      textTransform: 'uppercase',
      marginTop: 25,
      marginBottom: 12,
    },
    deadlineWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      marginLeft: 10,
      fontSize: 15,
      fontWeight: '500',
      color: theme.text.primary,
    },
  });

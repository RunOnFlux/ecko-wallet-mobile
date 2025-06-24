import {StyleSheet} from 'react-native';
import {isIos} from '../../constants';
import {MAIN_COLOR, MEDIUM_MONTSERRAT} from '../../constants/styles';
import {useAppThemeContext} from '../../contexts';
import {useSafeAreaValues} from '../../utils/deviceHelpers';

export const makeStyles = () => {
  const {statusBarHeight} = useSafeAreaValues();
  const {theme} = useAppThemeContext();
  return StyleSheet.create({
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
      backgroundColor: theme.input?.background ?? 'rgba(236,236,245,0.5)',
      borderRadius: 10,
    },
    input: {
      paddingHorizontal: 16,
      fontFamily: MEDIUM_MONTSERRAT,
      fontWeight: '500',
      fontSize: 16,
      color: theme.text?.primary ?? MAIN_COLOR,
      width: '100%',
    },
    emptyList: {
      marginTop: 8,
      fontFamily: MEDIUM_MONTSERRAT,
      textAlign: 'center',
      color: theme.text?.secondary ?? '#787B8E',
    },
    body: {
      flex: 1,
      marginTop: 12,
    },
    contactsWrapper: {
      flex: 1,
    },
    contactsContent: {
      paddingTop: 24,
      paddingHorizontal: 24,
    },
  });
};

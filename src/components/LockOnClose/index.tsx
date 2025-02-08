import {useEffect} from 'react';
import {AppState, Platform} from 'react-native';
import {useDispatch} from 'react-redux';
import {logout} from '../../store/auth/actions';

const LockOnClose = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        (Platform.OS === 'ios' && nextAppState === 'inactive') ||
        (Platform.OS === 'android' && nextAppState === 'background')
      ) {
        dispatch(logout());
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  return null;
};

export default LockOnClose;

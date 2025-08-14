import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppThemeContext } from '../../../../../../contexts';
import { startTrackPortfolio } from '../../../../../../store/analytics';
import { useTrackAccountBalance } from '../../../../hooks/useTrackAccountBalance';
import { useShallowEqualSelector } from '../../../../../../store/utils';
import { makeSelectAccounts } from '../../../../../../store/userWallet/selectors';
import { createStyles } from './style';

const TrackPrompt = () => {
  const { theme } = useAppThemeContext();
  const styles = createStyles(theme);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const trackAccount = useTrackAccountBalance();
  const accounts = useShallowEqualSelector(makeSelectAccounts);

  const onPress = useCallback(() => {
    if (loading) return;
    setLoading(true);
    dispatch(startTrackPortfolio());
    Promise.all(
      (accounts || []).map((acc: any) =>
        trackAccount(acc.account).catch(() => false),
      ),
    ).finally(() => setLoading(false));
  }, [dispatch, loading, accounts, trackAccount]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.buttonText}>START TRACKING</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TrackPrompt;

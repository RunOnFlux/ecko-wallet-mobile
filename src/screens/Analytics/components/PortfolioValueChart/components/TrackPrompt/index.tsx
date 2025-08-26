import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppThemeContext } from '../../../../../../contexts';
import { startTrackPortfolio } from '../../../../../../store/analytics';
import { useShallowEqualSelector } from '../../../../../../store/utils';
import { makeSelectAccounts } from '../../../../../../store/userWallet/selectors';
import { createStyles } from './styles';
import Modal from '../../../../../../components/Modal';
import { useTranslation } from 'react-i18next';
import Button from '../../../../../Wallet/components/WalletBalance/components/Button';
import { MAIN_COLOR } from '../../../../../../constants/styles';

const TrackPrompt = () => {
  const { t } = useTranslation();
  const { theme } = useAppThemeContext();
  const styles = createStyles(theme);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const accounts = useShallowEqualSelector(makeSelectAccounts);

  const openModal = useCallback(() => setIsVisible(true), []);
  const closeModal = useCallback(() => setIsVisible(false), []);

  const onConfirm = useCallback(() => {
    if (loading) return;
    setLoading(true);
    dispatch(startTrackPortfolio());
    setIsVisible(false);
    setTimeout(() => setLoading(false), 200);
  }, [dispatch, loading, accounts]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={openModal}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.buttonText}>START TRACKING</Text>
        )}
      </TouchableOpacity>
      <Modal
        isVisible={isVisible}
        close={closeModal}
        title={t('analytics.trackPortfolioStart') || 'Start Tracking'}
      >
        <View style={styles.container}>
          <Text style={styles.description}>
            {t('analytics.trackPortfolioDesc1') ||
              'Enable portfolio value tracking to see historical performance.'}
          </Text>
          <Text style={styles.description}>
            {t('analytics.trackPortfolioDesc2') ||
              'We will locally store anonymized data required to compute your portfolio value over time.'}
          </Text>
          <View style={styles.buttons}>
            <Button
              title={t('common.cancel')}
              backgroundColor={'rgba(236,236,245,0.5)'}
              onPress={closeModal}
              textColor={MAIN_COLOR}
              style={{ flex: 1 }}
            />
            <Button
              title={t('common.confirm')}
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TrackPrompt;

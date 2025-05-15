import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Header from './components/Header';
import {createStyles} from './styles';
import {headerTabs} from './const';
import PairingItem from './components/PairingItem';
import SessionItem from './components/SessionItem';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import WalletConnectInfoModal from '../../components/WalletConnectInfoModal';
import Modal from '../../components/Modal';
import {useWalletConnectContext} from '../../contexts';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {TSessionItem} from './components/SessionItem/types';

const Connection = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const {web3WalletClient, isConnected: isWalletConnected} =
    useWalletConnectContext();

  const [activeTab, setActiveTab] = useState(headerTabs[0].value);
  const isSessionsTab = useMemo(() => activeTab === 'sessions', [activeTab]);

  const [pairingRaws, setPairings] = useState<any[]>(
    web3WalletClient?.core?.pairing.getPairings() || [],
  );
  const [sessionRaws, setSessions] = useState<any[]>(
    web3WalletClient?.getActiveSessions()
      ? Object.values(web3WalletClient?.getActiveSessions())
      : [],
  );

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const pairings = useMemo(
    () =>
      pairingRaws.map(pairing => ({
        type: 'pairing',
        topic: pairing.topic,
        name: pairing.peerMetadata?.name || t('connection.unknown'),
        expiry: pairing.expiry,
        logo: pairing.peerMetadata?.icons?.[0] ?? null,
        url: pairing.peerMetadata?.url || '',
      })),
    [pairingRaws, t],
  );

  const sessions = useMemo(
    () =>
      sessionRaws.map(session => ({
        type: 'session',
        topic: session.topic,
        name: session.peer.metadata?.name || t('connection.unknown'),
        expiry: session.expiry,
        logo: session.peer.metadata?.icons?.[0] ?? null,
        url: session.peer.metadata?.url || '',
      })),
    [sessionRaws, t],
  );

  const onDeletePairing = useCallback(
    (item: any) => {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
      Alert.alert(
        t('connection.deleteAlert.title'),
        t('connection.deleteAlert.message'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
              web3WalletClient
                ?.disconnectSession({
                  topic: item.topic,
                  reason: {
                    message: 'User disconnected.',
                    code: 5000,
                  },
                })
                .then(() => {
                  setPairings(pairingRaws.filter(p => p.topic !== item.topic));
                  setSessions(sessionRaws.filter(s => s.topic !== item.topic));
                })
                .catch(() => {
                  Alert.alert(
                    t('connection.deleteFailureTitle'),
                    t('connection.deleteFailureMessage'),
                  );
                });
            },
          },
        ],
      );
    },
    [web3WalletClient, pairingRaws, sessionRaws, t],
  );

  const onDeleteSession = useCallback(
    (item: any) => {
      setPairings(pairingRaws.filter(p => p.topic !== item.topic));
      setSessions(sessionRaws.filter(s => s.topic !== item.topic));
    },
    [pairingRaws, sessionRaws],
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPairings(web3WalletClient?.core?.pairing.getPairings() || []);
      setSessions(
        web3WalletClient?.getActiveSessions()
          ? Object.values(web3WalletClient?.getActiveSessions())
          : [],
      );
      setIsRefreshing(false);
    }, 600);
  }, [web3WalletClient]);

  const isFocused = useIsFocused();
  useEffect(() => {
    setTimeout(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setPairings(web3WalletClient?.core?.pairing.getPairings() || []);
        setSessions(
          web3WalletClient?.getActiveSessions()
            ? Object.values(web3WalletClient?.getActiveSessions())
            : [],
        );
        setIsRefreshing(false);
      }, 1200);
    }, 600);
  }, [web3WalletClient, isFocused, isWalletConnected]);

  const setActiveTabFunc = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const renderItem = useCallback(
    ({item}: {item: TSessionItem}) =>
      isSessionsTab ? (
        <SessionItem item={item} onDelete={() => onDeleteSession(item)} />
      ) : (
        <PairingItem item={item} onDelete={() => onDeletePairing(item)} />
      ),
    [isSessionsTab, onDeletePairing, onDeleteSession],
  );

  const keyExtractor = useCallback(
    (item: TSessionItem) => `${item.topic}-${item.type}`,
    [],
  );

  const onConnection = useCallback(() => {
    navigation.navigate({
      name: ERootStackRoutes.WalletConnectScan,
      params: undefined,
    });
  }, [navigation]);

  const [showInfo, setShowInfo] = useState(false);
  const onShowInfo = useCallback(() => setShowInfo(true), []);
  const onCloseInfo = useCallback(() => setShowInfo(false), []);

  return (
    <View style={styles.container}>
      <Header activeTab={activeTab} setActiveTab={setActiveTabFunc} />
      <FlatList
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        data={isSessionsTab ? sessions : pairings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            {isSessionsTab
              ? t('connection.empty.sessions')
              : t('connection.empty.pairings')}
          </Text>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.contentWrapper}
      />
      <TouchableOpacity
        onPress={onConnection}
        activeOpacity={0.8}
        style={styles.connectButton}>
        <Image
          source={require('../../assets/images/walletConnect.png')}
          style={styles.connectIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onShowInfo}
        activeOpacity={0.8}
        style={styles.infoButton}>
        <Image
          source={require('../../assets/images/info.png')}
          style={styles.infoIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Modal
        isVisible={showInfo}
        close={onCloseInfo}
        contentStyle={styles.infoModalStyle}
        title={t('connection.modal.title')}>
        <WalletConnectInfoModal onConfirm={onCloseInfo} />
      </Modal>
    </View>
  );
};

export default Connection;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import FooterButton from '../../components/FooterButton';
import { useAppThemeContext } from '../../contexts';
import { createStyles } from './styles';
import { useLedgerContext } from '../../contexts';
import { useNavigation } from '@react-navigation/native';
import { ERootStackRoutes, TNavigationProp } from '../../routes/types';
import Checkbox from '../../components/Checkbox';
import LedgerLongLogo from '../../assets/images/ledger-logo-long.svg';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { addNewAccount, setSelectedAccount } from '../../store/userWallet';
import { AccountType } from '../../store/userWallet/types';
import { defaultWallets } from '../../store/userWallet/const';
import { useSafeAreaValues } from '../../utils/deviceHelpers';
import { TouchableOpacity } from 'react-native';
import { useSpireKeyContext } from '../../contexts';
import { useShallowEqualSelector } from '../../store/utils';
import { makeSelectActiveNetwork } from '../../store/networks/selectors';

const ImportHardwareWallet = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.ImportHardwareWallet>>();
  const { theme } = useAppThemeContext();
  const { bottomSpace, statusBarHeight } = useSafeAreaValues();
  const styles = useMemo(
    () => createStyles(theme, { bottomSpace, statusBarHeight }),
    [theme],
  );
  const {
    getPublicKey,
    isWaitingLedger,
    isScanning,
    availableDevices,
    scanForDevices,
    stopScan,
    connectToDevice,
    error: ledgerError,
    resetError,
    disconnect,
  } = useLedgerContext();
  const { connectAccount, isWaitingSpireKey } = useSpireKeyContext();
  const selectedNetwork = useShallowEqualSelector(makeSelectActiveNetwork);
  const dispatch = useDispatch<AppDispatch>();

  const [selected, setSelected] = useState<'ledger' | 'spirekey' | null>(null);
  const [ledgerPublicKey, setLedgerPublicKey] = useState<string>('');
  const [spireKeyPublicKey, setSpireKeyPublicKey] = useState<string>('');
  const [selectedAccountName, setSelectedAccountName] = useState<string>('');
  const [showDeviceList, setShowDeviceList] = useState(false);

  useEffect(() => {
    console.log(
      '[ImportHardwareWallet] selectedAccountName changed to:',
      selectedAccountName,
    );
  }, [selectedAccountName]);

  const handleStartScan = useCallback(async () => {
    if (selected === 'ledger') {
      try {
        setShowDeviceList(true);
        await scanForDevices();
      } catch (err) {
        console.log('Ledger start scan ERROR:', err);
      }
    }
  }, [selected, scanForDevices]);

  const handleSelectDevice = useCallback(
    async (device: any) => {
      try {
        stopScan();
        await connectToDevice(device);
        const pk = await getPublicKey();
        if (pk) {
          setLedgerPublicKey(pk);
          setSelectedAccountName(`k:${pk}`);
          setShowDeviceList(false);
        }
      } catch (err) {
        console.log('Ledger select device ERROR:', err);
      }
    },
    [connectToDevice, getPublicKey, stopScan],
  );

  const getNetworkId = useCallback(() => {
    const net = selectedNetwork?.network;
    if (net === 'mainnet') return 'mainnet01';
    if (net === 'testnet') return 'testnet04';
    if (net === 'devnet') return 'development';
    return 'development';
  }, [selectedNetwork]);

  const handleSpireKeyConnect = useCallback(async () => {
    try {
      console.log(
        '[ImportHardwareWallet] handleSpireKeyConnect - Starting connection',
      );
      const acc = await connectAccount(getNetworkId(), '0');
      console.log('[ImportHardwareWallet] connectAccount returned:', acc);
      console.log('[ImportHardwareWallet] Account name:', acc?.accountName);
      if (acc?.accountName) {
        console.log(
          '[ImportHardwareWallet] Setting selectedAccountName to:',
          acc.accountName,
        );
        setSelectedAccountName(acc.accountName);

        const publicKey = acc?.devices?.[0]?.guard?.keys?.[0];
        if (publicKey) {
          setSpireKeyPublicKey(publicKey);
        } else {
          console.log(
            '[ImportHardwareWallet] WARNING: No publicKey found in SpireKey account',
          );
        }
      } else {
        console.log(
          '[ImportHardwareWallet] WARNING: No accountName in returned account',
        );
      }
    } catch (err) {
      console.log('[ImportHardwareWallet] handleSpireKeyConnect ERROR:', err);
    }
  }, [connectAccount, getNetworkId]);

  const handleImport = useCallback(() => {
    if (!selectedAccountName) return;
    const isLedger = !!ledgerPublicKey;
    const account: any = {
      accountName: selectedAccountName,
      publicKey: isLedger ? ledgerPublicKey : spireKeyPublicKey,
      chainId: '0',
      wallets: defaultWallets,
      type: isLedger ? AccountType.LEDGER : AccountType.SPIREKEY,
    };
    dispatch(addNewAccount(account));
    dispatch(setSelectedAccount(account));
    if (isLedger) {
      resetError();
      disconnect();
    }
    navigation.navigate({
      name: ERootStackRoutes.Home,
      params: undefined,
    } as any);
  }, [ledgerPublicKey, spireKeyPublicKey, selectedAccountName, disconnect]);

  return (
    <View style={styles.screen}>
      <Header
        title={t('importHardwareWallet.title')}
        onBack={() => {
          resetError();
          navigation.goBack();
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.contentWrapper}
      >
        {!ledgerPublicKey && !selectedAccountName ? (
          <>
            <View style={styles.selectorWrapper}>
              <View
                style={[
                  styles.selectorItem,
                  selected === 'ledger' && styles.selectorItemSelected,
                ]}
                onTouchEnd={() => setSelected('ledger')}
              >
                <LedgerLongLogo />
              </View>
              <TouchableOpacity
                style={[
                  styles.selectorItem,
                  selected === 'spirekey' && styles.selectorItemSelected,
                ]}
                onPress={() => setSelected('spirekey')}
              >
                <Text style={styles.deviceName}>
                  {t('importHardwareWallet.spireKeyLabel', {
                    defaultValue: 'SpireKey',
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            {selected === 'ledger' && !showDeviceList && (
              <View style={styles.instructionsWrapper}>
                <Text style={styles.instructionsTitleWrapper}>
                  IMPORTANT CONNECTION INSTRUCTIONS
                </Text>
                <Text style={styles.instructionsTitle}>
                  {t('importHardwareWallet.instructions.ledger.line1')}
                </Text>
                <Text style={styles.instructionsTitle}>
                  {t('importHardwareWallet.instructions.ledger.line2')}
                </Text>
                <Text style={styles.instructionsTitle}>
                  {t('importHardwareWallet.instructions.ledger.line3')}
                </Text>
                <Text style={styles.instructionsTitle}>
                  {t('importHardwareWallet.instructions.ledger.line4')}
                </Text>
                <Text style={styles.instructionsTitle}>
                  {t('importHardwareWallet.instructions.ledger.line5')}
                </Text>
                {ledgerError && (
                  <Text style={styles.errorTitle}>{ledgerError}</Text>
                )}
              </View>
            )}
            {selected === 'spirekey' && (
              <View style={styles.instructionsWrapper}>
                <Text style={styles.instructionsTitleWrapper}>
                  {t('importHardwareWallet.spireKeyLabel', {
                    defaultValue: 'SpireKey',
                  })}
                </Text>
                <Text style={styles.instructionsTitle}>
                  {t('importHardwareWallet.instructions.spirekey.line1', {
                    defaultValue:
                      'Follow SpireKey instructions on the device/app',
                  })}
                </Text>
              </View>
            )}
            {showDeviceList && (
              <View style={styles.instructionsWrapper}>
                <Text style={styles.instructionsTitle}>
                  {isScanning
                    ? t('importHardwareWallet.scanning')
                    : t('importHardwareWallet.selectDevice')}
                </Text>
                <Text style={styles.instructionsTitle}>
                  {availableDevices.length
                    ? t('importHardwareWallet.clickDevice')
                    : ''}
                </Text>
                {availableDevices.map(device => (
                  <View
                    key={device.id}
                    style={styles.deviceItem}
                    onTouchEnd={() => handleSelectDevice(device)}
                  >
                    <Text style={styles.deviceName}>
                      {device.name || t('importHardwareWallet.deviceName')}
                    </Text>
                  </View>
                ))}
                {availableDevices.length === 0 && !isScanning && (
                  <Text style={styles.instructionsTitle}>
                    {t('importHardwareWallet.noDevices')}
                  </Text>
                )}
                {ledgerError && (
                  <Text style={styles.errorTitle}>
                    {ledgerError} - {t('importHardwareWallet.unlockMessage')}
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.deviceHeader}>
              <Text style={styles.deviceLabel}>
                {t('importHardwareWallet.importAccountHeader')}
              </Text>
              <Text style={styles.deviceValue}>
                {t('importHardwareWallet.importAccountSubtitle')}
              </Text>
            </View>
            <View style={styles.accountList}>
              <Checkbox
                isChecked={true}
                useBuiltInState={false}
                onPress={() => {
                  if (ledgerPublicKey) {
                    setSelectedAccountName(`k:${ledgerPublicKey}`);
                  }
                }}
                text={
                  ledgerPublicKey ? `k:${ledgerPublicKey}` : selectedAccountName
                }
                style={styles.accountItem}
                textStyle={styles.accountText}
              />
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {!ledgerPublicKey && !selectedAccountName ? (
          showDeviceList ? (
            <FooterButton
              disabled={isScanning}
              title={
                isScanning
                  ? t('importHardwareWallet.scanningButton')
                  : t('importHardwareWallet.stopScanButton')
              }
              onPress={stopScan}
            />
          ) : (
            <>
              {selected === 'ledger' ? (
                <FooterButton
                  disabled={!selected || isWaitingLedger}
                  title={t('common.connect')}
                  onPress={handleStartScan}
                />
              ) : null}
              {selected === 'spirekey' ? (
                <FooterButton
                  disabled={!selected || isWaitingSpireKey}
                  title={t('common.connect')}
                  onPress={handleSpireKeyConnect}
                />
              ) : null}
            </>
          )
        ) : (
          <FooterButton
            disabled={!selectedAccountName}
            title={t('common.import')}
            onPress={handleImport}
          />
        )}
      </View>
    </View>
  );
};

export default ImportHardwareWallet;

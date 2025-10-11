import React, { useCallback, useMemo, useState } from 'react';
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
  const dispatch = useDispatch<AppDispatch>();

  const [selected, setSelected] = useState<'ledger' | null>(null);
  const [ledgerPublicKey, setLedgerPublicKey] = useState<string>('');
  const [selectedAccountName, setSelectedAccountName] = useState<string>('');
  const [showDeviceList, setShowDeviceList] = useState(false);

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

  const handleImport = useCallback(() => {
    if (!ledgerPublicKey || !selectedAccountName) return;
    const account: any = {
      accountName: selectedAccountName,
      publicKey: ledgerPublicKey,
      chainId: '0',
      wallets: defaultWallets,
      type: AccountType.LEDGER,
    };
    dispatch(addNewAccount(account));
    dispatch(setSelectedAccount(account));
    resetError();
    disconnect();
    navigation.navigate({
      name: ERootStackRoutes.Home,
      params: undefined,
    } as any);
  }, [ledgerPublicKey, selectedAccountName, disconnect]);

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
        {!ledgerPublicKey ? (
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
                onPress={() => setSelectedAccountName(`k:${ledgerPublicKey}`)}
                text={`k:${ledgerPublicKey}`}
                style={styles.accountItem}
                textStyle={styles.accountText}
              />
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {!ledgerPublicKey ? (
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
            <FooterButton
              disabled={!selected || isWaitingLedger}
              title={t('common.connect')}
              onPress={handleStartScan}
            />
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

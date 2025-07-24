import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {createStyles} from './styles';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import FooterButton from '../../components/FooterButton';
import {useNavigation} from '@react-navigation/native';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {useAppThemeContext, useWalletConnectContext} from '../../contexts';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import Header from '../../components/Header';

const WalletConnectScan = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<TNavigationProp<ERootStackRoutes.WalletConnectScan>>();
  const {web3WalletClient} = useWalletConnectContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [textUri, setTextUri] = useState<string>('');
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0]?.value && codes[0]?.value !== textUri) {
        setTextUri(codes[0].value);
      }
    },
  });

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const {theme} = useAppThemeContext();
  const styles = useMemo(
    () => createStyles(theme, {bottomSpace, statusBarHeight}),
    [theme, bottomSpace, statusBarHeight],
  );

  const onProceed = useCallback(async () => {
    setIsLoading(true);
    if (textUri && web3WalletClient) {
      web3WalletClient?.core?.pairing?.pair({uri: textUri});
      setTimeout(() => {
        setIsLoading(false);
        navigation.goBack();
      }, 600);
    } else {
      setIsLoading(false);
    }
  }, [web3WalletClient, navigation, textUri]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const cameraView = useMemo(() => {
    return device != null && hasPermission ? (
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
    ) : (
      <View style={styles.camera} />
    );
  }, [device, hasPermission]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-bottomSpace}>
      <View style={styles.screen}>
        <Header title={t('walletConnectScan.header.title')} />
        <TouchableOpacity
          activeOpacity={1}
          onPress={Keyboard.dismiss}
          style={styles.container}>
          {cameraView}
          <View style={styles.footer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputSection}>
                <TextInput
                  style={styles.input}
                  autoFocus={false}
                  placeholder={t('walletConnectScan.placeholder')}
                  value={textUri}
                  onChangeText={setTextUri}
                />
              </View>
            </View>
            <FooterButton
              style={styles.footerButton}
              title={t('walletConnectScan.connect')}
              disabled={!textUri || isLoading}
              onPress={onProceed}
            />
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default WalletConnectScan;

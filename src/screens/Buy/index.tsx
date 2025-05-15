import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, ActivityIndicator, SafeAreaView, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import Button from '../Wallet/components/WalletBalance/components/Button';
import {MAIN_COLOR} from '../../constants/styles';
import {createStyles} from './styles';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {useShallowEqualSelector} from '../../store/utils';
import {makeSelectSelectedAccount} from '../../store/userWallet/selectors';
import Header from '../../components/Header';
import Warning from '../../components/Warning';

const BuyScreen = () => {
  const {t} = useTranslation();
  const [isAccepted, setIsAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [payloadToSign, setPayloadToSign] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const walletAddress = selectedAccount?.accountName;

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  const params = {
    apiKey: 'pk_prod_01JDMCZ0ZRZ14VBRW20B4HC04V',
    mode: 'buy,sell',
    onlyCryptoNetworks: 'kadena',
    defaultCrypto: 'KDA',
    sell_onlyCryptoNetworks: 'kadena',
    sell_defaultCrypto: 'KDA',
    themeName: 'light',
    containerColor: 'ffffff',
    primaryColor: MAIN_COLOR.replace('#', ''),
    secondaryTextColor: '000000',
    primaryTextColor: '000000',
    primaryBtnTextColor: 'ffffff',
    borderRadius: '0',
    wgBorderRadius: '0',
  };

  const generateOnramperUrl = useCallback(() => {
    const baseUrl = `https://buy.onramper.com?${new URLSearchParams(
      params,
    ).toString()}`;

    if (payloadToSign && signature) {
      return `${baseUrl}&${payloadToSign}&signature=${signature}`;
    }

    return baseUrl;
  }, [params, payloadToSign, signature]);

  useEffect(() => {
    if (walletAddress) {
      setPayloadToSign(`wallets=kadena:${walletAddress}`);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isAccepted && walletAddress && !signature) {
      setLoading(true);
      askForSignature();
    }
  }, [isAccepted, walletAddress, signature]);

  const askForSignature = async () => {
    if (!payloadToSign) {
      setError(t('buyScreen.error.walletUnavailable'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'https://relay.sspwallet.io/v1/sign/onramper',
        {
          method: 'POST',
          body: payloadToSign,
        },
      );

      const data = await response.json();

      if (data.signature) {
        setSignature(data.signature);
        setError('');
      } else {
        throw new Error('No signature returned');
      }
    } catch {
      console.error('Error getting signature');
      setError(t('buyScreen.error.unableConnect'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('buyScreen.header.title')} />

      {isAccepted && payloadToSign && signature ? (
        <WebView
          source={{uri: generateOnramperUrl()}}
          style={styles.webview}
          originWhitelist={[
            'https://*',
            'http://*',
            'about:blank',
            'about:srcdoc',
          ]}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          allowFileAccess
          mixedContentMode="always"
          thirdPartyCookiesEnabled
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={MAIN_COLOR} />
            </View>
          )}
          startInLoadingState
          onError={syntheticEvent => {
            console.error('WebView error:', syntheticEvent.nativeEvent);
          }}
        />
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
          {error ? <Warning text={error} isSerious /> : null}
        </View>
      ) : (
        <View style={styles.consentContainer}>
          <Text style={styles.consentText}>
            {t('buyScreen.consent.description')}
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title={t('common.cancel')}
              backgroundColor="rgba(236,236,245,0.5)"
              textColor={MAIN_COLOR}
              onPress={() => navigation.goBack()}
            />
            <Button
              title={t('common.confirm')}
              onPress={() => setIsAccepted(true)}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BuyScreen;

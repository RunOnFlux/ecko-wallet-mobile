import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import Button from '../Wallet/components/WalletBalance/components/Button';
import {MAIN_COLOR} from '../../constants/styles';
import {createStyles} from './styles';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {useShallowEqualSelector} from '../../store/utils';
import {makeSelectSelectedAccount} from '../../store/userWallet/selectors';
import Header from '../../components/Header';
import Warning from '../../components/Warning';

const BuyScreen = () => {
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

  const generateOnramperUrl = () => {
    const baseUrl = `https://buy.onramper.com?${new URLSearchParams(
      params,
    ).toString()}`;

    if (payloadToSign && signature) {
      return `${baseUrl}&${payloadToSign}&signature=${signature}`;
    }

    return baseUrl;
  };

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
      setError('Wallet address not available');
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
    } catch (error) {
      console.error('Error getting signature:', error);
      setError('Unable to connect to the service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const webViewConfig = {
    originWhitelist: ['https://*', 'http://*', 'about:blank', 'about:srcdoc'],
    javaScriptEnabled: true,
    domStorageEnabled: true,
    allowsInlineMediaPlayback: true,
    allowsFullscreenVideo: true,
    mediaPlaybackRequiresUserAction: false,
    allowFileAccess: true,
    mixedContentMode: 'always' as const,
    thirdPartyCookiesEnabled: true,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Buy" />

      {isAccepted && payloadToSign && signature ? (
        <WebView
          source={{uri: generateOnramperUrl()}}
          style={styles.webview}
          {...webViewConfig}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={MAIN_COLOR} />
            </View>
          )}
          startInLoadingState={true}
          onError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.error('WebView error:', nativeEvent);
          }}
        />
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
          {error && <Warning text={error} isSerious />}
        </View>
      ) : (
        <View style={styles.consentContainer}>
          <Text style={styles.consentText}>
            The purchase and sale of cryptocurrencies are facilitated through a
            third-party service provided by Onramper.
            {'\n\n'}
            While eckoWallet is committed to ensuring the highest level of
            security for its users, we cannot guarantee the security and privacy
            of third-party services.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              backgroundColor="rgba(236,236,245,0.5)"
              textColor={MAIN_COLOR}
              onPress={() => navigation.goBack()}
            />
            <Button title="Confirm" onPress={() => setIsAccepted(true)} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BuyScreen;

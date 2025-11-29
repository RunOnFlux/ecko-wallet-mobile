import React, { useCallback, useEffect, useMemo } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Provider } from 'react-redux';
import RNBootSplash from 'react-native-bootsplash';
import { PactProvider } from './src/contexts/Pact';
import { AppThemeProvider } from './src/contexts/AppTheme';
import AppStack from './src/navigation/AppStack';
import { persistor, store } from './src/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import LogoSvg from './src/assets/images/logo.svg';
import JailMonkey from 'jail-monkey';
import { WalletConnectProvider } from './src/contexts/WalletConnect';
import { useWalletConnect } from './src/utils/walletConnect';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/locales/i18n';
import { IAppTheme } from './src/themes/types';
import { useAppThemeContext } from './src/contexts';
import { LedgerProvider } from './src/contexts/Ledger';
import { SpireKeyProvider } from './src/contexts/SpireKey';

const makeStyles = (theme: IAppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
  });

const App = () => {
  const { theme } = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const onReady = useCallback(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  const statusBarStyle = useMemo<'light-content' | 'dark-content'>(
    () => (theme.isDark ? 'light-content' : 'dark-content'),
    [theme],
  );

  const statusBarColor = useMemo(
    () => (Platform.OS === 'ios' ? 'transparent' : theme.background),
    [theme, Platform.OS],
  );

  const appTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.background,
      },
    }),
    [theme],
  );

  useEffect(() => {
    if (JailMonkey.isJailBroken()) {
      RNBootSplash.hide({ fade: true });
      Alert.alert(
        'Device is rooted',
        'Jail-broken or rooted devices can not use eckoWALLET',
        undefined,
        { cancelable: false },
      );
    }
  }, []);

  const walletConnectModal = useWalletConnect();

  if (JailMonkey.isJailBroken()) {
    return (
      <>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={statusBarColor}
          translucent={true}
        />
        <SafeAreaView style={styles.screen}>
          <LogoSvg />
        </SafeAreaView>
      </>
    );
  }
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={false}
      />
      <NavigationContainer onReady={onReady} theme={appTheme}>
        <AppStack />
      </NavigationContainer>
      {walletConnectModal}
      <Toast />
    </>
  );
};

const AppContainer = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppThemeProvider>
          <PactProvider>
            <LedgerProvider>
              <SpireKeyProvider>
                <WalletConnectProvider>
                  <PersistGate loading={null} persistor={persistor}>
                    <App />
                  </PersistGate>
                </WalletConnectProvider>
              </SpireKeyProvider>
            </LedgerProvider>
          </PactProvider>
        </AppThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

export default AppContainer;

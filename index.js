/**
 * @format
 */

import '@walletconnect/react-native-compat';
import 'text-encoding-polyfill';
import lib from 'cardano-crypto.js/kadena-crypto';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

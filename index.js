/**
 * @format
 */

import '@walletconnect/react-native-compat';
import 'text-encoding-polyfill';
import 'react-native-get-random-values';
import lib from 'cardano-crypto.js/kadena-crypto';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Buffer as NodeBuffer} from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = NodeBuffer;
}

AppRegistry.registerComponent(appName, () => App);

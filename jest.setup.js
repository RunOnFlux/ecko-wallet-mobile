/* eslint-env jest */
// Native modules aren't available under Jest; stub the ones App pulls in at import time.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-mmkv', () => {
  const createMMKV = () => {
    const data = new Map();
    return {
      set: (k, v) => data.set(k, v),
      getString: k => (typeof data.get(k) === 'string' ? data.get(k) : undefined),
      getNumber: k => (typeof data.get(k) === 'number' ? data.get(k) : undefined),
      getBoolean: k => (typeof data.get(k) === 'boolean' ? data.get(k) : undefined),
      contains: k => data.has(k),
      remove: k => data.delete(k),
      getAllKeys: () => [...data.keys()],
      clearAll: () => data.clear(),
    };
  };
  return {createMMKV};
});
jest.mock('@react-native-clipboard/clipboard', () =>
  require('@react-native-clipboard/clipboard/jest/clipboard-mock'),
);
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);
jest.mock('react-native-localize', () => require('react-native-localize/mock'));
jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: {trigger: jest.fn()},
  trigger: jest.fn(),
}));
jest.mock('react-native-snackbar', () => ({
  __esModule: true,
  default: {show: jest.fn(), dismiss: jest.fn(), LENGTH_SHORT: -1, LENGTH_LONG: 0, LENGTH_INDEFINITE: -2},
}));
jest.mock('react-native-biometrics', () => {
  const Biometrics = jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn(() => Promise.resolve({available: false})),
    simplePrompt: jest.fn(() => Promise.resolve({success: false})),
  }));
  return {__esModule: true, default: Biometrics, BiometryTypes: {TouchID: 'TouchID', FaceID: 'FaceID', Biometrics: 'Biometrics'}};
});
jest.mock('jail-monkey', () => ({
  __esModule: true,
  default: {isJailBroken: jest.fn(() => false), isDebuggedMode: jest.fn(() => Promise.resolve(false))},
}));
jest.mock('bcrypt-react-native', () => ({
  __esModule: true,
  default: {getSalt: jest.fn(() => Promise.resolve('salt')), hash: jest.fn(() => Promise.resolve('hash'))},
}));
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    onStateChange: jest.fn(() => ({remove: jest.fn()})),
    state: jest.fn(() => Promise.resolve('PoweredOff')),
    destroy: jest.fn(),
  })),
  State: {PoweredOn: 'PoweredOn', PoweredOff: 'PoweredOff'},
}));
jest.mock('@ledgerhq/react-native-hw-transport-ble', () => ({
  __esModule: true,
  default: {listen: jest.fn(() => ({unsubscribe: jest.fn()})), open: jest.fn()},
}));
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: jest.fn(() => undefined),
  useCameraPermission: jest.fn(() => ({hasPermission: false, requestPermission: jest.fn()})),
  useCodeScanner: jest.fn(() => ({})),
}));
jest.mock('react-native-webview', () => ({__esModule: true, WebView: () => null, default: () => null}));
jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: {hide: jest.fn(() => Promise.resolve()), isVisible: jest.fn(() => Promise.resolve(false))},
}));

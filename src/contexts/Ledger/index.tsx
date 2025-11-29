import React, { createContext, useContext, useState, useEffect } from 'react';
import { listen } from '@ledgerhq/logs';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { PermissionsAndroid, Platform } from 'react-native';
import type { Device } from 'react-native-ble-plx';
import { Observable } from 'rxjs';
import KadenaLedger, {
  BuildTransactionResult,
  SignTransactionResult,
  TransferCrossChainTxParams,
  TransferTxParams,
} from 'hw-app-kda/lib/Kadena';
import { registerLedgerApi, registerModalCallbacks } from './service';
import LedgerInstructionsModal from './LedgerInstructionsModal';

export const bufferToHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

export const DEFAULT_BIP32_PATH = "m/44'/626'/0'/0/0";

interface KadenaLedgerData {
  error: string;
  isWaitingLedger: boolean;
  isScanning: boolean;
  availableDevices: Device[];
  scanForDevices: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: Device) => Promise<KadenaLedger | undefined>;
  getLedger: () => Promise<KadenaLedger | undefined>;
  getPublicKey: () => Promise<string | undefined>;
  signHash: (hash: string) => Promise<SignTransactionResult | undefined>;
  sendTransaction: (
    params: TransferTxParams,
  ) => Promise<BuildTransactionResult | undefined>;
  sendCrossChainTransaction: (
    params: TransferCrossChainTxParams,
  ) => Promise<BuildTransactionResult | undefined>;
  resetError: () => void;
  disconnect: () => void;
}

export const LedgerContext = createContext<KadenaLedgerData>({
  error: '',
  isWaitingLedger: false,
  isScanning: false,
  availableDevices: [],
  scanForDevices: async () => {},
  stopScan: () => {},
  connectToDevice: async () => undefined,
  getLedger: async () => undefined,
  getPublicKey: async () => undefined,
  signHash: async () => undefined,
  sendTransaction: async () => undefined,
  sendCrossChainTransaction: async () => undefined,
  resetError: () => {},
  disconnect: () => {},
});

export const LedgerProvider = ({ children }: { children: React.ReactNode }) => {
  const [kadenaLedger, setKadenaLedger] = useState<KadenaLedger | undefined>();
  const [isWaitingLedger, setIsWaitingLedger] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string>('');
  const [scanSubscription, setScanSubscription] = useState<any>(null);

  useEffect(() => {
    registerModalCallbacks({
      setVisible: setIsWaitingLedger,
    });
  }, []);

  const ensureBlePermissions = async () => {
    if (Platform.OS === 'android') {
      const sdk = Number(Platform.Version) || 0;
      const permissions: string[] = [];
      if (sdk >= 31) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );
      } else {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
      const results = await PermissionsAndroid.requestMultiple(
        permissions as unknown as any,
      );
      const allGranted = permissions.every(p => {
        const status = (results as any)[p];
        return status === PermissionsAndroid.RESULTS.GRANTED;
      });
      if (!allGranted) {
        throw new Error('Bluetooth permissions not granted');
      }
    }
  };

  const waitForLedgerRequest = async <T,>(fn: () => Promise<T>) => {
    try {
      setIsWaitingLedger(true);
      const result = await fn();
      setIsWaitingLedger(false);
      return result;
    } catch (err: any) {
      setIsWaitingLedger(false);
      setError(String(err?.message || err));
      throw err;
    }
  };

  const scanForDevices = async () => {
    setError('');
    try {
      await ensureBlePermissions();

      const bluetoothState = await new Promise<boolean>(resolve => {
        const stateSubscription = new Observable(
          TransportBLE.observeState,
        ).subscribe((e: any) => {
          console.log('Bluetooth state:', e);
          if (e.available) {
            stateSubscription.unsubscribe();
            resolve(true);
          } else if (e.type === 'Unauthorized' || e.type === 'PoweredOff') {
            stateSubscription.unsubscribe();
            resolve(false);
          }
        });

        setTimeout(() => {
          stateSubscription.unsubscribe();
          resolve(true);
        }, 3000);
      });

      if (!bluetoothState) {
        setError('Bluetooth is not available or unauthorized');
        return;
      }

      if (Platform.OS === 'ios') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setIsScanning(true);
      setAvailableDevices([]);

      const subscription = new Observable(TransportBLE.listen).subscribe({
        next: (e: any) => {
          console.log('BLE event:', e);
          if (e.type === 'add') {
            setAvailableDevices(prevDevices => {
              const exists = prevDevices.some(d => d.id === e.descriptor.id);
              if (exists) return prevDevices;
              return [...prevDevices, e.descriptor];
            });
          }
        },
        error: (error: any) => {
          console.log('Scan error:', error);
          setError(`Scan error: ${error.message || error}`);
          setIsScanning(false);
        },
      });

      setScanSubscription(subscription);
    } catch (err: any) {
      console.log('Unable to scan:', err);
      setError(`Unable to scan: ${err.message || err}`);
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (scanSubscription) {
      scanSubscription.unsubscribe();
      setScanSubscription(null);
    }
    setIsScanning(false);
  };

  const connectToDevice = async (
    device: Device,
  ): Promise<KadenaLedger | undefined> => {
    setError('');
    stopScan();

    try {
      const transport = await TransportBLE.open(device);

      transport.on('disconnect', () => {
        console.log('Ledger disconnected');
        setKadenaLedger(undefined);
      });

      if (__DEV__) listen(log => console.log('ledger', log));

      const kadena = new KadenaLedger(transport);
      setKadenaLedger(kadena);
      return kadena;
    } catch (err: any) {
      setError(`Unable to connect: ${err.message || err}`);
      throw err;
    }
  };

  const disconnect = () => {
    if (kadenaLedger?.transport) {
      kadenaLedger.transport.close();
    }
    setKadenaLedger(undefined);
  };

  const getLedger = async (): Promise<KadenaLedger | undefined> => {
    if (!kadenaLedger?.transport) {
      setError(
        'No device connected. Please scan and connect to a device first.',
      );
      return undefined;
    }
    return kadenaLedger;
  };

  const getPublicKey = async (): Promise<string | undefined> => {
    setError('');
    const ledger = await getLedger();
    const publicKeyResponse = (await ledger?.getPublicKey(DEFAULT_BIP32_PATH))
      ?.publicKey;
    return publicKeyResponse ? bufferToHex(publicKeyResponse) : undefined;
  };

  const signHash = async (
    hash: string,
  ): Promise<SignTransactionResult | undefined> => {
    const ledger = await getLedger();
    return waitForLedgerRequest(async () =>
      ledger?.signHash(DEFAULT_BIP32_PATH, hash),
    );
  };

  const sendTransaction = async (
    params: TransferTxParams,
  ): Promise<BuildTransactionResult | undefined> =>
    waitForLedgerRequest(async () =>
      (await getLedger())?.signTransferCreateTx({
        path: DEFAULT_BIP32_PATH,
        ...params,
      }),
    );

  const sendCrossChainTransaction = async (
    params: TransferCrossChainTxParams,
  ): Promise<BuildTransactionResult | undefined> =>
    waitForLedgerRequest(async () =>
      (await getLedger())?.signTransferCrossChainTx({
        path: DEFAULT_BIP32_PATH,
        ...params,
      }),
    );

  return (
    <LedgerContext.Provider
      value={{
        error,
        isWaitingLedger,
        isScanning,
        availableDevices,
        scanForDevices,
        stopScan,
        connectToDevice,
        getLedger,
        getPublicKey,
        signHash,
        sendTransaction,
        sendCrossChainTransaction,
        resetError: () => setError(''),
        disconnect,
      }}
    >
      {children}
      <LedgerInstructionsModal
        isVisible={isWaitingLedger}
        // isVisible
        close={() => setIsWaitingLedger(false)}
      />
    </LedgerContext.Provider>
  );
};

export const LedgerConsumer = LedgerContext.Consumer;

export function useLedgerContext() {
  return useContext(LedgerContext);
}

registerLedgerApi({
  signHash: async (hash: string) => {
    const transport = await TransportBLE.create();
    try {
      const kadena = new KadenaLedger(transport);
      return await kadena.signHash(DEFAULT_BIP32_PATH, hash);
    } finally {
      try {
        await transport.close();
      } catch (_) {}
    }
  },
  signTransferCreateTx: async params => {
    const transport = await TransportBLE.create();
    try {
      const kadena = new KadenaLedger(transport);
      return await kadena.signTransferCreateTx({
        path: DEFAULT_BIP32_PATH,
        ...params,
      });
    } finally {
      try {
        await transport.close();
      } catch (_) {}
    }
  },
  signTransferCrossChainTx: async params => {
    const transport = await TransportBLE.create();
    try {
      const kadena = new KadenaLedger(transport);
      return await kadena.signTransferCrossChainTx({
        path: DEFAULT_BIP32_PATH,
        ...params,
      });
    } finally {
      try {
        await transport.close();
      } catch (_) {}
    }
  },
});

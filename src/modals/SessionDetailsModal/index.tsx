import React, {FC, useCallback, useMemo, useState} from 'react';
import {View, Text, Image, ActivityIndicator, Alert} from 'react-native';
import Modal from '../../components/Modal';
import {TTransactionDetailsModalProps} from './types';
import {makeStyles} from './styles';
import {KDA_NAMESPACE} from '../../utils/walletConnect';
import ListItem from '../../components/ListItem';
import {truncate} from '../../utils/stringHelpers';
import {MAIN_COLOR} from '../../constants/styles';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import TrashEmptySvg from '../../assets/images/trash-empty.svg';
import {useAppThemeContext, useWalletConnectContext} from '../../contexts';
import {useTranslation} from 'react-i18next';

const SessionDetailsModal: FC<TTransactionDetailsModalProps> = React.memo(
  ({details, toggle, onDelete, isVisible}) => {
    const {t} = useTranslation();
    const {web3WalletClient} = useWalletConnectContext();

    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const [updatedDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const session = useMemo(() => {
      if (details?.topic) {
        const sessions = web3WalletClient?.getActiveSessions();
        if (sessions && sessions[details.topic]) {
          return sessions[details.topic];
        }
      }
      return null;
    }, [details, web3WalletClient]);

    const expiryDate = useMemo(
      () => (session ? new Date(session.expiry * 1000) : null),
      [session],
    );

    const onDeleteSession = useCallback(() => {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
      Alert.alert(t('session.deleteTitle'), t('session.deleteDescription'), [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            if (details.topic) {
              try {
                await web3WalletClient?.disconnectSession({
                  topic: details.topic,
                  reason: {
                    message: 'User disconnected.',
                    code: 5000,
                  },
                });
                toggle();
                setTimeout(() => onDelete(), 200);
              } catch (e) {
                Alert.alert(
                  t('session.deleteFailedTitle'),
                  t('session.deleteFailedMessage'),
                );
              }
            }
            setIsLoading(false);
          },
        },
      ]);
    }, [onDelete, details]);

    const sessionChain = useMemo(() => {
      if (session) {
        let modifiedChains: string[] = [];
        session.namespaces[KDA_NAMESPACE]?.accounts.forEach(account => {
          const [type, chain] = account.split(':');
          const chainId = `${type}:${chain}`;
          modifiedChains.push(chainId);
        });
        modifiedChains = modifiedChains.filter(
          (item, pos, self) =>
            self.findIndex(subItem => subItem === item) === pos,
        );
        return {
          title: t('session.reviewPermissions', {namespace: KDA_NAMESPACE}),
          namespace: {
            chains: modifiedChains.map(chainId => {
              const allMethods = [
                ...(session.namespaces[KDA_NAMESPACE]?.methods || []),
              ];
              const allEvents = [
                ...(session.namespaces[KDA_NAMESPACE]?.events || []),
              ];
              return {
                name: chainId,
                events: allEvents,
                methods: allMethods,
              };
            }),
          },
        };
      }
      return null;
    }, [session]);

    if (!session) {
      return null;
    }
    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={t('session.title')}
        onPressLeftItem={onDeleteSession}
        leftHeaderItem={<TrashEmptySvg />}>
        <View style={styles.content}>
          <View style={styles.itemContainer}>
            {details?.logo ? (
              <View style={styles.iconWrapper}>
                <Image
                  source={{uri: details?.logo}}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            ) : null}
            <View style={styles.center}>
              <Text style={styles.title}>{details?.name}</Text>
              {details?.url ? (
                <Text style={styles.link}>
                  {truncate(
                    details?.url?.split('https://')[1] ??
                      t('session.unknownUrl'),
                    23,
                  )}
                </Text>
              ) : null}
            </View>
          </View>
          {sessionChain ? (
            <View style={styles.chainContainer}>
              <Text style={styles.chainTitle}>{sessionChain.title}</Text>
              {sessionChain.namespace.chains.map(chain => (
                <React.Fragment key={`item-${chain.name}`}>
                  <Text style={styles.chainLabel}>{chain.name}</Text>
                  <View style={styles.chainWrapper}>
                    <Text style={styles.chainText}>{t('session.methods')}</Text>
                    <Text style={styles.chainDescription}>
                      {Array.isArray(chain?.methods) &&
                      chain?.methods?.length > 0
                        ? chain.methods.join(', ')
                        : '-'}
                    </Text>
                  </View>
                  <View style={styles.chainWrapper}>
                    <Text style={styles.chainText}>{t('session.events')}</Text>
                    <Text style={styles.chainDescription}>
                      {Array.isArray(chain?.events) && chain?.events?.length > 0
                        ? chain.events.join(', ')
                        : '-'}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.footer}>
          <View style={styles.statusWrapper}>
            <Text style={styles.statusText}>{t('session.expiry')}</Text>
            <Text style={styles.time}>
              {expiryDate
                ? `${expiryDate.toDateString()} ${expiryDate.toLocaleTimeString()}`
                : '-'}
            </Text>
          </View>
          <View style={styles.updateWrapper}>
            <Text style={styles.statusText}>{t('session.lastUpdated')}</Text>
            <Text
              style={
                styles.time
              }>{`${updatedDate.toDateString()} ${updatedDate.toLocaleTimeString()}`}</Text>
          </View>
          <ListItem
            text={t('session.deleteSession')}
            disabled={isLoading}
            onPress={onDeleteSession}
            textStyle={styles.itemRed}
            style={styles.itemStyle}
          />
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text.primary} />
          </View>
        ) : null}
      </Modal>
    );
  },
);

export default SessionDetailsModal;

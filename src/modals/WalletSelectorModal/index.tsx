import React, {FC, useCallback} from 'react';
import {View, Alert} from 'react-native';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ExternalLinkSvg from '../../assets/images/external-link.svg';
import TrashEmptySvg from '../../assets/images/trash-empty.svg';
import Modal from '../../components/Modal';
import Checkbox from '../../components/Checkbox';
import ListItem from '../../components/ListItem';
import {
  makeSelectSelectedAccount,
  makeSelectAccounts,
} from '../../store/userWallet/selectors';
import {
  deleteSelectedAccount,
  setSelectedAccount,
} from '../../store/userWallet';
import {TWalletSelectorModalProps} from './types';
import {styles} from './styles';
import {TAccount} from '../../store/userWallet/types';
import {cutStr} from '../../utils/stringHelpers';
import {getGenerateAccount} from '../../store/userWallet/actions';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';
import {useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Snackbar from 'react-native-snackbar';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {useShallowEqualSelector} from '../../store/utils';
import {AppDispatch} from '../../store/store';

const WalletSelectorModal: FC<TWalletSelectorModalProps> = React.memo(
  ({toggle, isVisible}) => {
    const {t} = useTranslation();
    const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
    const dispatch = useDispatch<AppDispatch>();

    const accounts = useShallowEqualSelector(makeSelectAccounts);
    const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);

    const handlePressRemove = useCallback(() => {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
      Alert.alert(
        t('walletSelector.removeConfirmTitle'),
        t('walletSelector.removeConfirmMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('walletSelector.remove'),
            style: 'destructive',
            onPress: () => {
              dispatch(deleteSelectedAccount());
            },
          },
        ],
      );
    }, []);

    const handlePressShare = useCallback(async () => {
      if (selectedAccount) {
        ReactNativeHapticFeedback.trigger('impactMedium', {
          enableVibrateFallback: false,
          ignoreAndroidSystemSettings: false,
        });
        Clipboard.setString(
          `accountName:${selectedAccount.accountName || ''};publicKey:${
            selectedAccount.publicKey
          };`,
        );
        Snackbar.show({
          text: t('walletSelector.copySuccess'),
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    }, [selectedAccount]);

    const handlePressRecoveryPhrase = useCallback(async () => {
      toggle();
      setTimeout(() => {
        navigation.navigate({
          name: ERootStackRoutes.ExportRecoveryPhraseAuth,
          params: undefined,
        });
      }, 600);
    }, [toggle, navigation]);

    const handlePressCheckBox = useCallback(
      (account: TAccount) => () => {
        if (selectedAccount?.accountName !== account?.accountName) {
          dispatch(setSelectedAccount(account));
        }
      },
      [selectedAccount],
    );

    const handlePressCreate = useCallback(() => {
      dispatch(getGenerateAccount({}));
      toggle();
    }, [toggle]);

    const handlePressImport = useCallback(() => {
      toggle();
      setTimeout(() => {
        navigation.navigate({
          name: ERootStackRoutes.ImportAccount,
          params: undefined,
        });
      }, 600);
    }, [navigation, toggle]);

    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={t('walletSelector.title')}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            {(accounts || []).map((account: TAccount) => (
              <Checkbox
                key={account.accountName}
                isChecked={account.accountName === selectedAccount?.accountName}
                useBuiltInState={false}
                onPress={handlePressCheckBox(account)}
                text={cutStr(account.accountName)}
                textStyle={styles.checkBoxText}
                style={styles.checkBoxWrapper}
              />
            ))}
          </View>
          {(accounts || []).length === 0 ? null : (
            <View style={styles.modalFooter}>
              <ListItem
                text={t('walletSelector.share')}
                icon={<ExternalLinkSvg />}
                onPress={handlePressShare}
                style={styles.itemStyle}
              />
              <ListItem
                text={t('walletSelector.exportRecovery')}
                icon={<ExternalLinkSvg />}
                onPress={handlePressRecoveryPhrase}
                style={styles.itemStyle}
              />
              {(accounts || []).length === 1 ? null : (
                <ListItem
                  text={t('walletSelector.removeSelected')}
                  icon={<TrashEmptySvg />}
                  onPress={handlePressRemove}
                  style={styles.itemStyle}
                />
              )}
            </View>
          )}
          <View style={styles.modalFooter}>
            <ListItem
              text={t('walletSelector.create')}
              onPress={handlePressCreate}
              style={styles.itemStyle}
            />
            <ListItem
              text={t('walletSelector.import')}
              onPress={handlePressImport}
              style={styles.itemStyle}
            />
          </View>
        </View>
      </Modal>
    );
  },
);

export default WalletSelectorModal;

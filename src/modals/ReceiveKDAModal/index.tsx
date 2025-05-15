import React, {FC} from 'react';
import {View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import Modal from '../../components/Modal';
import ListItem from './components/ListItem';
import {TReceiveKDAModalProps} from './types';

import {styles} from './styles';
import {makeSelectSelectedAccount} from '../../store/userWallet/selectors';
import {useShallowEqualSelector} from '../../store/utils';
import {useTranslation} from 'react-i18next';

const ReceiveKDAModal: FC<TReceiveKDAModalProps> = React.memo(
  ({close, isVisible}) => {
    const {t} = useTranslation();
    const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
    return (
      <Modal isVisible={isVisible} close={close} title={t('receive.title')}>
        <View style={styles.modalContainer}>
          <View style={styles.qrCodeWrapper}>
            <QRCode value={selectedAccount?.accountName} size={200} />
          </View>
          <ListItem
            text={selectedAccount?.accountName || ''}
            title={t('receive.accountNameLabel')}
          />
        </View>
      </Modal>
    );
  },
);

export default ReceiveKDAModal;

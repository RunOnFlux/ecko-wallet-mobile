import React, {FC} from 'react';
import {Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import Modal from '../../../../components/Modal';
import Info from '../Info';
import Button from '../../../Wallet/components/WalletBalance/components/Button';
import {useSafeAreaValues} from '../../../../utils/deviceHelpers';
import {createStyles} from './styles';
import {TConfirmModal} from './types';

const ConfirmModal: FC<TConfirmModal> = ({
  isVisible,
  close,
  priceImpact,
  firstToken,
  secondToken,
  onConfirm,
}) => {
  const {t} = useTranslation();
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  return (
    <Modal
      isVisible={isVisible}
      close={close}
      title={t('swap.confirmModal.title')}
      contentStyle={styles.content}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('swap.confirmModal.give')}</Text>
        <Text style={styles.value}>
          {`${firstToken.amount} ${firstToken.coin}`}
        </Text>

        <Text style={styles.title}>{t('swap.confirmModal.receive')}</Text>
        <Text style={styles.value}>
          {`${secondToken.amount} ${secondToken.coin}`}
        </Text>

        <Info
          withMoreInfo={true}
          firstToken={firstToken}
          secondToken={secondToken}
          priceImpact={priceImpact}
        />

        <Button
          style={styles.button}
          onPress={onConfirm}
          title={t('swap.confirmModal.confirmButton')}
        />
      </View>
    </Modal>
  );
};

export default ConfirmModal;

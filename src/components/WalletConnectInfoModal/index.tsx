import React, {FC} from 'react';
import {Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {TWalletConnectInfoProps} from './types';
import {styles} from './styles';
import FooterButton from '../FooterButton';

const WalletConnectInfoModal: FC<TWalletConnectInfoProps> = React.memo(
  props => {
    const {t} = useTranslation();
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <Text style={styles.text1}>
            {t('components.walletConnectInfoModal.text1')}
          </Text>
          <Text style={styles.text2}>
            {t('components.walletConnectInfoModal.text2')}
          </Text>
          <FooterButton
            style={styles.button}
            title={t('components.walletConnectInfoModal.button')}
            onPress={props.onConfirm}
          />
        </View>
      </View>
    );
  },
);

export default WalletConnectInfoModal;

import React, {FC} from 'react';
import {Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {TWalletConnectHelpProps} from './types';
import {styles} from './styles';
import FooterButton from '../FooterButton';

const WalletConnectHelpModal: FC<TWalletConnectHelpProps> = React.memo(
  props => {
    const {t} = useTranslation();
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <Text style={styles.text1}>
            {t('components.walletConnectHelpModal.text1')}
          </Text>
          <Text style={styles.text2}>
            {t('components.walletConnectHelpModal.text2')}
          </Text>
          <FooterButton
            style={styles.button}
            title={t('components.walletConnectHelpModal.button')}
            onPress={props.onConfirm}
          />
        </View>
      </View>
    );
  },
);

export default WalletConnectHelpModal;

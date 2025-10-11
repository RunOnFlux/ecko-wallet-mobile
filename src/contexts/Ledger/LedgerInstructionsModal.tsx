import React, { FC, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/Modal';
import { useAppThemeContext } from '..';
import { makeStyles } from './styles';

interface LedgerInstructionsModalProps {
  isVisible: boolean;
  close: () => void;
}

const LedgerInstructionsModal: FC<LedgerInstructionsModalProps> = ({
  isVisible,
  close,
}) => {
  const { t } = useTranslation();
  const { theme } = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Modal
      isVisible={isVisible}
      close={close}
      title={t('importHardwareWallet.titleModal')}
      contentStyle={styles.content}
      style={styles.modal}
      coverScreen={true}
      statusBarTranslucent={true}
    >
      <View style={styles.instructionsWrapper}>
        <Text style={styles.instructionsTitle}>
          {t('importHardwareWallet.instructions.ledger.line1')}
        </Text>
        <Text style={styles.instructionsTitle}>
          {t('importHardwareWallet.instructions.ledger.line2')}
        </Text>
        <Text style={styles.instructionsTitle}>
          {t('importHardwareWallet.instructions.ledger.line3')}
        </Text>
        <Text style={styles.instructionsTitle}>
          {t('importHardwareWallet.instructions.ledger.line4')}
        </Text>
        <Text style={styles.instructionsTitle}>
          {t('importHardwareWallet.instructions.ledger.line5')}
        </Text>
        <ActivityIndicator size="large" color={theme.text.primary} />
      </View>
    </Modal>
  );
};

export default LedgerInstructionsModal;

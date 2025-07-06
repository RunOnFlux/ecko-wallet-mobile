import React, {FC, useCallback} from 'react';
import {View} from 'react-native';
import Modal from '../../components/Modal';
import Checkbox from '../../components/Checkbox';
import {styles} from './styles';
import {useTranslation} from 'react-i18next';
import {useAppThemeContext} from '../../contexts';
import {AppThemeEnum, THEME_OPTIONS} from '../../themes/types';

export interface TThemeSelectorModalProps {
  isVisible: boolean;
  toggle: () => void;
}

const ThemeSelectorModal: FC<TThemeSelectorModalProps> = React.memo(
  ({toggle, isVisible}) => {
    const {t} = useTranslation();
    const {selectedTheme, setTheme, isLoading} = useAppThemeContext();

    const handlePressTheme = useCallback(
      (themeKey: AppThemeEnum) => async () => {
        await setTheme(themeKey);
        toggle();
      },
      [setTheme, toggle],
    );

    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={t('common.selectTheme') || 'Select Theme'}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            {THEME_OPTIONS.map(theme => {
              const isChecked = selectedTheme === theme.key;
              return (
                <Checkbox
                  key={theme.key}
                  isChecked={isChecked}
                  useBuiltInState={false}
                  text={
                    t(`common.theme.${theme.key.toLowerCase()}`) || theme.label
                  }
                  textStyle={styles.checkBoxText}
                  style={styles.checkBoxWrapper}
                  onPress={handlePressTheme(theme.key)}
                  disabled={isLoading}
                />
              );
            })}
          </View>
        </View>
      </Modal>
    );
  },
);

export default ThemeSelectorModal;

import React, {FC, useCallback} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Modal from '../../components/Modal';
import Checkbox from '../../components/Checkbox';
import {styles} from './styles';
import emojiFlags from 'emoji-flags';

export interface TLanguageSelectorModalProps {
  isVisible: boolean;
  toggle: () => void;
}

export const LANGUAGES = [
  {code: 'en', name: 'English', countryCode: 'gb'},
  {code: 'id', name: 'Indonesian', countryCode: 'id'},
  {code: 'cs', name: 'Czech', countryCode: 'cz'},
  {code: 'fil', name: 'Filipino', countryCode: 'ph'},
  {code: 'ru', name: 'Russian', countryCode: 'ru'},
  {code: 'de', name: 'German', countryCode: 'de'},
  {code: 'fr', name: 'French', countryCode: 'fr'},
  {code: 'it', name: 'Italiano', countryCode: 'it'},
  {code: 'bn', name: 'Bengali', countryCode: 'bd'},
  {code: 'hi', name: 'Hindi', countryCode: 'in'},
  {code: 'hr', name: 'Croatian', countryCode: 'hr'},
  {code: 'el', name: 'Greek', countryCode: 'gr'},
  {code: 'ta', name: 'Tamil', countryCode: 'in'}, // Tamil → India
  {code: 'fi', name: 'Finnish', countryCode: 'fi'},
  {code: 'hu', name: 'Hungarian', countryCode: 'hu'},
  {code: 'ja', name: 'Japanese', countryCode: 'jp'},
  {code: 'es', name: 'Spanish', countryCode: 'es'},
  {code: 'vi', name: 'Vietnamese', countryCode: 'vn'},
  {code: 'zh', name: 'Chinese (Simplified)', countryCode: 'cn'},
  {code: 'zh_TW', name: 'Chinese (Traditional)', countryCode: 'tw'},
  {code: 'ko', name: 'Korean', countryCode: 'kr'},
  {code: 'bg', name: 'Bulgarian', countryCode: 'bg'},
  {code: 'sl', name: 'Slovenian', countryCode: 'si'},
  {code: 'pt', name: 'Portuguese', countryCode: 'pt'},
  {code: 'uk', name: 'Ukrainian', countryCode: 'ua'},
  {code: 'ms', name: 'Malay', countryCode: 'my'},
  {code: 'th', name: 'Thai', countryCode: 'th'},
  {code: 'af', name: 'Afrikaans', countryCode: 'za'},
  {code: 'ca', name: 'Catalan', countryCode: 'es'}, // Catalan → Spain
  {code: 'nl', name: 'Dutch', countryCode: 'nl'},
  {code: 'pl', name: 'Polish', countryCode: 'pl'},
  {code: 'ro', name: 'Romanian', countryCode: 'ro'},
  {code: 'sk', name: 'Slovak', countryCode: 'sk'},
  {code: 'no', name: 'Norwegian', countryCode: 'no'},
  {code: 'sv', name: 'Swedish', countryCode: 'se'},
];

const LanguageSelectorModal: FC<TLanguageSelectorModalProps> = React.memo(
  ({toggle, isVisible}) => {
    const {t, i18n} = useTranslation();

    const handlePressLanguage = useCallback(
      (lng: string) => () => {
        i18n.changeLanguage(lng);
      },
      [i18n],
    );

    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={t('common.selectLanguage')}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            {LANGUAGES.map(lang => {
              const flag =
                emojiFlags.countryCode(lang.countryCode)?.emoji || '';
              const isChecked = i18n.language === lang.code;
              return (
                <Checkbox
                  key={lang.code}
                  isChecked={isChecked}
                  useBuiltInState={false}
                  text={`${flag}  ${lang.name}`}
                  textStyle={styles.checkBoxText}
                  style={styles.checkBoxWrapper}
                  onPress={handlePressLanguage(lang.code)}
                />
              );
            })}
          </View>
        </View>
      </Modal>
    );
  },
);

export default LanguageSelectorModal;

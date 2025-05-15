import React, {FC, useState} from 'react';
import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {styles} from './styles';
import {TPredicateProps} from './types';
import Dropdown from '../Dropdown';

const Predicate: FC<TPredicateProps> = React.memo(
  ({wrapperStyle, errorMessage, ...props}) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    return (
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={styles.label}>{t('components.predicate.label')}</Text>
        <Dropdown
          placeholder={t('components.predicate.placeholder')}
          containerStyle={styles.dropdownContainer}
          style={styles.dropdownStyle}
          placeholderStyle={styles.dropdownPlaceholder}
          labelStyle={styles.dropdownLabel}
          {...props}
          multiple={false}
          open={open}
          setOpen={setOpen}
        />
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      </View>
    );
  },
);

export default Predicate;

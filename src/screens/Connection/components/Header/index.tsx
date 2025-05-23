import React, {FC, useCallback} from 'react';
import {View} from 'react-native';

import RadioTab from '../../../../components/RadioTab';
import {TRadioTabValue} from '../../../../components/RadioTab/types';
import {headerTabs} from '../../const';
import {styles} from './styles';
import {THeaderProps} from './types';
import {useTranslation} from 'react-i18next';

const Header: FC<THeaderProps> = React.memo(({activeTab, setActiveTab}) => {
  const handlePress = useCallback(
    (value: TRadioTabValue) => {
      setActiveTab(value);
    },
    [setActiveTab],
  );
  const {t} = useTranslation();
  return (
    <View style={styles.header}>
      <RadioTab
        options={headerTabs.map(ht => ({
          ...ht,
          label: t(`tabs.connection.${ht.value}`),
        }))}
        value={activeTab}
        onChange={handlePress}
        buttonStyle={styles.buttonStyle}
      />
    </View>
  );
});

export default Header;

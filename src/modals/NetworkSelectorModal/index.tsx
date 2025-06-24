import React, {FC, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import BasicSettingsSvg from '../../assets/images/basic-settins.svg';
import Modal from '../../components/Modal';
import Checkbox from '../../components/Checkbox';
import ListItem from '../../components/ListItem';
import {ERootStackRoutes} from '../../routes/types';
import {TNetworkSelectorModalProps} from './types';
import {
  makeSelectActiveNetwork,
  makeSelectNetworksList,
} from '../../store/networks/selectors';
import {TNetwork} from '../../screens/Networks/components/Item/types';
import {setActiveNetwork} from '../../store/networks';
import {getNetworkDetails} from '../../store/networks/actions';
import {useShallowEqualSelector} from '../../store/utils';
import {useTranslation} from 'react-i18next';
import {useAppThemeContext} from '../../contexts';
import {makeStyles} from './styles';

const NetworkSelectorModal: FC<TNetworkSelectorModalProps> = React.memo(
  ({toggle, isVisible}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();

    const {theme} = useAppThemeContext();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const networks = useShallowEqualSelector(makeSelectNetworksList);
    const activeNetwork = useShallowEqualSelector(makeSelectActiveNetwork);

    const handlePressManageNetworks = useCallback(() => {
      toggle();
      navigation.navigate(ERootStackRoutes.Networks);
    }, [toggle, navigation]);

    const handlePressCheckBox = useCallback(
      (network: TNetwork) => async () => {
        dispatch(setActiveNetwork(network));
        dispatch(getNetworkDetails(network));
      },
      [],
    );

    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={t('networkSelector.title')}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            {networks.map((network: TNetwork) => (
              <Checkbox
                isChecked={network.name === activeNetwork?.name}
                key={network.id}
                text={network.name}
                textStyle={styles.checkBoxText}
                style={styles.checkBoxWrapper}
                onPress={handlePressCheckBox(network)}
                useBuiltInState={false}
              />
            ))}
          </View>
          <View style={styles.modalFooter}>
            <ListItem
              text={t('networkSelector.manage')}
              icon={<BasicSettingsSvg fill="#787B8E" />}
              onPress={handlePressManageNetworks}
            />
          </View>
        </View>
      </Modal>
    );
  },
);

export default NetworkSelectorModal;

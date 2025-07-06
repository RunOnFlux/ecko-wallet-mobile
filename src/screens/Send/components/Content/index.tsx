import React, {FC, useMemo} from 'react';
import {View, Text, TouchableOpacity, Keyboard} from 'react-native';
import {useTranslation} from 'react-i18next';
import Settings from '../Settings';
import {TContentType} from './types';
import {cutStr} from '../../../../utils/stringHelpers';
import {useAppThemeContext} from '../../../../contexts';
import {makeStyles} from './styles';

const Content: FC<TContentType> = React.memo(props => {
  const {t} = useTranslation();
  const {predicate, receiverPublicKey} = props;

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={Keyboard.dismiss}
      style={styles.contentWrapper}>
      <View style={styles.header}>
        <Text style={[styles.text, styles.headerTitle]}>
          {t('send.content.advancedSettings')}
        </Text>
        <Settings {...props} />
      </View>
      {predicate ? (
        <View style={styles.itemWrapper}>
          <View style={styles.item}>
            <Text style={[styles.text, styles.kda]}>{predicate}</Text>
            <Text style={[styles.text, styles.usd]}>
              {t('send.content.predicateLabel')}
            </Text>
          </View>
        </View>
      ) : null}
      {receiverPublicKey ? (
        <View style={styles.itemWrapper}>
          <View style={styles.item}>
            <Text style={[styles.text, styles.kda]}>
              {cutStr(receiverPublicKey)}
            </Text>
            <Text style={[styles.text, styles.usd]}>
              {t('send.content.receiverLabel')}
            </Text>
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
});

export default Content;

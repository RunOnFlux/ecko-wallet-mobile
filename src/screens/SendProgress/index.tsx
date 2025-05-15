import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Text,
  TextInput,
  Alert,
  Animated,
  Image,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';

import Header from './components/Header';
import Warning from '../../components/Warning';
import AccountFromTo from '../../components/AccountFromTo';
import FooterButton from '../../components/FooterButton';
import {createStyles} from './styles';
import {
  makeSelectGatheredInfo,
  makeSelectIsCrossChainTransfer,
  makeSelectTransferResult,
} from '../../store/transfer/selectors';
import {makeSelectSelectedToken} from '../../store/userWallet/selectors';
import {setTransferBubble} from '../../store/transfer';
import {useShallowEqualSelector} from '../../store/utils';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {EHomeTabRoutes} from '../../routes/types';

const SendProgress = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const isCrossChainTransfer = useSelector(makeSelectIsCrossChainTransfer);
  const gatheredInfo = useShallowEqualSelector(makeSelectGatheredInfo);
  const transferResult = useShallowEqualSelector(makeSelectTransferResult);
  const selectedToken = useShallowEqualSelector(makeSelectSelectedToken);

  const [animation] = useState(new Animated.Value(0));
  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  // Toast on submit
  useEffect(() => {
    if (transferResult?.status === 'pending') {
      Toast.show({
        type: 'info',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        text1: t('sendProgress.toast.submittedTitle'),
        text2: t('sendProgress.toast.submittedMessage'),
        topOffset: statusBarHeight + 16,
      });
    }
  }, [transferResult?.status, statusBarHeight, t]);

  // Navigate to activities
  const onGoToActivities = useCallback(() => {
    navigation.navigate('Home', {screen: EHomeTabRoutes.History});
  }, [navigation]);

  // Bubble flag
  useEffect(() => {
    dispatch(setTransferBubble(false));
    return () => {
      dispatch(setTransferBubble(true));
    };
  }, [dispatch]);

  // Pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animation]);

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.25],
  });

  return (
    <View style={styles.screen}>
      <Header />
      <Text style={styles.text}>{t('sendProgress.text.closeWarning')}</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.contentWrapper}>
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.svgWrapper, {opacity}]}>
            <Image
              source={require('../../assets/images/send-progress.png')}
              style={styles.sendImage}
              resizeMode="cover"
            />
          </Animated.View>
          <Text style={styles.title}>
            {`${gatheredInfo.amount} ${selectedToken?.tokenName || ''}`}
          </Text>

          {transferResult?.message && (
            <>
              <Text style={styles.transferResult}>
                {t('sendProgress.label.result')}
              </Text>
              <Text selectable style={styles.transferResultValue}>
                {transferResult.message}
              </Text>
            </>
          )}
          {transferResult?.text && (
            <>
              <Text style={styles.transferText}>
                {t('sendProgress.label.message')}
              </Text>
              <Text selectable style={styles.transferTextValue}>
                {transferResult.text}
              </Text>
            </>
          )}
          {transferResult?.requestKey && (
            <>
              <Text style={styles.transferRequestKey}>
                {t('sendProgress.label.requestKey')}
              </Text>
              <Text selectable style={styles.transferRequestKeyValue}>
                {transferResult.requestKey}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.accountView}>
        {isCrossChainTransfer && (
          <View style={styles.warning}>
            <Warning
              title={t('sendProgress.warning.crossChainTitle')}
              text={t('sendProgress.warning.crossChainMessage')}
            />
          </View>
        )}
        {transferResult && (
          <AccountFromTo
            fromAccount={transferResult.sender}
            fromChainId={transferResult.sourceChainId}
            toAccount={transferResult.receiver}
            toChainId={transferResult.targetChainId}
          />
        )}
        <View style={styles.buttonContainer}>
          <FooterButton
            title={t('sendProgress.button.activities')}
            onPress={onGoToActivities}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

export default SendProgress;

import React, {FC, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {makeStyles} from './styles';
import {makeSelectSelectedAccount} from '../../../../../../store/userWallet/selectors';
import {ERootStackRoutes} from '../../../../../../routes/types';
import {useShallowEqualSelector} from '../../../../../../store/utils';
import Modal from '../../../../../../components/Modal';
import {DetectedToken, TTokenDetectorModalProps} from './types';
import ListItem from '../ListItem';
import axios from 'axios';
import {makeSelectActiveNetworkDetails} from '../../../../../../store/networks/selectors';
import {getPact} from '../../../../../../api/kadena/pact';
import {getNetworkParams} from '../../../../../../utils/networkHelpers';
import {TAccount} from '../../../../../../store/userWallet/types';
import Warning from '../../../../../../components/Warning';
import {setSelectedToken} from '../../../../../../store/userWallet';
import {ECKO_API_URL} from '../../../../../../api/constants';
import {useAppThemeContext} from '../../../../../../contexts';

const TokenDetectorModal: FC<TTokenDetectorModalProps> = ({
  toggle,
  isVisible,
}) => {
  const {t} = useTranslation();
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<string[]>([]);
  const [detectedTokens, setDetectedTokens] = useState<DetectedToken[]>([]);

  const selectedAccount: TAccount = useShallowEqualSelector(
    makeSelectSelectedAccount,
  );
  const networkDetail = useShallowEqualSelector(makeSelectActiveNetworkDetails);

  useEffect(() => {
    const init = async () => {
      const tokensResponse = await axios.get(
        `${ECKO_API_URL}/chain-data/fungible-tokens`,
      );
      const tokensData = await tokensResponse.data;
      if (tokensData && tokensData[0]?.fungibleTokens) {
        setTokens(tokensData[0].fungibleTokens);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (tokens.length) {
      fetchTokenBalancesByChain();
    }
  }, [tokens]);

  const fetchTokenBalancesByChain = async () => {
    const tokenBalances: any = {};
    const chainPromises: any[] = [];

    for (let chainId = 0; chainId < 20; chainId++) {
      const chainTokens: string[] = (tokens[chainId] as any) || [];

      if (chainTokens.length === 0) continue;

      const pactCode = `
        (let*
          (
            ${chainTokens
              .map(token => {
                const tokenAlias = token.replace(/\./g, '');
                return `(${tokenAlias} (try 0.0 (${token}.get-balance "${selectedAccount.accountName}")))`;
              })
              .join('\n')}
          )
          {
            ${chainTokens
              .map(token => `"${token}": ${token.replace(/\./g, '')}`)
              .join(',\n')}
          }
        )
      `;

      const chainPromise = getPact({
        ...networkDetail,
        ...getNetworkParams(networkDetail),
        chainId,
        pactCode,
      })
        .then(data => {
          const balances = data;
          Object.keys(balances).forEach(tokenContract => {
            const balance = parseFloat(balances[tokenContract]);
            if (balance > 0) {
              if (tokenBalances[tokenContract]) {
                tokenBalances[tokenContract].balance += balance;
                tokenBalances[tokenContract].chains.push(chainId);
              } else {
                tokenBalances[tokenContract] = {
                  contract: tokenContract,
                  balance,
                  chains: [chainId],
                };
              }
            }
          });
        })
        .catch(error => {
          console.error(`Error fetching balances for chain ${chainId}:`, error);
        });

      chainPromises.push(chainPromise);
    }

    await Promise.all(chainPromises);

    const allTokensWithBalance: DetectedToken[] = Object.values(tokenBalances);
    setDetectedTokens(
      allTokensWithBalance.filter(
        t =>
          t.contract !== 'coin' &&
          !selectedAccount.wallets?.find(f => f.tokenAddress === t.contract),
      ),
    );
    setIsLoading(false);
    return allTokensWithBalance;
  };

  const handlePressAdd = (token: DetectedToken) => {
    toggle();
    dispatch(setSelectedToken(null));
    setTimeout(
      () =>
        navigation.navigate(ERootStackRoutes.AddToken, {
          tokenName: token.contract,
        }),
      150,
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      close={toggle}
      title={t('wallet.assetsList.tokenDetector.title')}
      contentStyle={styles.modalStyle}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContentWrapper}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.text.primary}
              style={{marginTop: 20}}
            />
          ) : detectedTokens.length ? (
            detectedTokens.map(t => (
              <ListItem
                key={t.contract}
                isFirst
                rightLabel={t.balance.toFixed(5)}
                onPress={() => handlePressAdd(t)}
                walletItem={{
                  tokenName: t.contract,
                  tokenAddress: t.contract,
                  chainBalance: {},
                }}
              />
            ))
          ) : (
            <Warning
              style={styles.warning}
              centerText
              title={t('wallet.assetsList.tokenDetector.emptyTitle')}
              text={t('wallet.assetsList.tokenDetector.emptyText')}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
export default TokenDetectorModal;

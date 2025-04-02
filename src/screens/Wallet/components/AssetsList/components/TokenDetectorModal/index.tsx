import React, {FC, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {styles} from './styles';
import {useNavigation} from '@react-navigation/native';
import {makeSelectSelectedAccount} from '../../../../../../store/userWallet/selectors';
import {ERootStackRoutes} from '../../../../../../routes/types';
import {useShallowEqualSelector} from '../../../../../../store/utils';
import Modal from '../../../../../../components/Modal';
import {DetectedToken, TTokenDetectorModalProps} from './types';
import ListItem from '../ListItem';
import {ECKO_API_URL} from '@env';
import axios from 'axios';
import {makeSelectActiveNetworkDetails} from '../../../../../../store/networks/selectors';
import {getPact} from '../../../../../../api/kadena/pact';
import {getNetworkParams} from '../../../../../../utils/networkHelpers';
import {TAccount} from '../../../../../../store/userWallet/types';
import {MAIN_COLOR} from '../../../../../../constants/styles';
import Warning from '../../../../../../components/Warning';
import {setSelectedToken} from '../../../../../../store/userWallet';

const TokendetectorModal: FC<TTokenDetectorModalProps> = ({
  toggle,
  isVisible,
}) => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<string[]>([]);
  const [detectedTokens, setDetectedTokens] = useState<DetectedToken[]>([]);

  const dispatch = useDispatch();

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
      if (tokensData && tokensData[0] && tokensData[0]?.fungibleTokens) {
        setTokens(tokensData[0]?.fungibleTokens);
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
    const chainPromises: any = [];

    for (let chainId = 0; chainId < 20; chainId++) {
      const chainTokens: string[] = (tokens[chainId] as any) || [];

      if (chainTokens.length === 0) continue;

      const pactCode = `
          (let*
            (
              ${chainTokens
                .map(token => {
                  const tokenAlias = token.replace(/\./g, '');
                  return `(${tokenAlias} (try 0.0 (${token}.get-balance "${selectedAccount?.accountName}")))`;
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
                  balance: balance,
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
          !selectedAccount?.wallets?.find(f => f.tokenAddress === t.contract),
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
      title={`Detected Tokens`}
      onPressLeftItem={() => {}}
      contentStyle={styles.modalStyle}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContentWrapper}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={MAIN_COLOR}
              style={{marginTop: 20}}
            />
          ) : detectedTokens?.length ? (
            detectedTokens?.map(t => (
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
              title={`No other tokens founded for this account`}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
export default TokendetectorModal;

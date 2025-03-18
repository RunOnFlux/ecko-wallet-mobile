import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {View, Alert, Text, TouchableOpacity} from 'react-native';
import {useDispatch} from 'react-redux';
import {styles} from './styles';
import {useNavigation} from '@react-navigation/native';
import ArrowTopBottomRightSvg from '../../../../../../assets/images/arrow-top-right.svg';
import {
  makeSelectNonTransferableTokenList,
  makeSelectSelectedAccount,
  makeSelectSelectedToken,
  makeSelectUsdEquivalents,
} from '../../../../../../store/userWallet/selectors';
import {ERootStackRoutes} from '../../../../../../routes/types';
import {useShallowEqualSelector} from '../../../../../../store/utils';
import {defaultWallets} from '../../../../../../store/userWallet/const';
import Modal from '../../../../../../components/Modal';
import {DetectedToken, TTokenDetectorModalProps} from './types';
import ListItem from '../ListItem';
import {KADDEX_URL} from '@env';
import axios from 'axios';
import {
  makeSelectActiveNetworkDetails,
  makeSelectSelectedNetwork,
} from '../../../../../../store/networks/selectors';
import {TNetwork} from '../../../../../Networks/components/Item/types';
import {getPact} from '../../../../../../api/kadena/pact';
import {getNetworkParams} from '../../../../../../utils/networkHelpers';

const TokendetectorModal: FC<TTokenDetectorModalProps> = React.memo(
  ({toggle, isVisible}) => {
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tokens, setTokens] = useState<string[]>([]);
    const [detectedTokens, setDetectedTokens] = useState<DetectedToken[]>([]);
    console.log('🚀 ~ tokens:', tokens);

    const dispatch = useDispatch();

    const selectedToken = useShallowEqualSelector(makeSelectSelectedToken);
    const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
    // console.log('🚀 ~ selectedAccount:', selectedAccount);
    const networkDetail = useShallowEqualSelector(
      makeSelectActiveNetworkDetails,
    );
    const nonTransferableTokens = useShallowEqualSelector(
      makeSelectNonTransferableTokenList,
    );

    useEffect(() => {
      const init = async () => {
        const tokensResponse = await axios.get(
          `${KADDEX_URL}/chain-data/fungible-tokens`,
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
          .then(result => {
            if (result?.result?.status === 'success') {
              const balances = result.result.data;
              console.log(
                '🚀 ~ fetchTokenBalancesByChain ~ balances:',
                balances,
              );
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
            }
          })
          .catch(error => {
            console.error(
              `Error fetching balances for chain ${chainId}:`,
              error,
            );
          });

        chainPromises.push(chainPromise);
      }

      await Promise.all(chainPromises);

      const allTokensWithBalance: DetectedToken[] =
        Object.values(tokenBalances);
      console.log(
        '🚀 ~ fetchTokenBalancesByChain ~ tokenBalances:',
        tokenBalances,
      );
      // setDetectedTokens(
      //   allTokensWithBalance.filter(
      //     t =>
      //       t.contract !== 'coin' &&
      //       !fungibleTokensByNetwork?.find(
      //         f => f.contractAddress === t.contract,
      //       ),
      //   ),
      // );
      setIsLoading(false);

      return allTokensWithBalance;
    };

    const isDefaultToken = defaultWallets.find(
      t => t.tokenAddress === selectedToken?.tokenAddress,
    );

    const handlePressAdd = useCallback(() => {
      toggle();
      setTimeout(() => navigation.navigate(ERootStackRoutes.AddToken), 150);
    }, [toggle, navigation]);

    const isTokenNonTransferable = useMemo(
      () =>
        selectedToken?.tokenAddress
          ? (nonTransferableTokens || []).includes(selectedToken?.tokenAddress)
          : false,
      [nonTransferableTokens, selectedToken?.tokenAddress],
    );

    if (!selectedToken) {
      return null;
    }
    return (
      <Modal
        isVisible={isVisible}
        close={toggle}
        title={`Detected Tokens`}
        onPressLeftItem={() => {}}
        contentStyle={styles.modalStyle}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentWrapper}>
            <ListItem
              key="coin"
              isFirst
              onPress={handlePressAdd}
              walletItem={{
                tokenName: 'KDA',
                tokenAddress: 'coin',
                chainBalance: {0: 2},
                totalAmount: 3,
              }}
            />
            <ListItem
              key="flux"
              isFirst
              walletItem={{
                tokenName: 'FLUX',
                tokenAddress: 'runonflux.flux',
                chainBalance: {0: 22},
                totalAmount: 35,
              }}
            />
          </View>
        </View>
      </Modal>
    );
  },
);

export default TokendetectorModal;

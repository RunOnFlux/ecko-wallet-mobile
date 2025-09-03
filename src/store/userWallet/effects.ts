import axios, {AxiosError, AxiosResponse} from 'axios';

import {
  TAccount,
  TAccountImportRequest,
  TGenAccountParams,
  TBalancesRequest,
  TWallet,
  TSearchTokenListParams,
} from './types';
import {getGenerateAccount} from './actions';
import {
  addNewAccount,
  setBalanceDetailError,
  setBalanceDetailLoading,
  setBalanceDetailSuccess,
  setNonTransferableTokenList,
  setSearchTokenList,
  setSelectedAccount,
  setUsdEquivalents,
} from './index';
import {Alert} from 'react-native';
import {makeSelectAccounts, makeSelectSelectedAccount} from './selectors';
import {makeSelectGeneratedPhrases} from '../auth/selectors';
import {defaultWallets, reverseCoins} from './const';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {TRestoreAccountParams} from './types';
import {KADDEX_NAMESPACE, nonTransferableTokens} from '../../api/constants';
import {
  getTokenUsdPriceByLiquidity,
  reduceBalance,
} from '../../utils/numberHelpers';
import {getBalance} from '../../api/kadena/balance';
import {getPact} from '../../api/kadena/pact';
import {generateAccount} from '../../api/kadena/generateAccount';
import {getAccount} from '../../api/kadena/account';
import {createAsyncThunk} from '@reduxjs/toolkit';

export const getBalances = createAsyncThunk(
  'userWallet/getBalances',
  async (payload: TBalancesRequest, {dispatch, getState}: any) => {
    dispatch(setBalanceDetailLoading(true));
    try {
      const selectedAccount: TAccount | null =
        makeSelectSelectedAccount(getState());

      const balancesForWallet: TWallet[] = await Promise.all(
        (selectedAccount?.wallets || []).map(async (walletItem: TWallet) => {
          const balanceResponse = await getBalance({
            ...payload,
            accountName: selectedAccount?.accountName,
            token: walletItem.tokenAddress,
          } as any);
          return {
            ...walletItem,
            ...(balanceResponse || {}),
          };
        }),
      );

      dispatch(setBalanceDetailSuccess(balancesForWallet));

      let estimatedUsdResponse: any;
      try {
        const usdResponse: AxiosResponse<any> = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=kadena,gas',
        );
        estimatedUsdResponse = usdResponse?.data;
      } catch (e) {}

      const tokenPairList = (selectedAccount?.wallets || [])
        .filter(item => item.tokenAddress !== 'coin')
        .map((walletItem: TWallet) => {
          if (reverseCoins.includes(walletItem.tokenAddress)) {
            return `[${walletItem.tokenAddress} coin] `;
          } else {
            return `[coin ${walletItem.tokenAddress}] `;
          }
        });

      const tokenPairListResponse: any[] = await Promise.all(
        tokenPairList.map(async pairList => {
          try {
            const tokenListDetails = await getPact({
              ...payload,
              chainId: '2',
              pactCode: `
                (namespace 'free)

                (module ${KADDEX_NAMESPACE}-read G

                  (defcap G ()
                    true)

                  (defun pair-info (pairList:list)
                    (let* (
                      (token0 (at 0 pairList))
                      (token1 (at 1 pairList))
                      (p (${KADDEX_NAMESPACE}.exchange.get-pair token0 token1))
                      (reserveA (${KADDEX_NAMESPACE}.exchange.reserve-for p token0))
                      (reserveB (${KADDEX_NAMESPACE}.exchange.reserve-for p token1))
                      (totalBal (${KADDEX_NAMESPACE}.tokens.total-supply (${KADDEX_NAMESPACE}.exchange.get-pair-key token0 token1)))
                    )
                    [(${KADDEX_NAMESPACE}.exchange.get-pair-key token0 token1)
                     reserveA
                     reserveB
                     totalBal
                   ]
                  ))
                )
                (map (${KADDEX_NAMESPACE}-read.pair-info) [${pairList}])
              `,
            } as any);
            return tokenListDetails || [];
          } catch (e) {
            return [];
          }
        }),
      );

      const tokenListDetailsData = tokenPairListResponse.flat(1);
      const tokenLiquidityData = (tokenListDetailsData || []).reduce(
        (accum: any, data: any[]) => {
          accum[data[0]] = {
            supply: data[3],
            reserves: [data[1], data[2]],
          };
          return accum;
        },
        {},
      );

      const tokenUsdData = (selectedAccount?.wallets || [])
        .map((walletItem: TWallet) => {
          if (walletItem.tokenAddress === 'coin') {
            return {
              token: walletItem.tokenAddress,
              usd: estimatedUsdResponse?.kadena?.usd || 0,
            };
          }
          if (tokenLiquidityData[`${walletItem.tokenAddress}:coin`]) {
            const coinPair =
              tokenLiquidityData[`${walletItem.tokenAddress}:coin`];
            if (coinPair) {
              const liquidity0 = reduceBalance(coinPair.reserves[0]);
              const liquidity1 = reduceBalance(coinPair.reserves[1]);
              return {
                token: walletItem.tokenAddress,
                usd: getTokenUsdPriceByLiquidity(
                  liquidity1,
                  liquidity0,
                  estimatedUsdResponse?.kadena?.usd || 0,
                  16,
                ),
              };
            }
          } else if (tokenLiquidityData[`coin:${walletItem.tokenAddress}`]) {
            const coinPair =
              tokenLiquidityData[`coin:${walletItem.tokenAddress}`];
            if (coinPair) {
              const liquidity0 = reduceBalance(coinPair.reserves[0]);
              const liquidity1 = reduceBalance(coinPair.reserves[1]);
              return {
                token: walletItem.tokenAddress,
                usd: getTokenUsdPriceByLiquidity(
                  liquidity0,
                  liquidity1,
                  estimatedUsdResponse?.kadena?.usd || 0,
                  16,
                ),
              };
            }
          }
          return null;
        })
        .filter(item => item !== null);

      tokenUsdData.push({
        token: 'gas',
        usd: estimatedUsdResponse?.gas?.usd || 0,
      });

      if (
        tokenUsdData.some(item => item?.token === 'kaddex.kdx') &&
        !tokenUsdData.some(item => item?.token === 'kaddex.skdx')
      ) {
        const tokenKDXUsdData = tokenUsdData.find(
          item => item?.token === 'kaddex.kdx',
        );
        if (tokenKDXUsdData) {
          tokenUsdData.push({
            token: 'kaddex.skdx',
            usd: tokenKDXUsdData.usd || 0,
          });
        }
      }

      dispatch(setUsdEquivalents(tokenUsdData));
      dispatch(setBalanceDetailLoading(false));
    } catch (err) {
      dispatch(setBalanceDetailError(err));
      dispatch(setBalanceDetailLoading(false));
    }
  },
);

export const generateAccountThunk = createAsyncThunk(
  'auth/generateAccount',
  async (payload: TGenAccountParams, {dispatch, getState}) => {
    const state = getState();
    const seedsFromState = makeSelectGeneratedPhrases(state as any);
    const seeds = payload?.seeds || seedsFromState;

    const data = await generateAccount({
      seeds,
      accountIndex: payload?.accountIndex || 0,
    });

    if (seeds !== undefined) {
      const accounts = makeSelectAccounts(state as any);
      if (accounts.some(item => item.publicKey === data.publicKey)) {
        dispatch(
          getGenerateAccount({
            ...(payload || {}),
            accountIndex: (payload?.accountIndex || 0) + 1,
          }),
        );
        return;
      }
    }

    const account = {
      ...data,
      chainId: 0,
      wallets: defaultWallets,
    };

    dispatch(addNewAccount(account));
    dispatch(setSelectedAccount(account));
  },
);

export const importAccount = createAsyncThunk(
  'auth/importAccount',
  async (payload: TAccountImportRequest, {dispatch}) => {
    try {
      const data = await getAccount(payload as any);
      const account = {
        ...data,
        chainId: payload?.chainId || 0,
        wallets: defaultWallets,
      };

      dispatch(addNewAccount(account));
      dispatch(getBalances(payload));
    } catch (err: any) {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });

      Alert.alert(
        'Failed to import the account',
        err?.response?.data || err?.message || 'Unknown error',
      );
    }
  },
);

export const restoreAccount = createAsyncThunk(
  'auth/restoreAccount',
  async (payload: TRestoreAccountParams, {dispatch}) => {
    try {
      const data = await generateAccount(payload);

      dispatch(
        addNewAccount({
          ...data,
          chainId: 0,
          wallets: defaultWallets,
        }),
      );
    } catch (err: any) {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });

      Alert.alert(
        'Failed to import the account',
        err?.response?.data || err?.message || 'Unknown error',
      );
    }
  },
);

export const getTokenList = createAsyncThunk(
  'token/getTokenList',
  async (payload: TSearchTokenListParams, {dispatch}) => {
    try {
      const tokenListData: string[] = await getPact({
        ...payload,
        chainId: '2',
        pactCode: '(list-modules)',
      } as any);

      const tokenList = (tokenListData || []).filter(
        (item: string) => item !== 'coin' && item !== 'runonflux.flux',
      );

      dispatch(setSearchTokenList(tokenList));
      dispatch(setNonTransferableTokenList(nonTransferableTokens || []));
    } catch (err) {
      dispatch(setSearchTokenList([]));
      dispatch(setNonTransferableTokenList([]));
    }
  },
);

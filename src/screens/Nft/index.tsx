import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {chunk, groupBy} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import {useAppThemeContext} from '../../contexts';
import {makeStyles} from './styles';
import nftList, {NFTTypes} from '../../nft/nft-data';
import {getPact} from '../../api/kadena/pact';
import {
  makeSelectActiveNetworkDetails,
} from '../../store/networks/selectors';
import {makeSelectSelectedAccount} from '../../store/userWallet/selectors';
import {useShallowEqualSelector} from '../../store/utils';
import NftCard from './components/NftCard';
import MarmaladeNGCollectionList from './marmalade-ng/CollectionList';
import {ERootStackRoutes, TNavigationProp} from '../../routes/types';

const Nft = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const activeNetworkDetails = useShallowEqualSelector(
    makeSelectActiveNetworkDetails,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [nftAccount, setNftAccount] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!selectedAccount?.accountName || !activeNetworkDetails) {
        setIsLoading(false);
        return;
      }
      setNftAccount({});
      const account = selectedAccount.accountName;
      const groupedByChain = groupBy(nftList, 'chainId');
      const promises: Promise<any>[] = [];

      Object.keys(groupedByChain).forEach(chainId => {
        const chunked = chunk(groupedByChain[chainId], 2);
        chunked.forEach(chunkArray => {
          const pactCode = `(
            let* (
              ${chunkArray
                .map(nft => `(${nft.pactAlias} ${nft.getAccountBalance(account)})`)
                .join(' ')}
            ) {
              ${chunkArray
                .map(nft => `"${nft.pactAlias}": ${nft.pactAlias}`)
                .join(',')}
            }
          )`;
          promises.push(
            getPact({
              network: activeNetworkDetails.network,
              instance: activeNetworkDetails.instance,
              version: `${activeNetworkDetails.version}`,
              chainId,
              pactCode,
            }),
          );
        });
      });

      setIsLoading(true);
      Promise.all(promises)
        .then(resArray => {
          resArray.forEach(res => {
            if (res && !Array.isArray(res)) {
              setNftAccount(prev => ({
                ...prev,
                ...res,
              }));
            }
          });
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    };

    fetchNFTs();
  }, [selectedAccount?.accountName, activeNetworkDetails?.network]);

  const getNFTTotal = (alias: string) => {
    const nft = nftList.find(n => n.pactAlias === alias);
    if (nft?.type === NFTTypes.MARMALADE_V2) {
      return nftAccount[alias]?.totalBalance || 0;
    }
    return nftAccount[alias]?.length || 0;
  };

  const hasAny = Object.keys(nftAccount).length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator
            style={styles.loading}
            color={theme.text.primary}
          />
        ) : (
          <>
            <View style={styles.grid}>
              <MarmaladeNGCollectionList />
              {hasAny ? (
                Object.keys(nftAccount)
                  .sort((a, b) => a.localeCompare(b))
                  .map(alias => {
                    const nft = nftList.find(n => n.pactAlias === alias);
                    if (!nft) return null;
                    return (
                      <NftCard
                        key={nft.displayName}
                        imageUrl={nft.pic}
                        label={`${nft.displayName} (${getNFTTotal(alias)})`}
                        onPress={() =>
                          navigation.navigate(ERootStackRoutes.NftCategoryDetails, {
                            category: alias,
                          } as any)
                        }
                      />
                    );
                  })
              ) : (
                <View style={styles.emptyWrapper}>
                  <Text style={styles.emptyText}>{t('nft.noOwned')}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Nft;

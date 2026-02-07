import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppThemeContext} from '../../../contexts';
import {makeStyles} from './styles';
import {
  MARMALADE_NG_CHAINS,
  MARMALADE_NG_CONTRACT,
  MARMALADE_NG_WHITELISTED_COLLECTIONS,
  getCollectionsAndTokens,
  getGatewayUrlByIPFS,
} from '../../../nft/nft-data';
import {getPact} from '../../../api/kadena/pact';
import {
  makeSelectActiveNetworkDetails,
} from '../../../store/networks/selectors';
import {makeSelectSelectedAccount} from '../../../store/userWallet/selectors';
import {useShallowEqualSelector} from '../../../store/utils';
import NftCard from '../components/NftCard';
import {idToPascalCase} from '../../../nft/utils';
import {ERootStackRoutes, TNavigationProp} from '../../../routes/types';

export type NgCollection = {
  id: string;
  name: string;
  src: string;
  chainId: string | number;
  ownedCount: number;
};

const MarmaladeNGCollectionList = () => {
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const activeNetworkDetails = useShallowEqualSelector(
    makeSelectActiveNetworkDetails,
  );

  const [ngCollections, setNgCollections] = useState<NgCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNGNftAsync = async () => {
      if (!selectedAccount?.accountName || !activeNetworkDetails) return;
      setIsLoading(true);
      const ownedTokens: string[] = [];
      const promises: Promise<{data: any; chainId: string | number}>[] = [];

      try {
        for (const chainId of MARMALADE_NG_CHAINS) {
          const ngNfts = await getPact({
            network: activeNetworkDetails.network,
            instance: activeNetworkDetails.instance,
            version: `${activeNetworkDetails.version}`,
            chainId,
            pactCode: `(${MARMALADE_NG_CONTRACT}.ledger.list-balances "${selectedAccount.accountName}")`,
          });
          ownedTokens.push(...((ngNfts || []).map((t: any) => t.id) ?? []));

          const collectionListResponse = await getPact({
            network: activeNetworkDetails.network,
            instance: activeNetworkDetails.instance,
            version: `${activeNetworkDetails.version}`,
            chainId,
            pactCode: `(${MARMALADE_NG_CONTRACT}.policy-collection.get-all-collections)`,
          });
          const collectionList = collectionListResponse || [];
          if (collectionList.length) {
            const pactCode = getCollectionsAndTokens(collectionList.length);
            promises.push(
              getPact({
                network: activeNetworkDetails.network,
                instance: activeNetworkDetails.instance,
                version: `${activeNetworkDetails.version}`,
                chainId,
                pactCode,
              }).then(data => ({data, chainId})),
            );
          }
        }
      } catch (err) {
        setIsLoading(false);
      }

      Promise.all(promises)
        .then(async resArray => {
          const allPrepareNgCollectionsPromises = resArray.map(async item => {
            const res = item?.data;
            if (res && Object.values(res)?.length) {
              const collections: {
                firstTokenURI: string;
                id: string;
                name: string;
              }[] = Object.values(res as any);

              const prepareNgCollections = await Promise.all(
                collections.map(async collection => {
                  if (
                    MARMALADE_NG_WHITELISTED_COLLECTIONS.includes(collection.id)
                  ) {
                    try {
                      let ownedCount = 0;
                      const allCollectionTokensResponse = await getPact({
                        network: activeNetworkDetails.network,
                        instance: activeNetworkDetails.instance,
                        version: `${activeNetworkDetails.version}`,
                        chainId: item.chainId,
                        pactCode: `(${MARMALADE_NG_CONTRACT}.policy-collection.list-tokens-of-collection "${collection.id}")`,
                      });
                      if (allCollectionTokensResponse?.length) {
                        ownedCount =
                          allCollectionTokensResponse?.filter((t: string) =>
                            ownedTokens.includes(t),
                          )?.length || 0;
                      }

                      const uriDataResponse = await fetch(
                        getGatewayUrlByIPFS(
                          collection?.firstTokenURI,
                          item.chainId,
                        ),
                      );
                      const uriData = await uriDataResponse.json();
                      const src = uriData?.image;

                      return {
                        id: collection.id,
                        name: collection?.name,
                        src,
                        chainId: item.chainId,
                        ownedCount,
                      } as NgCollection;
                    } catch {
                      return null;
                    }
                  }
                  return null;
                }),
              );

              return prepareNgCollections.filter(Boolean) as NgCollection[];
            }
            return [];
          });

          const allPrepareNgCollections = (
            await Promise.all(allPrepareNgCollectionsPromises)
          ).flat();
          setNgCollections(allPrepareNgCollections);
        })
        .finally(() => setIsLoading(false));
    };

    fetchNGNftAsync();
  }, [selectedAccount?.accountName, activeNetworkDetails?.network]);

  if (isLoading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={theme.text.primary} />
      </View>
    );
  }

  return (
    <>
      {ngCollections?.map(c => (
        <NftCard
          key={c.name}
          imageUrl={getGatewayUrlByIPFS(c.src, c.chainId)}
          label={`${idToPascalCase(c.name)} (${c.ownedCount})`}
          onPress={() =>
            navigation.navigate(ERootStackRoutes.NftMarmaladeNGDetails, {
              id: c.id,
              name: c.name,
              chainId: c.chainId,
            } as any)
          }
        />
      ))}
    </>
  );
};

export default MarmaladeNGCollectionList;

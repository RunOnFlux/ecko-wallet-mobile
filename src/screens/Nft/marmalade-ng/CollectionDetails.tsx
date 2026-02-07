import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '../../../components/Header';
import {useAppThemeContext} from '../../../contexts';
import {makeStyles} from './detailsStyles';
import {
  MARMALADE_NG_CONTRACT,
  NFTTypes,
  getGatewayUrlByIPFS,
  getTokensUris,
} from '../../../nft/nft-data';
import {getPact} from '../../../api/kadena/pact';
import {
  makeSelectActiveNetworkDetails,
} from '../../../store/networks/selectors';
import {makeSelectSelectedAccount} from '../../../store/userWallet/selectors';
import {useShallowEqualSelector} from '../../../store/utils';
import {idToPascalCase} from '../../../nft/utils';
import NftCard from '../components/NftCard';
import {ERootStackRoutes, TNavigationProp, TNavigationRouteProp} from '../../../routes/types';

type TRouteParams = {
  id: string;
  name: string;
  chainId: string | number;
};

type NgTokenData = {
  tokenId: string;
  metadata: any;
  src: string;
  number: number;
  uri: string;
};

const MarmaladeNGCollectionDetails = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const route = useRoute<TNavigationRouteProp<ERootStackRoutes.NftMarmaladeNGDetails>>();
  const {id, chainId, name} = route.params as any as TRouteParams;

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const activeNetworkDetails = useShallowEqualSelector(
    makeSelectActiveNetworkDetails,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [ngNFTs, setNgNFTs] = useState<NgTokenData[]>([]);

  useEffect(() => {
    const fetchNGNftAsync = async () => {
      if (!selectedAccount?.accountName || !activeNetworkDetails) return;
      setIsLoading(true);
      try {
        const ngNftsResponse = await getPact({
          network: activeNetworkDetails.network,
          instance: activeNetworkDetails.instance,
          version: `${activeNetworkDetails.version}`,
          chainId,
          pactCode: `(${MARMALADE_NG_CONTRACT}.ledger.list-balances "${selectedAccount.accountName}")`,
        });
        const ownedTokens: string[] =
          ngNftsResponse?.map((t: any) => t.id) ?? [];

        const uriResponse = await getPact({
          network: activeNetworkDetails.network,
          instance: activeNetworkDetails.instance,
          version: `${activeNetworkDetails.version}`,
          chainId,
          pactCode: getTokensUris(ownedTokens),
        });

        const uris: {tokenId: string; uri: string}[] = uriResponse ?? [];

        const collectionTokensResponse = await getPact({
          network: activeNetworkDetails.network,
          instance: activeNetworkDetails.instance,
          version: `${activeNetworkDetails.version}`,
          chainId,
          pactCode: `(${MARMALADE_NG_CONTRACT}.policy-collection.list-tokens-of-collection "${id}")`,
        });

        const ownedNFT: {tokenId: string; uri: string; index: number}[] = [];
        (collectionTokensResponse || []).forEach((t: string, index: number) => {
          const found = uris.find(tokenUser => tokenUser.tokenId === t);
          if (found) {
            ownedNFT.push({
              tokenId: t,
              index,
              uri: found.uri ?? '#',
            });
          }
        });

        const prepareNFTData: NgTokenData[] = await Promise.all(
          ownedNFT.map(async token => {
            const uriDataResponse = await fetch(
              getGatewayUrlByIPFS(token.uri, chainId),
            );
            const metadata = await uriDataResponse.json();
            return {
              tokenId: token.tokenId,
              number: token.index + 1,
              metadata,
              uri: token.uri,
              src: getGatewayUrlByIPFS(metadata.image, chainId),
            };
          }),
        );

        setNgNFTs(prepareNFTData);
      } catch {
        setNgNFTs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNGNftAsync();
  }, [selectedAccount?.accountName, activeNetworkDetails?.network, id, chainId]);

  return (
    <View style={styles.container}>
      <Header
        title={idToPascalCase(name) || t('nft.header')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={theme.text.primary} />
        ) : (
          <View style={styles.grid}>
            {ngNFTs?.length ? (
              ngNFTs.map(token => (
                <NftCard
                  key={token.tokenId}
                  imageUrl={token.src}
                  label={`#${token.number}`}
                  onPress={() =>
                    navigation.navigate(ERootStackRoutes.NftItemDetails, {
                      type: NFTTypes.MARMALADE_NG,
                      tokenId: token.tokenId,
                      uri: token.uri,
                      metadata: token.metadata,
                      number: token.number,
                      name,
                      chainId,
                    } as any)
                  }
                />
              ))
            ) : (
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>
                  {t('nft.noOwnedCollection', {
                    name: idToPascalCase(name),
                  })}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MarmaladeNGCollectionDetails;

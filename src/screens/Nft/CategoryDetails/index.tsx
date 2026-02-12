import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '../../../components/Header';
import {useAppThemeContext} from '../../../contexts';
import {makeStyles} from './styles';
import nftList, {NFTTypes} from '../../../nft/nft-data';
import {getPact} from '../../../api/kadena/pact';
import {
  makeSelectActiveNetworkDetails,
} from '../../../store/networks/selectors';
import {makeSelectSelectedAccount} from '../../../store/userWallet/selectors';
import {useShallowEqualSelector} from '../../../store/utils';
import NftCard from '../components/NftCard';
import {
  ERootStackRoutes,
  TNavigationProp,
  TNavigationRouteProp,
} from '../../../routes/types';

type TRouteParams = {
  category: string;
};

const CategoryDetails = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const route = useRoute<TNavigationRouteProp<ERootStackRoutes.NftCategoryDetails>>();
  const {category} = route.params as any as TRouteParams;

  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const selectedAccount = useShallowEqualSelector(makeSelectSelectedAccount);
  const activeNetworkDetails = useShallowEqualSelector(
    makeSelectActiveNetworkDetails,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [nftUUIDs, setNftUUIDs] = useState<any[]>([]);

  const nftData = nftList.find(n => n.pactAlias === category);

  useEffect(() => {
    const fetchNftData = async () => {
      if (!selectedAccount?.accountName || !activeNetworkDetails || !nftData) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await getPact({
          network: activeNetworkDetails.network,
          instance: activeNetworkDetails.instance,
          version: `${activeNetworkDetails.version}`,
          chainId: nftData.chainId,
          pactCode: nftData.getAccountBalance(selectedAccount.accountName),
        });
        if (nftData.type === NFTTypes.MARMALADE_V2) {
          const uris: any[] = [];
          Object.keys(res || {}).forEach(tokenKey => {
            if (res?.[tokenKey]?.accountBalance > 0) {
              uris.push(res?.[tokenKey]);
            }
          });
          setNftUUIDs(uris);
        } else {
          const ids = (res || []).map((nft: any) => nft?.id);
          setNftUUIDs(ids);
        }
      } catch {
        setNftUUIDs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNftData();
  }, [
    category,
    selectedAccount?.accountName,
    activeNetworkDetails?.network,
    nftData?.pactAlias,
  ]);

  const renderNFT = (id: any) => {
    if (!nftData) return null;
    switch (nftData.type) {
      case NFTTypes.ARKADE:
      case NFTTypes.KITTY_KAD:
      case NFTTypes.WIZ_ARENA: {
        const imageUrl = nftData.getPicById(id);
        return (
          <NftCard
            key={`${nftData.pactAlias}-${id}`}
            imageUrl={imageUrl}
            label={`#${id}`}
            onPress={() =>
              navigation.navigate(ERootStackRoutes.NftItemDetails, {
                type: nftData.type,
                category: nftData.pactAlias,
                id,
              } as any)
            }
          />
        );
      }
      case NFTTypes.KADENA_MINING_CLUB: {
        return (
          <KmcMinerCard
            key={`${nftData.pactAlias}-${id}`}
            id={id}
            onPress={(data: any) =>
              navigation.navigate(ERootStackRoutes.NftItemDetails, {
                type: nftData.type,
                category: nftData.pactAlias,
                id,
                data,
              } as any)
            }
          />
        );
      }
      case NFTTypes.KADENA_MINING_CLUB_FOUNDER_PASS: {
        return (
          <KmcFounderCard
            key={`${nftData.pactAlias}-${id}`}
            id={id}
            onPress={(data: any) =>
              navigation.navigate(ERootStackRoutes.NftItemDetails, {
                type: nftData.type,
                category: nftData.pactAlias,
                id,
                data,
              } as any)
            }
          />
        );
      }
      case NFTTypes.MARMALADE_V2: {
        return (
          <MarmaladeV2Card
            key={`${nftData.pactAlias}-${id?.auctionNumber || id?.['token-id']}`}
            data={id}
            onPress={() =>
              navigation.navigate(ERootStackRoutes.NftItemDetails, {
                type: nftData.type,
                category: nftData.pactAlias,
                data: id,
              } as any)
            }
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={nftData?.displayName || t('nft.header')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={theme.text.primary} />
        ) : (
          <View style={styles.grid}>
            {nftUUIDs?.length ? (
              nftUUIDs.map(id => renderNFT(id))
            ) : (
              <View style={styles.emptyWrapper}>
                <Text style={styles.emptyText}>
                  {t('nft.noOwnedCollection', {
                    name: nftData?.displayName || '',
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

export default CategoryDetails;

type TKmcCardProps = {
  id: string;
  onPress: (data: any) => void;
};

const KmcMinerCard = ({id, onPress}: TKmcCardProps) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const activeNetworkDetails = useShallowEqualSelector(
    makeSelectActiveNetworkDetails,
  );
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (!activeNetworkDetails) return;
      const res = await getPact({
        network: activeNetworkDetails.network,
        instance: activeNetworkDetails.instance,
        version: `${activeNetworkDetails.version}`,
        chainId: 8,
        pactCode: `(free.kadena-mining-club.get-miner-details "${id}")`,
      });
      setData({
        id: res?.['old-nft-id'] ?? '',
        uri: res?.uri,
        src: res?.uri
          ? `https://farm.kdamining.club/assets/${res?.uri}.jpeg`
          : undefined,
      });
    };
    fetchDetails();
  }, [id, activeNetworkDetails?.network]);

  return (
    <NftCard
      imageUrl={data?.src}
      label={`#${data?.id || ''}`}
      onPress={() => onPress(data)}
      style={styles.card}
    />
  );
};

const KmcFounderCard = ({id, onPress}: TKmcCardProps) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const activeNetworkDetails = useShallowEqualSelector(
    makeSelectActiveNetworkDetails,
  );
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (!activeNetworkDetails) return;
      const res = await getPact({
        network: activeNetworkDetails.network,
        instance: activeNetworkDetails.instance,
        version: `${activeNetworkDetails.version}`,
        chainId: 8,
        pactCode: `(free.kadena-mining-club.get-founders-details "${id}")`,
      });
      setData({id: res?.['old-nft-id'] ?? ''});
    };
    fetchDetails();
  }, [id, activeNetworkDetails?.network]);

  return (
    <NftCard
      imageUrl="https://farm.kdamining.club/static/media/founders.b9d3a224b6ce8e690f53.webp"
      label={`#${data?.id || ''}`}
      onPress={() => onPress(data)}
      style={styles.card}
    />
  );
};

const MarmaladeV2Card = ({
  data,
  onPress,
}: {
  data: any;
  onPress: () => void;
}) => {
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    const fetchUri = async () => {
      if (!data?.uri) return;
      try {
        const response = await fetch(data.uri);
        const json = await response.json();
        setImageUrl(json?.image);
      } catch {
        setImageUrl(undefined);
      }
    };
    fetchUri();
  }, [data?.uri]);

  return (
    <NftCard
      imageUrl={imageUrl}
      label={`#${data?.auctionNumber || ''}`}
      onPress={onPress}
      style={styles.card}
    />
  );
};

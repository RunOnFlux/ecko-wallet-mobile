import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import JSONTree from 'react-native-json-tree';
import Header from '../../../components/Header';
import {useAppThemeContext} from '../../../contexts';
import {makeStyles} from './styles';
import nftList, {
  NFTTypes,
  getGatewayUrlByIPFS,
} from '../../../nft/nft-data';
import {getPact} from '../../../api/kadena/pact';
import {
  makeSelectActiveNetworkDetails,
} from '../../../store/networks/selectors';
import {useShallowEqualSelector} from '../../../store/utils';
import {
  ERootStackRoutes,
  TNavigationProp,
  TNavigationRouteProp,
} from '../../../routes/types';

type TNftItemParams = {
  type: NFTTypes;
  category?: string;
  id?: string | number;
  data?: any;
  tokenId?: string;
  uri?: string;
  metadata?: any;
  number?: number;
  name?: string;
  chainId?: string | number;
};

const NftItemDetails = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<TNavigationProp<ERootStackRoutes.Home>>();
  const route = useRoute<TNavigationRouteProp<ERootStackRoutes.NftItemDetails>>();
  const params = route.params as any as TNftItemParams;
  const {theme} = useAppThemeContext();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const activeNetworkDetails = useShallowEqualSelector(
    makeSelectActiveNetworkDetails,
  );

  const nftData = params.category
    ? nftList.find(n => n.pactAlias === params.category)
    : undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [uriData, setUriData] = useState<any>();
  const [kmcData, setKmcData] = useState<any>();
  const [wizardData, setWizardData] = useState<any>();
  const [ngMetadata, setNgMetadata] = useState<any>(params.metadata);

  useEffect(() => {
    const fetchMarmaladeV2 = async () => {
      if (!params.data?.uri) return;
      setIsLoading(true);
      try {
        const response = await fetch(params.data.uri);
        const json = await response.json();
        setUriData(json);
      } catch {
        setUriData(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchKmc = async () => {
      if (!activeNetworkDetails || !params.id) return;
      setIsLoading(true);
      try {
        const res = await getPact({
          network: activeNetworkDetails.network,
          instance: activeNetworkDetails.instance,
          version: `${activeNetworkDetails.version}`,
          chainId: 8,
          pactCode: `(free.kadena-mining-club.get-miner-details "${params.id}")`,
        });
        const uri = res?.uri;
        if (uri) {
          const response = await fetch(
            `https://farm.kdamining.club/assets/${uri}.json`,
          );
          const json = await response.json();
          setKmcData({
            id: res?.['old-nft-id'] ?? '',
            uri,
            metadata: json,
          });
        }
      } catch {
        setKmcData(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWizard = async () => {
      if (!activeNetworkDetails || params.id === undefined) return;
      setIsLoading(true);
      try {
        const res = await getPact({
          network: activeNetworkDetails.network,
          instance: activeNetworkDetails.instance,
          version: `${activeNetworkDetails.version}`,
          chainId: 1,
          pactCode: `(free.wiz-arena.get-wizard-fields-for-id ${params.id})`,
        });
        setWizardData(res);
      } catch {
        setWizardData(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchNg = async () => {
      if (ngMetadata || !params.uri || !params.chainId) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          getGatewayUrlByIPFS(params.uri, params.chainId),
        );
        const json = await response.json();
        setNgMetadata(json);
      } catch {
        setNgMetadata(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.type === NFTTypes.MARMALADE_V2) fetchMarmaladeV2();
    if (params.type === NFTTypes.KADENA_MINING_CLUB) fetchKmc();
    if (params.type === NFTTypes.WIZ_ARENA) fetchWizard();
    if (params.type === NFTTypes.MARMALADE_NG) fetchNg();
  }, [params, activeNetworkDetails?.network]);

  const openLink = (url?: string) => {
    if (!url || url === '#') return;
    Linking.openURL(url);
  };

  const renderLink = (url?: string) => {
    if (!url || url === '#') return null;
    return (
      <TouchableOpacity onPress={() => openLink(url)}>
        <Text style={styles.linkText}>{t('nft.fullDetails')}</Text>
      </TouchableOpacity>
    );
  };

  const renderKeyValue = (label: string, value?: string) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '-'}</Text>
    </View>
  );

  const renderMarmaladeV2 = () => (
    <View>
      <Image style={styles.image} source={{uri: uriData?.image}} />
      {renderKeyValue(t('nft.name'), uriData?.name)}
      {renderKeyValue(t('nft.description'), uriData?.description)}
      <Text style={styles.sectionTitle}>{t('nft.properties')}</Text>
      {uriData?.properties
        ? Object.keys(uriData?.properties).map((propertyKey: string) =>
            renderKeyValue(propertyKey, uriData?.properties?.[propertyKey]),
          )
        : null}
      {renderLink(nftData?.getDetailLinkById?.(params.data?.auctionNumber))}
    </View>
  );

  const renderArkade = () => (
    <View>
      <Image
        style={styles.image}
        source={{uri: nftData?.getPicById(params.id || '')}}
      />
      {renderLink(nftData?.getDetailLinkById?.(params.id || ''))}
    </View>
  );

  const renderWizard = () => (
    <View>
      <Image
        style={styles.image}
        source={{uri: nftData?.getPicById(params.id || '')}}
      />
      {renderKeyValue(t('nft.level'), wizardData?.level?.int?.toString())}
      {renderKeyValue(t('nft.element'), wizardData?.element)}
      {renderKeyValue(
        t('nft.spell'),
        wizardData?.spellSelected?.name || '-',
      )}
      {renderKeyValue(
        t('nft.weakness'),
        wizardData?.weakness?.toUpperCase?.() || '-',
      )}
      {renderLink(nftData?.getDetailLinkById?.(params.id || ''))}
    </View>
  );

  const renderKmc = () => {
    const imageSrc = kmcData?.metadata?.imageName
      ? `https://farm.kdamining.club/assets/${kmcData?.metadata?.imageName}`
      : kmcData?.uri
      ? `https://farm.kdamining.club/assets/${kmcData?.uri}.jpeg`
      : undefined;
    return (
      <View>
        {imageSrc ? (
          <Image style={styles.image} source={{uri: imageSrc}} />
        ) : null}
        {kmcData?.metadata?.attributes?.map((attr: any) =>
          renderKeyValue(attr?.trait_type, attr?.value),
        )}
        {renderLink(nftData?.getDetailLinkById?.(params.id || ''))}
      </View>
    );
  };

  const renderKmcFounder = () => (
    <View>
      <Image
        style={styles.image}
        source={{
          uri: 'https://farm.kdamining.club/static/media/founders.b9d3a224b6ce8e690f53.webp',
        }}
      />
      <Text style={styles.sectionTitle}>
        {t('nft.foundersPassTitle', {id: params.data?.id || params.id || ''})}
      </Text>
      <Text style={styles.paragraph}>{t('nft.foundersPassDescription')}</Text>
      {renderLink(nftData?.getDetailLinkById?.(params.id || ''))}
    </View>
  );

  const renderMarmaladeNg = () => {
    const img = ngMetadata?.image
      ? getGatewayUrlByIPFS(ngMetadata.image, params.chainId || '0')
      : undefined;
    return (
      <View>
        {img ? <Image style={styles.image} source={{uri: img}} /> : null}
        <Text style={styles.sectionTitle}>{t('nft.metadata')}</Text>
        <View style={styles.jsonWrapper}>
          <JSONTree
            data={ngMetadata || {}}
            theme={{
              scheme: 'ecko',
              base00: theme.background,
              base01: theme.surface,
              base02: theme.border,
              base03: theme.text.secondary,
              base04: theme.text.secondary,
              base05: theme.text.primary,
              base06: theme.text.primary,
              base07: theme.text.primary,
              base08: theme.error.color,
              base09: theme.brand,
              base0A: theme.brand,
              base0B: theme.success.color,
              base0C: theme.text.secondary,
              base0D: theme.text.primary,
              base0E: theme.brand,
              base0F: theme.text.secondary,
            }}
            invertTheme={false as any}
          />
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (params.type) {
      case NFTTypes.MARMALADE_V2:
        return renderMarmaladeV2();
      case NFTTypes.KADENA_MINING_CLUB:
        return renderKmc();
      case NFTTypes.KADENA_MINING_CLUB_FOUNDER_PASS:
        return renderKmcFounder();
      case NFTTypes.WIZ_ARENA:
        return renderWizard();
      case NFTTypes.MARMALADE_NG:
        return renderMarmaladeNg();
      case NFTTypes.ARKADE:
      case NFTTypes.KITTY_KAD:
      default:
        return renderArkade();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('nft.detailsTitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={theme.text.primary} />
        ) : (
          renderContent()
        )}
      </ScrollView>
    </View>
  );
};

export default NftItemDetails;

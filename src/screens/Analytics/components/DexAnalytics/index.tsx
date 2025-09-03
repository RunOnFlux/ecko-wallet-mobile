import React from 'react';
import { View, Text } from 'react-native';
import { useAppThemeContext } from '../../../../contexts';
import { TokenTrend } from './TokenTrend';
import { PairTrend } from './PairTrend';
import { ECKO_DEXTOOLS_API_URL } from '../../../../api/constants';
import { getTokenImageUrl } from '../../../../utils/tokenImages';
import { useTranslation } from 'react-i18next';

type TickerPerformance = { ticker: string; diff: number };
type PerformanceData = { tickers: TickerPerformance[] };
type DexPair = {
  token0: { name: string };
  token1: { name: string };
  volume24h: number;
  pricePercChange24h: number;
};

const useDexTokensPerformance = (): {
  data: PerformanceData | null;
  loading: boolean;
} => {
  const [state, setState] = React.useState<{
    data: PerformanceData | null;
    loading: boolean;
  }>({ data: null, loading: true });
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${ECKO_DEXTOOLS_API_URL}/api/performance-summary?interval=1D`,
        );
        const json = await res.json();
        const tickers = Array.isArray(json?.tickers) ? json.tickers : [];
        if (mounted) setState({ data: { tickers }, loading: false });
      } catch (e) {
        if (mounted) setState({ data: { tickers: [] }, loading: false });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return state;
};

const useDexPairs = (): { data: DexPair[]; loading: boolean } => {
  const [state, setState] = React.useState<{
    data: DexPair[];
    loading: boolean;
  }>({ data: [], loading: true });
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${ECKO_DEXTOOLS_API_URL}/api/pairs`);
        const json = await res.json();
        const data = Array.isArray(json)
          ? json
          : Array.isArray(json?.collection)
            ? json.collection
            : [];
        if (mounted) setState({ data, loading: false });
      } catch (e) {
        if (mounted) setState({ data: [], loading: false });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return state;
};

const DexAnalytics = () => {
  const { t } = useTranslation();
  const { theme } = useAppThemeContext();
  const { data: perf, loading: perfLoading } = useDexTokensPerformance();
  const { data: pairs, loading: pairsLoading } = useDexPairs();

  if (perfLoading) return null;

  const best = perf?.tickers?.reduce(
    (max, t) => (t.diff > max.diff ? t : max),
    perf?.tickers?.[0],
  );
  const worst = perf?.tickers?.reduce(
    (min, t) => (t.diff < min.diff ? t : min),
    perf?.tickers?.[0],
  );
  const topPair = (pairs || [])?.reduce(
    (max, p) => (p.volume24h > (max?.volume24h || 0) ? p : max),
    pairs[0],
  );

  return (
    <View style={{ paddingBottom: 8 }}>
      <Text
        style={{
          color: theme.text.secondary,
          fontSize: 14,
          marginHorizontal: 20,
          marginVertical: 10,
        }}
      >
        {t('analytics.charts.dexAnalytics')}
      </Text>
      {best && (
        <TokenTrend
          title={t('analytics.dexLabels.topGainer')}
          iconUri={getTokenImageUrl(best.ticker)}
          symbol={best.ticker}
          value={best.diff}
          isUp={best.diff > 0}
        />
      )}
      {worst && (
        <TokenTrend
          title={t('analytics.dexLabels.topLoser')}
          iconUri={getTokenImageUrl(worst.ticker)}
          symbol={worst.ticker}
          value={worst.diff}
          isUp={worst.diff > 0}
        />
      )}
      {topPair && !pairsLoading && (
        <PairTrend
          title={t('analytics.dexLabels.topTradedPair')}
          iconUri0={getTokenImageUrl(topPair.token0.name)}
          iconUri1={getTokenImageUrl(topPair.token1.name)}
          symbol0={topPair.token0.name}
          symbol1={topPair.token1.name}
          value={topPair.pricePercChange24h}
          isUp={topPair.pricePercChange24h > 0}
        />
      )}
    </View>
  );
};

export default DexAnalytics;

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { VictoryPie } from 'victory-native';
import { useAppThemeContext } from '../../../../contexts';
import { makeStyles } from './styles';
import { useShallowEqualSelector } from '../../../../store/utils';
import {
  makeSelectAccounts,
  makeSelectUsdEquivalents,
} from '../../../../store/userWallet/selectors';
import { TAccount, TWallet } from '../../../../store/userWallet/types';

const COLORS = [
  '#E25F5F',
  '#E1E794',
  '#877ce6',
  '#94AEE7',
  '#B7E794',
  '#ED1CB5',
  '#FD9F28',
  '#E794E7',
  '#E7E494',
  '#94E7DA',
];

const formatUsd = (v: number) => `$ ${v.toFixed(2)}`;

const getSymbolFromAddress = (address: string) => {
  if (address === 'coin') return 'KDA';
  const parts = address.split('.');
  return (parts[parts.length - 1] || address).toUpperCase();
};

const ChartAllocation = () => {
  const { theme } = useAppThemeContext();
  const accounts = useShallowEqualSelector(makeSelectAccounts);
  const usdEquivalents = useShallowEqualSelector(makeSelectUsdEquivalents);
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, total } = useMemo(() => {
    const tokenToUsd: Record<string, number> = {};
    (accounts || []).forEach((account: TAccount) => {
      (account.wallets || []).forEach((w: TWallet) => {
        const price = Array.isArray(usdEquivalents)
          ? usdEquivalents?.find(p => p.token === w.tokenAddress)?.usd || 0
          : 0;
        const usdValue = Number(w.totalAmount) * Number(price);
        tokenToUsd[w.tokenAddress] =
          (tokenToUsd[w.tokenAddress] || 0) + usdValue;
      });
    });

    const entries = Object.entries(tokenToUsd)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);

    const totalUsd = entries.reduce((acc, [, v]) => acc + v, 0);
    const chartData = entries.map(([address, usd]) => ({
      x: getSymbolFromAddress(address),
      y: usd,
      address,
    }));

    return { data: chartData, total: totalUsd };
  }, [accounts, usdEquivalents]);

  if (!data.length) {
    return (
      <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
        <Text style={{ color: theme.text.secondary, textAlign: 'center' }}>
          No data yet
        </Text>
      </View>
    );
  }

  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PIE CHART</Text>
      <View style={styles.chartWrapper}>
        {(() => {
          const chartWidth = Math.max(280, Math.min(screenWidth - 40, 600));
          const radius = Math.floor(chartWidth / 2 - 6);
          const innerRadius = Math.floor(radius * 0.6);
          const chartHeight = radius + 30;
          const originY = radius + 8;
          return (
            <VictoryPie
              data={data}
              startAngle={-90}
              endAngle={90}
              innerRadius={innerRadius}
              padAngle={2}
              colorScale={COLORS}
              labels={() => ''}
              height={chartHeight}
              width={chartWidth}
              radius={radius}
              origin={{ x: chartWidth / 2, y: originY }}
              style={{
                data: { stroke: theme.background, strokeWidth: 2 },
              }}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onPressIn: () => [
                      {
                        target: 'data',
                        mutation: (props: any) => {
                          if (clearTimerRef.current) {
                            clearTimeout(clearTimerRef.current);
                            clearTimerRef.current = null;
                          }
                          setActiveIndex(props.index);
                          return null;
                        },
                      },
                    ],
                    onPressOut: () => [
                      {
                        target: 'data',
                        mutation: () => {
                          if (clearTimerRef.current) {
                            clearTimeout(clearTimerRef.current);
                          }
                          clearTimerRef.current = setTimeout(() => {
                            setActiveIndex(null);
                            clearTimerRef.current = null;
                          }, 800);
                          return null;
                        },
                      },
                    ],
                  },
                },
              ]}
            />
          );
        })()}
        <View
          style={[
            styles.centerLabelWrapper,
            {
              width: screenWidth - 40,
              top: (Math.min(screenWidth - 40, 600) / 2) * 0.6,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.centerTitle}>
            {activeIndex !== null ? data[activeIndex]?.x : 'TOT'}
          </Text>
          <Text style={styles.centerValue}>
            {activeIndex !== null
              ? formatUsd(Number(data[activeIndex]?.y || 0))
              : formatUsd(total)}
          </Text>
        </View>
      </View>
      <View style={styles.legendWrapper}>
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.y / total) * 100).toFixed(2) : '0.00';
          return (
            <View key={`${d.x}-${i}`} style={styles.legendRow}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: COLORS[i % COLORS.length] },
                ]}
              />
              <Text style={styles.legendToken}>{d.x}</Text>
              <Text style={styles.legendPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ChartAllocation;

import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory-native';
import moment from 'moment';
import TimeSelector, {
  TimeStep,
  stepsInDays,
  TIME_EPOCH,
} from '../../../../components/TimeSelector';
import { useAccountBalance } from '../../hooks/useAccountBalance';
import { useAppThemeContext } from '../../../../contexts';
import { makeStyles } from './styles';

type PnlPoint = { x: string; y: number };

const DailyPnLChart = ({ refreshToken = 0 }: { refreshToken?: number }) => {
  const { theme } = useAppThemeContext();
  const [step, setStep] = useState<TimeStep>('2W');

  const stepInDays = stepsInDays[step];

  const to = moment().format('YYYY-MM-DD');
  const from =
    stepInDays === -1
      ? TIME_EPOCH
      : moment().subtract(stepInDays, 'days').format('YYYY-MM-DD');

  const { data: balanceData, loading } = useAccountBalance({
    from,
    to,
    refreshToken,
  });

  const pnlData: PnlPoint[] = useMemo(() => {
    if (!balanceData?.length) return [];
    const sorted = [...balanceData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const converted = sorted.map((item, index) => {
      if (index === 0) {
        return { x: moment(item.date).format('D MMM'), y: 0 };
      }
      const pnl = item.totalUsdValue - sorted[index - 1].totalUsdValue;
      return {
        x: moment(item.date).format('D MMM'),
        y: Number(pnl.toFixed(2)),
      };
    });
    return converted.slice(1);
  }, [balanceData]);

  const [minDomainY, maxDomainY, tickValuesY] = useMemo(() => {
    if (!pnlData.length) return [0, 0, [0]] as const;
    const values = pnlData.map(p => p.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const maxAbs = Math.max(Math.abs(min), Math.abs(max));
    if (maxAbs === 0) return [0, 0, [0]] as const;
    const padded = maxAbs * 1.1;
    const domainMin = -padded;
    const domainMax = padded;
    const mid = padded / 2;
    const ticks = [-padded, -mid, 0, mid, padded];
    return [domainMin, domainMax, ticks] as const;
  }, [pnlData]);

  const xLabelIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    pnlData.forEach((p, i) => map.set(p.x, i));
    return map;
  }, [pnlData]);

  const visibleLabelIndexSet = useMemo(() => {
    const total = pnlData.length;
    const set = new Set<number>();
    if (total <= 7) {
      for (let i = 0; i < total; i++) set.add(i);
      return set;
    }
    if (total === 14) {
      for (let i = 0; i < total; i += 2) set.add(i);
      return set;
    }
    const desired = 7;
    const last = total - 1;
    for (let k = 0; k < desired; k++) {
      const idx = Math.round((k * last) / (desired - 1));
      set.add(idx);
    }
    return set;
  }, [pnlData]);

  const styles = makeStyles(theme);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!pnlData.length) {
    return (
      <View style={styles.emptyWrapper}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DAILY P&L</Text>
      <VictoryChart
        domain={{ y: [minDomainY, maxDomainY] }}
        domainPadding={{ x: [20, 40] }}
        padding={{ top: 10, bottom: 40, left: 30, right: 30 }}
        height={240}
        containerComponent={
          <VictoryVoronoiContainer
            activateData={false}
            labels={({ datum }) => ` ${datum.x}\n  $${datum.y.toFixed(2)}`}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ stroke: '#fff', fill: '#000', padding: 10 }}
                style={{ fill: '#fff', fontSize: 12 }}
                cornerRadius={4}
                pointerLength={10}
              />
            }
          />
        }
      >
        <VictoryAxis
          crossAxis={false}
          offsetY={20}
          orientation="bottom"
          tickFormat={(t: string | number) =>
            visibleLabelIndexSet.has(xLabelIndexMap.get(String(t)) ?? -1)
              ? String(t)
              : ''
          }
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: 'transparent' },
            ticks: { stroke: 'transparent' },
            tickLabels: {
              fill: theme.text.secondary,
              fontSize: 10,
              padding: 8,
            },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickValues={[...tickValuesY]}
          tickFormat={(t: number) =>
            `${t < 0 ? '-' : ''}$${Math.abs(t).toFixed(2)}`
          }
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: 'transparent' },
            ticks: { stroke: 'transparent' },
            tickLabels: { fill: theme.text.secondary, fontSize: 10 },
          }}
        />
        <VictoryBar
          data={pnlData}
          barRatio={0.8}
          cornerRadius={{ top: 6 }}
          style={{
            data: {
              fill: ({ datum }) => (datum.y >= 0 ? '#009b10' : '#e33a3c'),
            },
          }}
        />
      </VictoryChart>
      <TimeSelector
        defaultStep={step}
        timeSteps={['1W', '2W', '1M']}
        onTimeSelected={setStep}
      />
    </View>
  );
};

export default DailyPnLChart;

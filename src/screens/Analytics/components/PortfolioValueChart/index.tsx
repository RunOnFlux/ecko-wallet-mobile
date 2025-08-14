import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  VictoryChart,
  VictoryArea,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryAxis,
} from 'victory-native';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAccountBalance } from '../../hooks/useAccountBalance';
import ChangeBadge from '../../../../components/ChangeBadge';
import TimeSelector, {
  stepsInDays,
  TIME_EPOCH,
  TimeStep,
} from '../../../../components/TimeSelector';
import moment from 'moment';
import { createStyles } from './styles';
import { useAppThemeContext } from '../../../../contexts';
import { useShallowEqualSelector } from '../../../../store/utils';
import { makeSelectCanTrackPortfolio } from '../../../../store/analytics';
import TrackPrompt from './components/TrackPrompt';

const PortfolioValueChart = ({
  refreshToken = 0,
}: {
  refreshToken?: number;
}) => {
  const { theme } = useAppThemeContext();
  const styles = createStyles(theme);
  const canTrack = useShallowEqualSelector(makeSelectCanTrackPortfolio);

  const [step, setStep] = useState<TimeStep>('1W');

  const stepInDays = stepsInDays[step];

  const to = moment().format('YYYY-MM-DD');
  const from =
    stepInDays === -1
      ? TIME_EPOCH
      : moment().subtract(stepInDays, 'days').format('YYYY-MM-DD');

  const { data, loading } = useAccountBalance({
    from,
    to,
    refreshToken,
    enabled: canTrack,
  });

  const filteredData = useMemo(() => {
    if (!data) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return sorted;
  }, [data, step]);

  const chartData = useMemo(() => {
    return filteredData.map(item => ({
      x: new Date(item.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      }),
      y: item.totalUsdValue,
    }));
  }, [filteredData]);
  const currentValue = filteredData.at(-1)?.totalUsdValue ?? 0;
  const firstValue = filteredData.at(0)?.totalUsdValue ?? 0;
  const change = currentValue - firstValue;
  const changePct = firstValue !== 0 ? (change / firstValue) * 100 : 0;

  const showEmpty = !loading && chartData.length === 0;
  const gated = !canTrack;
  return (
    <View style={styles.container}>
      <Text
        style={{
          color: theme.text.secondary,
          fontSize: 14,
          marginBottom: 8,
          paddingHorizontal: 20,
        }}
      >
        PORTFOLIO VALUE CHART
      </Text>
      {gated ? (
        <TrackPrompt />
      ) : (
        !showEmpty && (
          <View style={styles.header}>
            <Text style={styles.valueText}>${currentValue.toFixed(2)}</Text>
            <ChangeBadge changePct={changePct} />
          </View>
        )
      )}
      {gated ? (
        <></>
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      ) : showEmpty ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>No data yet</Text>
        </View>
      ) : (
        <VictoryChart
          domainPadding={{ x: 15, y: 0 }}
          padding={{ top: 30, bottom: 10, left: 5, right: 5 }}
          containerComponent={
            <VictoryVoronoiContainer
              activateData={false}
              labels={({ datum }) => ` ${datum.x}\n  $${datum.y.toFixed(2)}`}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    stroke: '#fff',
                    fill: '#000',
                    padding: 10,
                  }}
                  style={{ fill: '#fff', fontSize: 12 }}
                  cornerRadius={4}
                  pointerLength={10}
                />
              }
            />
          }
        >
          <Defs>
            <LinearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ff00ff" stopOpacity={0.5} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <VictoryAxis
            style={{
              axis: { stroke: 'transparent' },
              ticks: { stroke: 'transparent' },
              tickLabels: { fill: 'transparent' },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: 'transparent' },
              ticks: { stroke: 'transparent' },
              tickLabels: { fill: 'transparent' },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryArea
            data={chartData}
            interpolation="monotoneX"
            style={{
              data: {
                stroke: '#ff00ff',
                strokeWidth: 2,
                fill: 'url(#portfolioGradient)',
              },
            }}
          />
        </VictoryChart>
      )}
      {!gated && (
        <TimeSelector
          timeSteps={['1W', '1M', '1Y']}
          defaultStep={step}
          onTimeSelected={step => {
            setStep(step);
          }}
        />
      )}
    </View>
  );
};

export default PortfolioValueChart;

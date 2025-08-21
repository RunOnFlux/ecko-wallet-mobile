import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import TimeSelector, { TimeStep } from '../../../../components/TimeSelector';
import { useAppThemeContext } from '../../../../contexts';
import { ECKO_DEXTOOLS_API_URL } from '../../../../api/constants';

type TickerPerformance = {
  ticker: string;
  close: number;
  diff: number;
  volume: number;
};

type PerformanceData = { tickers: TickerPerformance[] };

const useDexTokensPerformance = (
  interval: TimeStep,
): {
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
          `${ECKO_DEXTOOLS_API_URL}/api/performance-summary?interval=${interval}`,
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
  }, [interval]);
  return state;
};

type HMItem = { name: string; value: number; price: number; diff: number };
type RectBox = { x: number; y: number; w: number; h: number; item: HMItem };

function layoutBinary(
  items: HMItem[],
  x: number,
  y: number,
  w: number,
  h: number,
  horizontal: boolean,
): RectBox[] {
  if (!items.length) return [];
  if (items.length === 1) return [{ x, y, w, h, item: items[0] }];
  const total = items.reduce((s, it) => s + it.value, 0) || 1;
  const sorted = [...items].sort((a, b) => b.value - a.value);
  let acc = 0;
  let splitIndex = 0;
  for (let i = 0; i < sorted.length; i++) {
    acc += sorted[i].value;
    if (acc >= total / 2) {
      splitIndex = i + 1;
      break;
    }
  }
  const first = sorted.slice(0, splitIndex);
  const second = sorted.slice(splitIndex);
  const sumFirst = first.reduce((s, it) => s + it.value, 0) || 1;
  const sumSecond = total - sumFirst || 1;
  if (horizontal) {
    const w1 = (w * sumFirst) / total;
    return [
      ...layoutBinary(first, x, y, w1, h, !horizontal),
      ...layoutBinary(second, x + w1, y, w - w1, h, !horizontal),
    ];
  } else {
    const h1 = (h * sumFirst) / total;
    return [
      ...layoutBinary(first, x, y, w, h1, !horizontal),
      ...layoutBinary(second, x, y + h1, w, h - h1, !horizontal),
    ];
  }
}

const Heatmap = () => {
  const { theme } = useAppThemeContext();
  const { width } = useWindowDimensions();
  const [interval, setInterval] = useState<TimeStep>('1D');
  const { data, loading } = useDexTokensPerformance(interval);

  const items: HMItem[] = useMemo(() => {
    const tickers = data?.tickers || [];
    const sorted = [...tickers]
      .sort((a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0))
      .slice(0, 6);
    const maybeKDA = tickers.find(t => t.ticker === 'KDA');
    const list =
      maybeKDA && !sorted.some(t => t.ticker === 'KDA')
        ? [...sorted, maybeKDA]
        : sorted;
    return list.map(t => ({
      name: t.ticker,
      value: Math.abs(Number(t.diff) || 0) || 0.01,
      price: Number(t.close ?? 0),
      diff: Number(t.diff ?? 0),
    }));
  }, [data]);

  const chartWidth = Math.max(320, Math.min(width - 40, 800));
  const chartHeight = 260;
  const rects = useMemo(
    () => layoutBinary(items, 0, 0, chartWidth, chartHeight, true),
    [items, chartWidth, chartHeight],
  );

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text
        style={{ color: theme.text.secondary, fontSize: 12, marginBottom: 8 }}
      >
        HEATMAP
      </Text>
      {loading ? (
        <View style={{ height: chartHeight, justifyContent: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      ) : !rects.length ? (
        <View style={{ height: chartHeight, justifyContent: 'center' }}>
          <Text style={{ color: theme.text.secondary, textAlign: 'center' }}>
            No data yet
          </Text>
        </View>
      ) : (
        <Svg width={chartWidth} height={chartHeight}>
          {rects.map((r, idx) => {
            const bg = r.item.diff >= 0 ? '#009b10' : '#e33a3c';
            const fontSize = Math.min(
              14,
              Math.max(8, Math.min(r.w / 8, r.h / 8)),
            );
            if (r.w < 30 || r.h < 30) {
              return (
                <Rect
                  key={idx}
                  x={r.x + 2}
                  y={r.y + 2}
                  width={Math.max(0, r.w - 4)}
                  height={Math.max(0, r.h - 4)}
                  rx={10}
                  ry={10}
                  fill={bg}
                />
              );
            }
            return (
              <React.Fragment key={idx}>
                <Rect
                  x={r.x + 2}
                  y={r.y + 2}
                  width={Math.max(0, r.w - 4)}
                  height={Math.max(0, r.h - 4)}
                  rx={10}
                  ry={10}
                  fill={bg}
                />
                <SvgText
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2}
                  fill="#fff"
                  fontSize={fontSize}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {r.item.name}
                </SvgText>
                {r.w > 80 && r.h > 80 ? (
                  <SvgText
                    x={r.x + r.w / 2}
                    y={r.y + r.h / 2 + fontSize * 1.2}
                    fill="#fff"
                    fontSize={fontSize}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {`$${Number(r.item.price ?? 0).toFixed(4)}`}
                  </SvgText>
                ) : null}
                <SvgText
                  x={r.x + r.w / 2}
                  y={
                    r.y +
                    r.h / 2 +
                    fontSize * (r.w > 80 && r.h > 80 ? 2.4 : 1.2)
                  }
                  fill="#fff"
                  fontSize={fontSize}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {`${r.item.diff >= 0 ? '+' : ''}${r.item.diff.toFixed(2)}%`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      )}
      <TimeSelector
        defaultStep={interval}
        timeSteps={['1D', '1M', '1Y']}
        onTimeSelected={(step: TimeStep) => setInterval(step)}
      />
    </View>
  );
};

export default Heatmap;

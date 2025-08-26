import React from 'react';
import { View, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import PortfolioValueChart from './components/PortfolioValueChart';
import DailyPnLChart from './components/DailyPnLChart';
import ChartAllocation from './components/ChartAllocation';
import AssetAllocation from './components/AssetAllocation';
import DexAnalytics from './components/DexAnalytics';
import Heatmap from './components/Heatmap';

const Analytics = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshToken, setRefreshToken] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshToken(t => t + 1);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 32 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          <PortfolioValueChart refreshToken={refreshToken} />
          <DailyPnLChart refreshToken={refreshToken} />
          <ChartAllocation />
          <AssetAllocation />
          <DexAnalytics />
          <Heatmap />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Analytics;

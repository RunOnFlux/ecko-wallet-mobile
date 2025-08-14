import React from 'react';
import { View, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import Header from '../../components/Header';
import PortfolioValueChart from './components/PortfolioValueChart';
import DailyPnLChart from './components/DailyPnLChart';
import ChartAllocation from './components/ChartAllocation';
import AssetAllocation from './components/AssetAllocation';
import { useTrackingWatcher } from './hooks/useTrackingWatcher';
import DexAnalytics from './components/DexAnalytics';

const Analytics = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshToken, setRefreshToken] = React.useState(0);
  useTrackingWatcher();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshToken(t => t + 1);
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title={'Analytics'} />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Analytics;

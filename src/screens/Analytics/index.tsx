import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {View, Text, ActivityIndicator, SafeAreaView, Alert} from 'react-native';
import Header from '../../components/Header';
import PortfolioValueChart from './components/PortfolioValueChart';

const Analytics = () => {
  return (
    <SafeAreaView>
      <Header title={'Analytics'} />

      <View>
        <PortfolioValueChart />
      </View>
    </SafeAreaView>
  );
};

export default Analytics;

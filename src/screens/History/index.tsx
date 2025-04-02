import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, RefreshControl, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Header from './components/Header';
import ListDay from './components/ListDay';

import {createStyles} from './styles';
import {
  convertToListDay,
  makeSelectListDayActivities,
  makeSelectListDayPendingActivities,
  makeSelectPollLoading,
  makeSelectPollRequestParams,
} from '../../store/history/selectors';
import {getPollRequest} from '../../store/history/actions';
import {
  DextoolsTransaction,
  dextoolsTransactionToActivity,
  headerTabs,
  mergeUniqueTransactions,
} from './const';
import {useShallowEqualSelector} from '../../store/utils';
import {useSafeAreaValues} from '../../utils/deviceHelpers';
import {TListDayItem} from './components/ListDay/types';
import {NETWORK_IDS} from '../../utils/walletConnect';
import {makeSelectActiveNetworkDetails} from '../../store/networks/selectors';
import {makeSelectSelectedAccount} from '../../store/userWallet/selectors';
import {ECKO_DEXTOOLS_API_URL} from '../../api/constants';
import {TActivity} from '../../store/history/types';

const limit = 15;

const History = () => {
  const dispatch = useDispatch();

  const pollReqParams = useShallowEqualSelector(makeSelectPollRequestParams);
  const isPollingRequests = useShallowEqualSelector(makeSelectPollLoading);
  const selectedAccount = useSelector(makeSelectSelectedAccount);
  const networkDetail = useShallowEqualSelector(makeSelectActiveNetworkDetails);
  const listDayActivities: TListDayItem[] = useShallowEqualSelector(
    makeSelectListDayActivities,
  );
  const listDayPendingActivities = useShallowEqualSelector(
    makeSelectListDayPendingActivities,
  );

  const [activeTab, setActiveTab] = useState(headerTabs[0].value);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [transactions, setTransactions] =
    useState<TListDayItem[]>(listDayActivities);

  const isPendingTab = useMemo(() => activeTab === 'pending', [activeTab]);
  const isMainnet = NETWORK_IDS.mainnet === networkDetail?.instance;
  const account = selectedAccount?.accountName;

  const fetchTransactions = async () => {
    if (!isMainnet || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const apiUrl = `${ECKO_DEXTOOLS_API_URL}/api/account-transaction-history?account=${account}&limit=${limit}&skip=${skip}`;
      const res = await fetch(apiUrl);
      const newTransactions: DextoolsTransaction[] = await res.json();
      if (newTransactions.length < limit) {
        setHasMore(false);
      }
      const newActivities: TActivity[] = [];
      for (let i = 0; i < newTransactions.length; i += 1) {
        const transaction = newTransactions[i];
        const activity = dextoolsTransactionToActivity(transaction);

        if (activity) {
          newActivities.push(activity);
        }
      }
      const grouped = convertToListDay(newActivities);
      const merged = mergeUniqueTransactions(transactions, grouped);
      setTransactions(merged);
      setSkip(prev => prev + limit);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    pollReqParams && dispatch(getPollRequest(pollReqParams));
    if (isMainnet) {
      fetchTransactions();
    }
  }, [account, isMainnet]);

  const onRefresh = useCallback(() => {
    setSkip(0);
    setTransactions(listDayActivities);
    setHasMore(true);
    pollReqParams && dispatch(getPollRequest(pollReqParams));
    if (isMainnet) {
      fetchTransactions();
    }
  }, [pollReqParams, isMainnet]);

  useEffect(() => {
    setSkip(0);
    setTransactions([]);
    setHasMore(true);

    if (isMainnet && account) {
      fetchTransactions();
    }
  }, [account, isMainnet, activeTab]);

  const renderItem = useCallback(
    ({item}: {item: TListDayItem}) => <ListDay item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: TListDayItem) => {
    const dayPart = item.day || 'unknown-day';

    const listPart = (item.list || [])
      .map((subItem: any, index) => {
        const uniqueId =
          subItem._uniqueId ||
          `${subItem.txId || subItem.requestKey || 'tx'}-${
            subItem.createdTime || ''
          }-${index}`;
        return uniqueId;
      })
      .join('_');

    return `${dayPart}-${listPart}`;
  }, []);

  const {bottomSpace, statusBarHeight} = useSafeAreaValues();
  const styles = createStyles({bottomSpace, statusBarHeight});

  return (
    <View style={styles.container}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isPollingRequests}
            onRefresh={onRefresh}
          />
        }
        data={isPendingTab ? listDayPendingActivities : transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            {isPendingTab ? 'No pending activities' : 'No activities found'}
          </Text>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.contentWrapper}
        onEndReached={fetchTransactions}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default History;

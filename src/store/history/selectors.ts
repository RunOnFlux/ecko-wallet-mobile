import {createSelector} from '@reduxjs/toolkit';
import moment from 'moment';

import {RootState} from '../store';
import {TActivity, TPollRequestParams} from './types';
import {getNetworkParams} from '../../utils/networkHelpers';
import {TListItem} from '../../screens/History/components/ListItem/types';
import {TAccount} from '../userWallet/types';

export const convertToListDay = (activities: TActivity[]) => {
  const daysObj: Record<string, TListItem[]> = {};

  const byRequestKey: Record<string, TActivity[]> = {};

  activities.forEach(activity => {
    const date = moment(activity.createdTime);
    const day = date.format('MMMM D, YYYY');

    if (!(day in daysObj)) {
      daysObj[day] = [];
    }

    const siblings = byRequestKey[activity.requestKey] || [];

    const match = siblings.find(
      tx =>
        tx.sender === activity.receiver &&
        tx.receiver === activity.sender &&
        tx.type === 'SWAP' &&
        activity.type === 'SWAP',
    );

    let coinFrom, coinTo, amountFrom, amountTo;

    if (match) {
      const isOut = activity.metaData?.meta?.direction === 'OUT';

      const fromTx = isOut ? activity : match;
      const toTx = isOut ? match : activity;

      coinFrom = fromTx.coinShortName;
      coinTo = toTx.coinShortName;
      amountFrom = fromTx.amount;
      amountTo = toTx.amount;
    }

    if (!byRequestKey[activity.requestKey]) {
      byRequestKey[activity.requestKey] = [];
    }
    byRequestKey[activity.requestKey].push(activity);

    daysObj[day].push({
      title: activity.requestKey,
      time: date.format('yyyy-MM-DD HH:mm:ss'),
      coinFrom,
      coinTo,
      amountFrom,
      amountTo,
      ...activity,
    });
  });

  return Object.entries(daysObj).map(([day, list]) => ({
    day,
    list,
  }));
};

const getPendingActivities = (activities: TActivity[]) =>
  activities.filter(({status}) => status === 'pending');

const selectedState = (state: RootState) => state.history;

const selectedNetworkDetails = (state: RootState) =>
  state.networks.activeNetworkState.data;

export const makeSelectPollLoading = createSelector(selectedState, state => {
  const {pollReqState} = state;
  return !!pollReqState.fetching;
});

export const makeSelectPollRequestParams = createSelector(
  selectedState,
  selectedNetworkDetails,
  (state, network) => {
    if (!network) {
      return [];
    }

    const chainIdsObj: Record<string, TActivity[]> = {};

    state.activities.forEach(activity => {
      const {sourceChainId, targetChainId} = activity;
      if (!(targetChainId in chainIdsObj)) {
        chainIdsObj[targetChainId] = [];
      }
      chainIdsObj[targetChainId].push(activity);
      if (!(sourceChainId in chainIdsObj)) {
        chainIdsObj[sourceChainId] = [];
      }
      chainIdsObj[sourceChainId].push(activity);
    });

    const reqParamsList: TPollRequestParams[] = Object.entries(chainIdsObj).map(
      ([chainId, list]) => ({
        chainId,
        requestKeys: list.map(({requestKey}) => requestKey),
        instance: network.instance,
        version: network.version,
        ...getNetworkParams(network),
      }),
    );

    return reqParamsList;
  },
);

export const makeSelectListDayActivities = createSelector(
  selectedState,
  state => {
    return convertToListDay([...state.activities].reverse());
  },
);

export const makeSelectListDayPendingActivities = createSelector(
  selectedState,
  state => {
    const pendingActivities = getPendingActivities(
      [...state.activities].reverse(),
    );

    return convertToListDay(pendingActivities);
  },
);

export const makeSelectRecentReceivers = createSelector(selectedState, state =>
  (state.activities || [])
    .map(
      (activity: TActivity) =>
        ({
          chainId: activity.targetChainId,
          accountName: activity.receiver,
        } as TAccount),
    )
    .filter(
      (item, pos, self) =>
        !!item.accountName &&
        self.findIndex(subItem => subItem.accountName === item.accountName) ===
          pos,
    ),
);

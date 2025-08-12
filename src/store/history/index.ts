import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {THistoryState, TPollResp, TPollRespItem} from './types';
import {defaultRequestValues} from '../const';
import {fetchPollData} from './effects';
import moment from 'moment';

const initialState: THistoryState = {
  activities: [],
  pollReqState: defaultRequestValues,
};

const history = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setSendResult: (state, {payload}) => {
      const foundIndex = (state.activities || []).findIndex(
        item =>
          item.requestKey === payload.sourceRequestKey ||
          item.requestKey === payload.requestKey,
      );
      if (foundIndex > -1) {
        state.activities[foundIndex] = payload;
      } else {
        state.activities = (state.activities || []).concat([payload]);
      }
      state.activities = state.activities.filter(
        (item, pos, self) =>
          self.findIndex(subItem => subItem.requestKey === item.requestKey) ===
          pos,
      );
    },
    replaceSendResult: (state, {payload}) => {
      const foundIndex = (state.activities || []).findIndex(
        item =>
          item.requestKey === payload.sourceRequestKey ||
          item.requestKey === payload.requestKey,
      );
      if (foundIndex > -1) {
        state.activities[foundIndex] = payload;
      }
    },
    setListenResult: (state, {payload}) => {
      (state.activities || []).forEach(activity => {
        if (activity.requestKey === payload?.requestKey) {
          activity.status =
            payload?.result?.status === 'success' ||
            payload?.result?.error?.message?.includes(
              'resumePact: pact completed:',
            )
              ? 'success'
              : payload?.result?.status === 'failure'
                ? 'failure'
                : 'pending';
        }
      });
    },

    setInitialHistoryState: state => {
      state.pollReqState = initialState.pollReqState;
      state.activities = initialState.activities;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPollData.pending, state => {
        state.pollReqState.fetching = true;
        state.pollReqState.error = null;
      })
      .addCase(
        fetchPollData.fulfilled,
        (state, action: PayloadAction<TPollResp[]>) => {
          state.pollReqState.fetching = false;
          state.pollReqState.error = null;
          state.pollReqState.data = action.payload;

          const activitiesFromPoll: TPollRespItem[] = action.payload.reduce(
            (acc: TPollRespItem[], obj: TPollResp) => [
              ...acc,
              ...Object.values(obj),
            ],
            [],
          );

          const newActivitiesMap = new Map<string, TPollRespItem>();
          activitiesFromPoll.forEach(item =>
            newActivitiesMap.set(item.reqKey, item),
          );

          const updatedActivities = state.activities.map(existingActivity => {
            const updatedItem = newActivitiesMap.get(
              existingActivity.requestKey,
            );
            if (updatedItem) {
              return {
                ...existingActivity,
                status: updatedItem?.result?.error?.message?.includes(
                  'resumePact: pact completed:',
                )
                  ? 'success'
                  : updatedItem.result.status,
              };
            }
            return existingActivity;
          });

          activitiesFromPoll.forEach(pollItem => {
            if (
              !updatedActivities.some(a => a.requestKey === pollItem.reqKey)
            ) {
              updatedActivities.push(pollItem as any);
            }
          });

          state.activities = updatedActivities
            .filter(
              (item, pos, self) =>
                self.findIndex(
                  subItem => subItem.requestKey === item.requestKey,
                ) === pos,
            )
            .sort((a, b) => {
              const dateA = moment(a.createdTime);
              const dateB = moment(b.createdTime);
              return dateB.diff(dateA);
            });
        },
      )
      .addCase(fetchPollData.rejected, (state, action) => {
        state.pollReqState.fetching = false;
        state.pollReqState.error = action.payload;
        state.pollReqState.data = null;
      });
  },
});

export const {
  setSendResult,
  replaceSendResult,
  setListenResult,
  setInitialHistoryState,
} = history.actions;

export default history.reducer;

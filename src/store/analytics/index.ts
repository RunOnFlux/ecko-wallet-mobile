import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

export type AnalyticsState = {
  trackPortfolio: boolean;
};

const initialState: AnalyticsState = {
  trackPortfolio: false,
};

const analytics = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    startTrackPortfolio(state) {
      state.trackPortfolio = true;
    },
    stopTrackPortfolio(state) {
      state.trackPortfolio = false;
    },
  },
});

export const { startTrackPortfolio, stopTrackPortfolio } = analytics.actions;

export const makeSelectCanTrackPortfolio = (state: RootState) =>
  state.analytics.trackPortfolio;

export default analytics.reducer;

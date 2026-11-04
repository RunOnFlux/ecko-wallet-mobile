/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it, expect, jest, afterEach} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer, {act, ReactTestRenderer} from 'react-test-renderer';

// Providers schedule retry timers (e.g. SpireKey's initial-URL check) that would
// otherwise fire after Jest tears the environment down.
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

it('renders correctly', async () => {
  jest.useFakeTimers();
  let tree: ReactTestRenderer | undefined;
  // Flush mount effects inside act so rendering finishes before the test ends.
  await act(async () => {
    tree = renderer.create(<App />);
  });
  expect(tree?.toJSON()).toBeTruthy();
  await act(async () => {
    tree?.unmount();
  });
});

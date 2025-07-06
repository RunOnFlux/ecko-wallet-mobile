import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import TabBar from './components/TabBar';
import {HOME_TAB_SCREENS} from '../../routes';
import {EHomeTabRoutes} from '../../routes/types';
import {useTranslation} from 'react-i18next';

const Tab = createBottomTabNavigator();

const Home = () => {
  const {t} = useTranslation();
  return (
    <>
      <Tab.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={EHomeTabRoutes.Wallet}
        tabBar={props => <TabBar {...props} />}>
        {HOME_TAB_SCREENS.map(props => (
          <Tab.Screen
            {...props}
            key={props.name}
            options={{
              ...props.options,
              tabBarLabel: t(`tabs.${props.name}`),
            }}
          />
        ))}
      </Tab.Navigator>
    </>
  );
};

export default Home;

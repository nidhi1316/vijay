import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppStackParamList } from './navigationTypes';

// Screens
import MainAppScreen from '../screens/main/MainAppScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import ThreeDMapScreen from '../screens/map/ThreeDMapScreen';

const Stack = createStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainApp"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="MainApp" component={MainAppScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ThreeDMap" component={ThreeDMapScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

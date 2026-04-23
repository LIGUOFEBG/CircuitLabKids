/**
 * 儿童电路实验室 - 主应用入口
 * 类似NOBOOK的物理实验应用
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ExperimentScreen from './src/screens/ExperimentScreen';
import LearnScreen from './src/screens/LearnScreen';
import { CircuitProvider } from './src/core/circuit/context/CircuitContext';

// 定义导航参数类型
export type RootStackParamList = {
  Home: undefined;
  Experiment: { experimentId?: string };
  Learn: { topic?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <CircuitProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#4A90E2', // 儿童友好的蓝色
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
              },
              cardStyle: { backgroundColor: '#F5F7FA' }, // 浅灰色背景
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: '电路实验室' }}
            />
            <Stack.Screen
              name="Experiment"
              component={ExperimentScreen}
              options={{ title: '实验台' }}
            />
            <Stack.Screen
              name="Learn"
              component={LearnScreen}
              options={{ title: '知识学堂' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CircuitProvider>
    </SafeAreaProvider>
  );
}

export default App;

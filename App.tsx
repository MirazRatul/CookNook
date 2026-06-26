import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store } from './src/store/store';
import { CustomAlertProvider } from './src/context/CustomAlertContext';
import './src/i18n';
import './global.css';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <CustomAlertProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" />
            <RootNavigator />
          </NavigationContainer>
        </CustomAlertProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

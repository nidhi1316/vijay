import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './src/navigation/AuthNavigator';

// Inject Global Smooth Web Scrolling Styles
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.id = 'ideajam-global-scroll-style';
  style.textContent = `
    html, body, #root {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #08140D;
      overflow: hidden;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Allow native wheel scroll across all React Native web elements */
    * {
      touch-action: pan-y !important;
    }

    /* Sleek Army Commando Scrollbar */
    *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    *::-webkit-scrollbar-track {
      background: #08140D;
    }
    *::-webkit-scrollbar-thumb {
      background: #1D452A;
      border-radius: 4px;
      border: 1px solid #08140D;
    }
    *::-webkit-scrollbar-thumb:hover {
      background: #10B981;
    }
  `;
  if (!document.getElementById('ideajam-global-scroll-style')) {
    document.head.appendChild(style);
  }
}

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, height: '100%', width: '100%', backgroundColor: '#08140D' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
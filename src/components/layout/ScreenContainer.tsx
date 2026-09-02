import React, { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBg?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  statusBarStyle = 'dark-content',
  statusBarBg = colors.white,
  style,
  contentContainerStyle,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBg} />
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    backgroundColor: colors.slate[50],
  },
});

export default ScreenContainer;

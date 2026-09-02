import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';

interface LoadingProps {
  message?: string;
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Processing...', overlay = true }) => {
  return (
    <View style={overlay ? styles.overlay : styles.inline}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  inline: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default Loading;

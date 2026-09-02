import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface AppCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'dashed' | 'tactical';
  style?: ViewStyle;
}

export const AppCard: React.FC<AppCardProps> = ({ children, variant = 'default', style }) => {
  return <View style={[styles.card, styles[variant], style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  default: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dashed: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.slate[300],
    borderStyle: 'dashed',
    alignItems: 'center',
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tactical: {
    backgroundColor: colors.commando.surface,
    borderWidth: 1.5,
    borderColor: colors.commando.border,
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});

export default AppCard;

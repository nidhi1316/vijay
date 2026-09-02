import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

interface DownloadResultButtonProps {
  onPress: () => void;
  title?: string;
  variant?: 'primary' | 'tactical';
}

export const DownloadResultButton: React.FC<DownloadResultButtonProps> = ({
  onPress,
  title = '← Back to 2D Map Home',
  variant = 'tactical',
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant]]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: 520,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  tactical: {
    backgroundColor: '#275836',
    borderWidth: 1,
    borderColor: '#3E8554',
    elevation: 3,
  },
  primary: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  tacticalText: {
    color: colors.white,
  },
  primaryText: {
    color: colors.white,
  },
});

export default DownloadResultButton;

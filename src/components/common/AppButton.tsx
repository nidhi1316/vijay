import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'tactical' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondary: {
    backgroundColor: colors.slate[800],
  },
  danger: {
    backgroundColor: colors.danger,
  },
  tactical: {
    backgroundColor: colors.commando.surfaceLighter,
    borderWidth: 1,
    borderColor: colors.commando.accentGold,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  sm: {
    height: 38,
    paddingHorizontal: 14,
  },
  md: {
    height: 48,
    paddingHorizontal: 20,
  },
  lg: {
    height: 54,
    paddingHorizontal: 26,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: 15,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  dangerText: {
    color: colors.white,
  },
  tacticalText: {
    color: colors.commando.accentGold,
  },
  outlineText: {
    color: colors.primary,
  },
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 17,
  },
});

export default AppButton;

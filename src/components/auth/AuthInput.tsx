import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface AuthInputProps extends TextInputProps {
  label?: string;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  success?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  leftIconName,
  leftIcon,
  rightIcon,
  isPassword = false,
  error,
  containerStyle,
  success,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.container,
          { height: isSmallScreen ? 48 : 52 },
          isFocused && styles.containerFocused,
          !!error && styles.containerError,
          success && styles.containerSuccess,
        ]}
      >
        {leftIconName ? (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={leftIconName}
              size={19}
              color={isFocused ? colors.primary : colors.slate[400]}
            />
          </View>
        ) : leftIcon ? (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        ) : null}

        <TextInput
          style={[styles.input, { fontSize: isSmallScreen ? 14 : 15 }]}
          placeholderTextColor={colors.slate[500]}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={showPassword ? colors.primary : colors.slate[400]}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconButton}>{rightIcon}</View>
        ) : success ? (
          <View style={styles.rightIconButton}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[300],
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
  },
  containerFocused: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.06)',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  containerError: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  containerSuccess: {
    borderColor: colors.success,
  },
  leftIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.white,
    fontWeight: '400',
    paddingVertical: 0,
  },
  rightIconButton: {
    padding: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 4,
    gap: 4,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AuthInput;

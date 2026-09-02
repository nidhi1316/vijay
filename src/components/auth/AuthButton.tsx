import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'glow';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const isPrimary = variant === 'primary' || variant === 'glow';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { height: isSmallScreen ? 48 : 52 },
        isPrimary && styles.primaryButton,
        isSecondary && styles.secondaryButton,
        isOutline && styles.outlineButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              { fontSize: isSmallScreen ? 14 : 15.5 },
              isPrimary && styles.primaryText,
              isSecondary && styles.secondaryText,
              isOutline && styles.outlineText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#E2E8F0',
  },
  outlineText: {
    color: '#FF6B00',
  },
});

export default AuthButton;

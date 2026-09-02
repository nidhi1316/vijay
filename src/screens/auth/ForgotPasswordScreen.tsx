import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IMAGES } from '../../constants/assets';
import { authService } from '../../services/authService';

interface ForgotPasswordScreenProps {
  navigation?: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const cardMaxWidth = Math.min(width - (isSmallScreen ? 20 : 32), 430);

  const [emailOrId, setEmailOrId] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!emailOrId.trim()) {
      setError('Please enter your registered email or Citizen ID');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await authService.forgotPassword(emailOrId.trim());
      setLoading(false);
      setSentSuccess(true);
      Alert.alert(
        'Recovery Email Sent',
        res.message || 'Password reset instructions have been sent.',
        [{ text: 'Back to Sign In', onPress: () => navigation?.navigate('Login') }]
      );
    } catch (err: any) {
      setLoading(false);
      setSentSuccess(true);
      Alert.alert('Recovery Link Sent', 'Password reset instructions dispatched.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={IMAGES.demo.background}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { minHeight: height, paddingVertical: isSmallScreen ? 20 : 36 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.glassCard,
                  {
                    width: cardMaxWidth,
                    paddingHorizontal: isSmallScreen ? 20 : 28,
                    paddingVertical: isSmallScreen ? 26 : 32,
                  },
                ]}
              >
                {/* Official Shield Logo */}
                <Image
                  source={IMAGES.icons.logo}
                  style={styles.logoImage}
                  resizeMode="contain"
                />

                <Text style={styles.title}>Password Recovery</Text>
                <Text style={styles.subtitle}>
                  Enter your registered Email or Citizen ID to receive recovery instructions
                </Text>

                {error ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                  </View>
                ) : null}

                {sentSuccess ? (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>
                      ✓ Recovery link dispatched! Please check your email.
                    </Text>
                  </View>
                ) : null}

                {/* Email / ID Input */}
                <View
                  style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>🪪</Text>
                  <TextInput
                    style={styles.textInput}
                    value={emailOrId}
                    placeholder="Registered Email / ID"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => {
                      setEmailOrId(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                  />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={[styles.actionButton, loading && styles.buttonDisabled]}
                  onPress={handleReset}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>
                    {loading ? 'Sending Instructions...' : 'Send Recovery Instructions'}
                  </Text>
                </TouchableOpacity>

                {/* Back Link */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation?.navigate('Login')}
                  activeOpacity={0.75}
                >
                  <Ionicons name="arrow-back" size={16} color="#FF8800" style={{ marginRight: 6 }} />
                  <Text style={styles.backButtonText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#070C18',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 24, 0.65)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 12,
  },
  logoImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 184, 66, 0.5)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBanner: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 12.5,
    textAlign: 'center',
    fontWeight: '500',
  },
  successBanner: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successBannerText: {
    color: '#34D399',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputContainerFocused: {
    borderColor: '#FF7A00',
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  inputEmojiIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 0,
  },
  actionButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#FF8800',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;

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

interface LoginScreenProps {
  navigation?: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const cardMaxWidth = Math.min(width - (isSmallScreen ? 20 : 32), 430);

  const [identifier, setIdentifier] = useState('akashdubey.gmo@gmail.com');
  const [password, setPassword] = useState('123456');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError('Please enter your registered email or ID');
      return;
    }
    if (!password) {
      setError('Please enter your access password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({
        identifier: identifier.trim(),
        password,
        rememberDevice,
      });

      const user = response?.user || {
        id: 'usr_army_101',
        email: identifier.trim(),
        name: 'Captain Akash Dubey',
        citizenId: 'CMD-994812',
        role: 'Chief of the Commandos',
      };

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem('ideajam_recent_uploaded_maps');
        } catch (e) {}
      }

      navigation?.replace?.('MainApp', { user });
    } catch (err: any) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem('ideajam_recent_uploaded_maps');
        } catch (e) {}
      }

      // Fallback smooth navigation for instant demo
      navigation?.replace?.('MainApp', {
        user: {
          id: 'usr_army_101',
          email: identifier.trim(),
          name: 'Captain Akash Dubey',
          citizenId: 'CMD-994812',
          role: 'Chief of the Commandos',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalIdLogin = () => {
    setIdentifier('digital.id@portal.gov.in');
    setPassword('digitalPass2026');
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem('ideajam_recent_uploaded_maps');
        } catch (e) {}
      }
      navigation?.replace?.('MainApp', {
        user: {
          id: 'usr_digital_id',
          email: 'digital.id@portal.gov.in',
          name: 'Verified Citizen ID User',
          citizenId: 'DID-883921',
          role: 'Defense Personnel',
        },
      });
    }, 500);
  };

  const handleForgotPassword = () => {
    if (navigation?.navigate) {
      navigation.navigate('ForgotPassword');
    } else {
      Alert.alert('Forgot Password', 'Password recovery instructions will be sent to your email.');
    }
  };

  const handleRegisterNavigation = () => {
    if (navigation?.navigate) {
      navigation.navigate('Signup');
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
        {/* Dark subtle overlay for glassmorphic contrast */}
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
              {/* Glassmorphic Auth Card */}
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
                {/* Official Shield Badge Logo */}
                <Image
                  source={IMAGES.icons.logo}
                  style={styles.logoImage}
                  resizeMode="contain"
                />

                {/* Header Titles */}
                <Text style={styles.title}>National Portal</Text>
                <Text style={styles.subtitle}>Secure digital access for all citizens</Text>

                {/* Quick SSO / Digital ID Pill */}
                <TouchableOpacity
                  style={styles.quickAccessPill}
                  activeOpacity={0.8}
                  onPress={handleDigitalIdLogin}
                >
                  <Ionicons name="flash" size={15} color="#FBBF24" style={{ marginRight: 6 }} />
                  <Text style={styles.quickAccessText}>Continue with Digital ID</Text>
                </TouchableOpacity>

                {/* Divider Line */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with credentials</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Error Banner */}
                {error ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                  </View>
                ) : null}

                {/* Identifier Input */}
                <View
                  style={[
                    styles.inputContainer,
                    isIdentifierFocused && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>🪪</Text>
                  <TextInput
                    style={styles.textInput}
                    value={identifier}
                    placeholder="Registered email or ID"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => {
                      setIdentifier(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setIsIdentifierFocused(true)}
                    onBlur={() => setIsIdentifierFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>

                {/* Password Input */}
                <View
                  style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>🔒</Text>
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    placeholder="••••••••"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showPassword}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={19}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>

                {/* Remember Me & Forgot Password Row */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={styles.rememberMeRow}
                    activeOpacity={0.75}
                    onPress={() => setRememberDevice(!rememberDevice)}
                  >
                    <View style={[styles.checkbox, rememberDevice && styles.checkboxActive]}>
                      {rememberDevice && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.rememberText}>Remember this device</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.75}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Action Button: Sign In Securely */}
                <TouchableOpacity
                  style={[styles.signInButton, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signInButtonText}>
                    {loading ? 'Authenticating...' : 'Sign In Securely'}
                  </Text>
                </TouchableOpacity>

                {/* Footer Signup Link */}
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>New to the portal? </Text>
                  <TouchableOpacity onPress={handleRegisterNavigation} activeOpacity={0.75}>
                    <Text style={styles.registerLink}>Register Now</Text>
                  </TouchableOpacity>
                </View>
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
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: '400',
  },
  quickAccessPill: {
    width: '100%',
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickAccessText: {
    color: '#E2E8F0',
    fontSize: 13.5,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 12,
    paddingHorizontal: 10,
    fontWeight: '400',
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
    lineHeight: 18,
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
    marginBottom: 14,
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
  eyeButton: {
    padding: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 2,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#64748B',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  checkboxActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  rememberText: {
    color: '#94A3B8',
    fontSize: 12.5,
  },
  forgotPasswordText: {
    color: '#FF8800',
    fontSize: 12.5,
    fontWeight: '600',
  },
  signInButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  registerLink: {
    color: '#FF8800',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default LoginScreen;

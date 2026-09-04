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

interface SignupScreenProps {
  navigation?: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 360;

  const cardMaxWidth = Math.min(width - (isSmallScreen ? 20 : 32), 430);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid registered email');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      setError('Please accept the Security Guidelines');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setError(null);
    setLoading(true);

    try {
      const response = await authService.signup({
        fullName: fullName.trim(),
        email: email.trim(),
        citizenId: citizenId.trim() || 'CMD-' + Math.floor(100000 + Math.random() * 900000),
        password,
      });

      const user = response?.user || {
        id: 'usr_army_new',
        email: email.trim(),
        name: fullName.trim(),
        citizenId: citizenId.trim() || 'CMD-994812',
        role: 'Defense Personnel',
      };

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem('ideajam_recent_uploaded_maps');
        } catch (e) {}
      }

      Alert.alert('Registration Successful', 'Your National Portal profile is ready.', [
        {
          text: 'Continue to Portal',
          onPress: () => navigation?.replace?.('MainApp', { user }),
        },
      ]);
    } catch (err: any) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem('ideajam_recent_uploaded_maps');
        } catch (e) {}
      }

      // Fallback in demo mode
      navigation?.replace?.('MainApp', {
        user: {
          id: 'usr_army_new',
          email: email.trim(),
          name: fullName.trim(),
          citizenId: citizenId.trim() || 'CMD-994812',
          role: 'Defense Personnel',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    if (navigation?.navigate) {
      navigation.navigate('Login');
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

                {/* Header Titles */}
                <Text style={styles.title}>Register Account</Text>
                <Text style={styles.subtitle}>Create your National Portal citizen profile</Text>

                {/* Error Banner */}
                {error ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                  </View>
                ) : null}

                {/* Full Name */}
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'fullName' && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>👤</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fullName}
                    placeholder="Full Name"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => {
                      setFullName(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email Address */}
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'email' && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>✉️</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    placeholder="Registered Email"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {/* Citizen / Service ID */}
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'citizenId' && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>🪪</Text>
                  <TextInput
                    style={styles.textInput}
                    value={citizenId}
                    placeholder="Citizen / Service ID (Optional)"
                    placeholderTextColor="#64748B"
                    onChangeText={(text) => {
                      setCitizenId(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocusedField('citizenId')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Password */}
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'password' && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>🔒</Text>
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    placeholder="Create Password"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showPassword}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={19}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'confirmPassword' && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputEmojiIcon}>🛡️</Text>
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showConfirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={19}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>

                {/* Terms Agreement */}
                <TouchableOpacity
                  style={styles.termsRow}
                  activeOpacity={0.75}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                    {agreeTerms && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.termsText}>
                    I accept National Portal <Text style={styles.termsHighlight}>Security Guidelines</Text>
                  </Text>
                </TouchableOpacity>

                {/* Primary Button: Create Secure Account */}
                <TouchableOpacity
                  style={[styles.signUpButton, loading && styles.buttonDisabled]}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signUpButtonText}>
                    {loading ? 'Creating Profile...' : 'Create Secure Account'}
                  </Text>
                </TouchableOpacity>

                {/* Footer Login Link */}
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Already registered? </Text>
                  <TouchableOpacity onPress={handleLoginNavigation} activeOpacity={0.75}>
                    <Text style={styles.loginLink}>Sign In</Text>
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
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
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
    fontSize: 17,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '400',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
    marginTop: 2,
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
  termsText: {
    color: '#94A3B8',
    fontSize: 12.5,
  },
  termsHighlight: {
    color: '#FF8800',
    fontWeight: '600',
  },
  signUpButton: {
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
  signUpButtonText: {
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
  loginLink: {
    color: '#FF8800',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default SignupScreen;

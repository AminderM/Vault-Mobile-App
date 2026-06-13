import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, TYPOGRAPHY, SPACING, createThemedStyleSheet, useTheme } from '../lib/theme';
import { login } from '../lib/api';

export default function LoginScreen({ onLoginSuccess, onSwitchToSignup, onBack }) {
  const { t: T } = useTheme();
  const styles = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (onLoginSuccess) {
        onLoginSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Decorative top accent */}
      <View style={styles.topAccent} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          {onBack && (
            <Pressable
              style={styles.backBtn}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backBtnText}>← BACK</Text>
            </Pressable>
          )}

          {/* Header */}
          <View style={styles.headerSection}>
            <Image
              alt="Integra Vault Emblem"
              style={styles.logo}
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHO7TcQSU_Ob3z0EiELw_n9eSB9PnbnzKcIFqplzG2Qm-17cQ9IKTfhPzUSaqn7kmiFlRbuH9VTZs9qurt-2iC1zNMJPP6V-wcvlpFv92QdwIYWtTht9A72-z_SOah4l2uj7U_l2uNBlV6LlDJ93bT7XFrwvQoFC0geSm8XZIbgrfAlzCjalqAPONJ44By4pJ8VG6x8sZ8CU8qck6PK0Uy2GYjZj7imiOWWtAzWBqX9SRU0YryAqzQtnGl-3jaKkQUv-K1XrL0-2Sq',
              }}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.formCard}>
            {/* Error message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setError('');
                }}
                placeholder="driver@example.com"
                placeholderTextColor={T.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setError('');
                  }}
                  placeholder="Enter password"
                  placeholderTextColor={T.text.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!isLoading}
                />
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <Pressable style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.loginBtn,
                pressed && styles.pressed,
                isLoading && styles.loginBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>SIGN IN ➔</Text>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up CTA */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account?</Text>
            <Pressable
              onPress={onSwitchToSignup}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.signupLink}> SIGN UP</Text>
            </Pressable>
          </View>

          {/* Compliance Footer */}
          <View style={styles.complianceRow}>
            <Text style={styles.complianceIcon}>🔒</Text>
            <Text style={styles.complianceText}>SECURED CONNECTION</Text>
            <View style={styles.dot} />
            <Text style={styles.complianceIcon}>⚡</Text>
            <Text style={styles.complianceText}>FAST ACCESS</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    topAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: BRAND.crimsonRed,
      shadowColor: BRAND.crimsonRed,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 8,
      zIndex: 100,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: SPACING.marginMobile,
      paddingTop: SPACING.stackMd,
      paddingBottom: SPACING.stackLg,
      justifyContent: 'center',
    },
    backBtn: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 4,
      marginBottom: 8,
    },
    backBtnText: {
      ...TYPOGRAPHY.labelData,
      color: T.text.muted,
      fontWeight: '600',
      letterSpacing: 1,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 120,
      height: 80,
      marginBottom: 20,
    },
    welcomeText: {
      ...TYPOGRAPHY.headlineLg,
      color: T.text.primary,
      fontWeight: '900',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    subtitleText: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.muted,
      marginTop: 4,
    },
    formCard: {
      backgroundColor: T.background.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: T.border.muted,
      padding: 24,
      gap: 18,
      ...(Platform.OS === 'web'
        ? { 
            backdropFilter: 'blur(20px) saturate(180%)', 
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: T.background.base === '#0d0404'
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.05)'
          }
        : {}),
    },
    errorBox: {
      backgroundColor: 'rgba(186, 26, 26, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(186, 26, 26, 0.3)',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    errorText: {
      ...TYPOGRAPHY.bodyMd,
      color: T.status.error,
      fontWeight: '500',
    },
    inputGroup: {
      gap: 6,
    },
    inputLabel: {
      ...TYPOGRAPHY.labelData,
      color: T.text.secondary,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    textInput: {
      height: 48,
      backgroundColor: T.background.container,
      borderWidth: 1,
      borderColor: T.border.variant,
      borderRadius: 8,
      paddingHorizontal: 14,
      color: T.text.primary,
      ...TYPOGRAPHY.bodyLg,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: T.background.container,
      borderWidth: 1,
      borderColor: T.border.variant,
      borderRadius: 8,
      overflow: 'hidden',
    },
    passwordInput: {
      flex: 1,
      height: 48,
      paddingHorizontal: 14,
      color: T.text.primary,
      ...TYPOGRAPHY.bodyLg,
    },
    eyeBtn: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyeIcon: {
      fontSize: 18,
    },
    forgotBtn: {
      alignSelf: 'flex-end',
      paddingVertical: 2,
    },
    forgotText: {
      ...TYPOGRAPHY.labelData,
      color: BRAND.crimsonRed,
      fontWeight: '600',
    },
    loginBtn: {
      height: 52,
      backgroundColor: BRAND.crimsonRed,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    loginBtnDisabled: {
      opacity: 0.6,
    },
    loginBtnText: {
      ...TYPOGRAPHY.headlineSm,
      color: '#ffffff',
      fontWeight: '700',
      letterSpacing: 2,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
      paddingHorizontal: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: T.border.variant,
    },
    dividerText: {
      ...TYPOGRAPHY.labelData,
      color: T.text.muted,
      fontWeight: '600',
      letterSpacing: 2,
      marginHorizontal: 16,
    },
    signupRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signupPrompt: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.muted,
    },
    signupLink: {
      ...TYPOGRAPHY.bodyMd,
      color: BRAND.crimsonRed,
      fontWeight: '700',
      letterSpacing: 1,
    },
    complianceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 32,
      opacity: 0.5,
    },
    complianceIcon: {
      fontSize: 11,
    },
    complianceText: {
      ...TYPOGRAPHY.labelData,
      fontSize: 9,
      color: T.text.muted,
      letterSpacing: 1,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: T.border.variant,
      marginHorizontal: 4,
    },
  })
);

import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, TYPOGRAPHY, SPACING, createThemedStyleSheet, useTheme } from '../lib/theme';
import { verifyOTP, sendOTP } from '../lib/twilio';

export default function PhoneVerificationScreen({
  sessionId: initialSessionId,
  phoneNumber,
  firstName = '',
  lastName = '',
  email = '',
  onVerificationSuccess,
  onBack,
}) {
  const { t: T, themeMode } = useTheme();
  const styles = useStyles();
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    // Focus the input automatically on mount
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 150);
    }
  }, []);

  const handleVerify = async (code = otp) => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await verifyOTP(sessionId, code, firstName, lastName, email);
      if (onVerificationSuccess) {
        onVerificationSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setError('');
    setResending(true);

    try {
      const result = await sendOTP(phoneNumber);
      setSessionId(result.sessionId);
      setCountdown(60);
      setOtp('');
      Alert.alert('Success', 'Verification code resent!');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleTextChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setOtp(cleaned);
    setError('');

    // Auto-submit when exactly 6 digits are entered
    if (cleaned.length === 6) {
      handleVerify(cleaned);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
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
          {onBack && (
            <Pressable
              style={styles.backBtn}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back to phone sign-in"
              disabled={isLoading}
            >
              <Text style={styles.backBtnText}>← CHANGE PHONE</Text>
            </Pressable>
          )}

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>VERIFICATION</Text>
            <Text style={styles.subtitleText}>
              We sent a 6-digit code to
            </Text>
            <Text style={styles.phoneText}>
              {phoneNumber}
            </Text>
          </View>

          {/* Code Entry Card */}
          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>6-DIGIT VERIFICATION CODE</Text>
              <TextInput
                ref={inputRef}
                style={styles.otpInput}
                value={otp}
                onChangeText={handleTextChange}
                placeholder="000000"
                placeholderTextColor={T.text.muted}
                keyboardType="number-pad"
                maxLength={6}
                autoCorrect={false}
                autoComplete="sms-otp"
                editable={!isLoading}
                textContentType="oneTimeCode"
              />
            </View>

            {/* Custom display of digits */}
            <View style={styles.digitsRow}>
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = otp[index] || '';
                const isFocused = otp.length === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.digitBox,
                      isFocused && styles.digitBoxFocused,
                      char !== '' && styles.digitBoxFilled,
                    ]}
                  >
                    <Text style={styles.digitText}>{char}</Text>
                  </View>
                );
              })}
            </View>

            {/* Verify Button */}
            <Pressable
              style={({ pressed }) => [
                styles.verifyBtn,
                pressed && styles.pressed,
                (isLoading || otp.length !== 6) && styles.verifyBtnDisabled,
              ]}
              onPress={() => handleVerify()}
              disabled={isLoading || otp.length !== 6}
              accessibilityRole="button"
              accessibilityLabel="Verify code"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.verifyBtnText}>VERIFY & CONTINUE ➔</Text>
              )}
            </Pressable>

            <Text style={{ fontSize: 11, color: BRAND.crimsonRed, marginTop: 12, marginBottom: 4, fontWeight: '600', textAlign: 'center' }}>
              💡 Staging Bypass Code: 123456
            </Text>

            {/* Resend Link */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>{"Didn't receive the code?"}</Text>
              <Pressable
                onPress={handleResend}
                disabled={countdown > 0 || resending}
              >
                <Text
                  style={[
                    styles.resendLink,
                    countdown > 0 && styles.resendLinkDisabled,
                  ]}
                >
                  {resending
                    ? 'Resending...'
                    : countdown > 0
                    ? `Resend Code (${countdown}s)`
                    : 'Resend SMS'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Compliance Footer */}
          <View style={styles.complianceRow}>
            <Text style={styles.complianceIcon}>🔒</Text>
            <Text style={styles.complianceText}>SECURE OTP VERIFICATION</Text>
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
      marginBottom: 16,
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
    titleText: {
      ...TYPOGRAPHY.headlineLg,
      color: T.text.primary,
      fontWeight: '900',
      letterSpacing: 2,
    },
    subtitleText: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.muted,
      marginTop: 4,
    },
    phoneText: {
      ...TYPOGRAPHY.bodyLg,
      color: BRAND.crimsonRed,
      fontWeight: '700',
      marginTop: 2,
      letterSpacing: 0.5,
    },
    formCard: {
      backgroundColor: T.background.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: T.border.muted,
      padding: 24,
      gap: 20,
      ...(Platform.OS === 'web'
        ? {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: T.background.base === '#0d0404'
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
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
      textAlign: 'center',
    },
    otpInput: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0,
      zIndex: 2,
    },
    digitsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
      paddingHorizontal: 4,
    },
    digitBox: {
      width: 36,
      height: 48,
      backgroundColor: T.background.container,
      borderWidth: 1.5,
      borderColor: T.border.variant,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    digitBoxFocused: {
      borderColor: BRAND.crimsonRed,
      borderWidth: 2,
    },
    digitBoxFilled: {
      borderColor: T.primary,
    },
    digitText: {
      ...TYPOGRAPHY.headlineSm,
      color: T.text.primary,
      fontWeight: '700',
    },
    verifyBtn: {
      height: 52,
      backgroundColor: BRAND.crimsonRed,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    verifyBtnDisabled: {
      opacity: 0.6,
    },
    verifyBtnText: {
      ...TYPOGRAPHY.headlineSm,
      color: '#ffffff',
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    resendContainer: {
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    },
    resendLabel: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.muted,
    },
    resendLink: {
      ...TYPOGRAPHY.bodyMd,
      color: BRAND.crimsonRed,
      fontWeight: '700',
    },
    resendLinkDisabled: {
      color: T.text.muted,
      fontWeight: '500',
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
  })
);

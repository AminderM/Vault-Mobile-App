import React, { useState, useEffect } from 'react';
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
import { validateInvite, signup } from '../lib/api';
import { validatePhoneNumber, formatPhoneNumber } from '../lib/twilio';

export default function OnboardingInviteScreen({ token, onSignupSuccess, onBack }) {
  const { t: T } = useTheme();
  const styles = useStyles();
  
  // Onboarding validation state
  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [validationError, setValidationError] = useState('');
  
  // Registration form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Validate the invitation token on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInviteDetails = async () => {
      if (!token) {
        setValidationError('Missing invitation token.');
        setIsValidating(false);
        return;
      }
      try {
        const data = await validateInvite(token);
        if (isMounted) {
          setInviteData(data);
          setFullName(data.full_name || '');
          setValidationError('');
        }
      } catch (err) {
        if (isMounted) {
          setValidationError(err.message || 'This invitation is invalid or has expired.');
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    };
    fetchInviteDetails();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSignup = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!validatePhoneNumber(phone)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      const result = await signup(token, formattedPhone, password);
      if (onSignupSuccess) {
        onSignupSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Setup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topAccent} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={BRAND.crimsonRed} />
          <Text style={[styles.loadingText, { color: T.text.secondary }]}>Validating Invitation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (validationError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topAccent} />
        <View style={styles.centerContainer}>
          <Text style={styles.warningIcon}>🚨</Text>
          <Text style={[styles.errorTitle, { color: T.text.primary }]}>Invitation Invalid</Text>
          <Text style={[styles.errorSubtitle, { color: T.text.secondary }]}>{validationError}</Text>
          
          <Pressable style={styles.backButtonLarge} onPress={onBack}>
            <Text style={styles.backButtonLargeText}>BACK TO HOME</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Back button */}
          {onBack && (
            <Pressable
              style={styles.backBtn}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              disabled={isSubmitting}
            >
              <Text style={styles.backBtnText}>← CANCEL</Text>
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
            <Text style={styles.welcomeText}>JOIN {inviteData?.company_name || 'YOUR FLEET'}</Text>
            <Text style={styles.subtitleText}>Complete your driver account setup</Text>
          </View>

          {/* Onboarding Form Card */}
          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            {/* Email Field (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.textInput, styles.readOnlyInput, { color: T.text.secondary }]}
                value={inviteData?.driver_email || inviteData?.email || ''}
                editable={false}
                selectTextOnFocus={false}
              />
              <Text style={styles.helperText}>Provided by your fleet administrator</Text>
            </View>

            {/* Full Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  setError('');
                }}
                placeholder="John Doe"
                placeholderTextColor={T.text.muted}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isSubmitting}
              />
            </View>

            {/* Phone Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  setError('');
                }}
                placeholder="(555) 123-4567"
                placeholderTextColor={T.text.muted}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!isSubmitting}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CHOOSE PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setError('');
                  }}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor={T.text.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!isSubmitting}
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

            {/* Required Documents Info */}
            {inviteData?.required_documents && inviteData.required_documents.length > 0 && (
              <View style={styles.docSection}>
                <Text style={styles.docSectionTitle}>📂 ONBOARDING DOCUMENTS TO SUBMIT LATER</Text>
                <View style={styles.docList}>
                  {inviteData.required_documents.map((doc, idx) => (
                    <View key={idx} style={styles.docItem}>
                      <Text style={{ color: BRAND.crimsonRed, marginRight: 6 }}>•</Text>
                      <Text style={[styles.docItemText, { color: T.text.secondary }]}>{doc}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.docHelperText}>You will upload these files to your Doc Vault after registration.</Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.pressed,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleSignup}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Activate Account"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>ACTIVATE ACCOUNT ➔</Text>
              )}
            </Pressable>
          </View>

          {/* Compliance Footer */}
          <View style={styles.complianceRow}>
            <Text style={styles.complianceIcon}>🔒</Text>
            <Text style={styles.complianceText}>SECURED ONBOARDING</Text>
            <View style={styles.dot} />
            <Text style={styles.complianceIcon}>⚡</Text>
            <Text style={styles.complianceText}>INSTANT ACTIVATION</Text>
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
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.marginMobile,
    },
    loadingText: {
      ...TYPOGRAPHY.bodyMd,
      marginTop: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    warningIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    errorTitle: {
      ...TYPOGRAPHY.headlineLg,
      fontWeight: '800',
      marginBottom: 8,
      textAlign: 'center',
    },
    errorSubtitle: {
      ...TYPOGRAPHY.bodyMd,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 20,
    },
    backButtonLarge: {
      height: 52,
      backgroundColor: BRAND.crimsonRed,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    backButtonLargeText: {
      ...TYPOGRAPHY.headlineSm,
      color: '#ffffff',
      fontWeight: '700',
      letterSpacing: 2,
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
      marginBottom: 24,
    },
    logo: {
      width: 100,
      height: 70,
      marginBottom: 16,
    },
    welcomeText: {
      ...TYPOGRAPHY.headlineLg,
      color: T.text.primary,
      fontWeight: '900',
      letterSpacing: 2,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    subtitleText: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.muted,
      marginTop: 4,
      textAlign: 'center',
    },
    formCard: {
      backgroundColor: T.background.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: T.border.muted,
      padding: 24,
      gap: 16,
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
      gap: 4,
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
    readOnlyInput: {
      backgroundColor: T.background.base,
      borderColor: T.border.muted,
      opacity: 0.7,
    },
    helperText: {
      fontSize: 10,
      color: T.text.muted,
      marginTop: 2,
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
    docSection: {
      marginTop: 8,
      padding: 12,
      backgroundColor: T.background.base + '50',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: T.border.variant,
    },
    docSectionTitle: {
      fontSize: 10,
      fontWeight: '800',
      color: T.text.primary,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    docList: {
      gap: 6,
      marginBottom: 8,
    },
    docItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    docItemText: {
      fontSize: 12,
      fontWeight: '500',
    },
    docHelperText: {
      fontSize: 9,
      color: T.text.muted,
      fontStyle: 'italic',
    },
    submitBtn: {
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
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitBtnText: {
      ...TYPOGRAPHY.headlineSm,
      color: '#ffffff',
      fontWeight: '700',
      letterSpacing: 2,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    complianceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 24,
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

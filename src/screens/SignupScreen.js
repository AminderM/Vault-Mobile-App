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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { BRAND, TYPOGRAPHY, SPACING, createThemedStyleSheet, useTheme } from '../lib/theme';
import { signupOpen } from '../lib/api';
import { sendOTP, validatePhoneNumber, formatPhoneNumber } from '../lib/twilio';
import { pickFile } from '../lib/filePicker';

export default function SignupScreen({ onSignupSuccess, onBack }) {
  const { t: T, themeMode } = useTheme();
  const styles = useStyles();

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Navigation & state
  const [userType, setUserType] = useState('carrier'); // 'carrier' or 'owner_operator'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Carrier compliance
  const [mcDotNumber, setMcDotNumber] = useState('');
  const [nscNumber, setNscNumber] = useState('');
  const [coiFile, setCoiFile] = useState(null);

  // Owner operator compliance
  const [vinNumber, setVinNumber] = useState('');
  const [cvsaNumber, setCvsaNumber] = useState('');
  const [cvorNumber, setCvorNumber] = useState('');
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [cvsaFile, setCvsaFile] = useState(null);
  const [cvorFile, setCvorFile] = useState(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP Verification overlay state
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // File Picker Helpers
  const handleSelectFile = async (type) => {
    try {
      const file = await pickFile({ allowedTypes: ['application/pdf', 'image/*'] });
      if (!file) return;

      const fileInfo = {
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType || 'application/octet-stream',
      };

      if (type === 'coi') setCoiFile(fileInfo);
      else if (type === 'insurance') setInsuranceFile(fileInfo);
      else if (type === 'cvsa') setCvsaFile(fileInfo);
      else if (type === 'cvor') setCvorFile(fileInfo);
    } catch (err) {
      showAlert('Error picking file', err.message);
    }
  };

  const toBase64 = async (uri) => {
    try {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (e) {
      console.warn("Failed to convert file to base64:", e);
      return null;
    }
  };

  const handleSignupSubmit = async () => {
    // Basic validations
    if (!fullName.trim()) return setError('Full Name is required');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address');
    if (!validatePhoneNumber(phone)) return setError('Please enter a valid phone number');
    if (!password || password.length < 8) return setError('Password must be at least 8 characters');

    if (userType === 'carrier') {
      if (!companyName.trim()) return setError('Company Name is required');
      if (!mcDotNumber.trim() && !nscNumber.trim()) {
        return setError('Please provide MC/DOT number or National Safety Code (NSC)');
      }
      if (!coiFile) return setError('Certificate of Insurance (COI) is required');
    } else {
      // Owner operator
      if (!vinNumber.trim()) return setError('VIN Number is required');
      if (!insuranceFile) return setError('Insurance Certificate is required');
      if (!cvsaFile) return setError('CVSA Document is required');
      if (!cvorFile) return setError('CVOR Document is required');
    }

    setError('');
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      // Trigger Twilio SMS OTP first
      const result = await sendOTP(formattedPhone);
      setOtpSessionId(result.sessionId);
      setShowOtpOverlay(true);
    } catch (err) {
      setError(err.message || 'Failed to send verification SMS.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      showAlert('Validation', 'Please enter a 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      const payload = {
        user_type: userType,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: formattedPhone,
        password: password,
        company_name: userType === 'carrier' ? companyName.trim() : (companyName.trim() || fullName.trim()),
        otp: otpCode,
      };

      // Attach compliance fields
      if (userType === 'carrier') {
        if (mcDotNumber) payload.mc_dot_number = mcDotNumber.trim();
        if (nscNumber) payload.nsc_number = nscNumber.trim();
        payload.coi_file_data = await toBase64(coiFile.uri);
        payload.coi_file_name = coiFile.name;
      } else {
        payload.vin_number = vinNumber.trim();
        if (cvsaNumber) payload.cvsa_number = cvsaNumber.trim();
        if (cvorNumber) payload.cvor_number = cvorNumber.trim();
        
        payload.insurance_file_data = await toBase64(insuranceFile.uri);
        payload.insurance_file_name = insuranceFile.name;

        payload.cvsa_file_data = await toBase64(cvsaFile.uri);
        payload.cvsa_file_name = cvsaFile.name;

        payload.cvor_file_data = await toBase64(cvorFile.uri);
        payload.cvor_file_name = cvorFile.name;
      }

      const result = await signupOpen(payload);
      setShowOtpOverlay(false);
      if (onSignupSuccess) {
        onSignupSuccess(result);
      }
    } catch (err) {
      showAlert('Signup Failed', err.message || 'Failed to register account. Please check the code and try again.');
    } finally {
      setIsVerifying(false);
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
          {/* Back button */}
          <Pressable style={styles.backBtn} onPress={onBack} disabled={isLoading}>
            <Text style={styles.backBtnText}>← BACK TO LOGIN</Text>
          </Pressable>

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
            <Text style={styles.welcomeText}>CREATE ACCOUNT</Text>
            <Text style={styles.subtitleText}>Join the Vault compliance network</Text>
          </View>

          {/* Signup Form Card */}
          <View style={styles.formCard}>
            {/* Account Type Tabs */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, userType === 'carrier' && styles.activeTab]}
                onPress={() => { setUserType('carrier'); setError(''); }}
              >
                <Text style={[styles.tabText, userType === 'carrier' && styles.activeTabText]}>CARRIER</Text>
              </Pressable>
              <Pressable
                style={[styles.tab, userType === 'owner_operator' && styles.activeTab]}
                onPress={() => { setUserType('owner_operator'); setError(''); }}
              >
                <Text style={[styles.tabText, userType === 'owner_operator' && styles.activeTabText]}>OWNER OP</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            {/* Profile Info */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={(val) => { setFullName(val); setError(''); }}
                placeholder="John Doe"
                placeholderTextColor={T.text.muted}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={(val) => { setEmail(val); setError(''); }}
                placeholder="carrier@example.com"
                placeholderTextColor={T.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER (FOR SMS OTP)</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={(val) => { setPhone(val); setError(''); }}
                placeholder="(555) 123-4567"
                placeholderTextColor={T.text.muted}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD (MIN 8 CHARS)</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={(val) => { setPassword(val); setError(''); }}
                placeholder="Choose password"
                placeholderTextColor={T.text.muted}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>COMPANY NAME {userType === 'owner_operator' && '(OPTIONAL)'}</Text>
              <TextInput
                style={styles.textInput}
                value={companyName}
                onChangeText={(val) => { setCompanyName(val); setError(''); }}
                placeholder="Fleet Logistics Inc"
                placeholderTextColor={T.text.muted}
                editable={!isLoading}
              />
            </View>

            {/* Carrier Specific Compliance */}
            {userType === 'carrier' ? (
              <View style={styles.complianceSection}>
                <Text style={styles.sectionTitle}>CARRIER COMPLIANCE DETAILS</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>MC / DOT NUMBER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={mcDotNumber}
                    onChangeText={(val) => { setMcDotNumber(val); setError(''); }}
                    placeholder="DOT-1234567"
                    placeholderTextColor={T.text.muted}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NATIONAL SAFETY CODE (NSC) - CANADIAN ONLY</Text>
                  <TextInput
                    style={styles.textInput}
                    value={nscNumber}
                    onChangeText={(val) => { setNscNumber(val); setError(''); }}
                    placeholder="NSC-CA-987654"
                    placeholderTextColor={T.text.muted}
                    editable={!isLoading}
                  />
                </View>

                {/* COI Upload */}
                <View style={styles.filePickerGroup}>
                  <Text style={styles.inputLabel}>CERTIFICATE OF INSURANCE (COI)</Text>
                  <Pressable style={styles.fileButton} onPress={() => handleSelectFile('coi')}>
                    <Text style={styles.fileButtonText}>
                      {coiFile ? `📄 ${coiFile.name}` : '📁 SELECT COI PDF/IMAGE'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* Owner Operator Specific Compliance */
              <View style={styles.complianceSection}>
                <Text style={styles.sectionTitle}>OWNER OPERATOR DETAILS</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>VIN NUMBER</Text>
                  <TextInput
                    style={styles.textInput}
                    value={vinNumber}
                    onChangeText={(val) => { setVinNumber(val); setError(''); }}
                    placeholder="17-Digit Vehicle ID"
                    placeholderTextColor={T.text.muted}
                    autoCapitalize="characters"
                    maxLength={17}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CVSA NUMBER (OPTIONAL)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={cvsaNumber}
                    onChangeText={(val) => { setCvsaNumber(val); setError(''); }}
                    placeholder="CVSA-45678"
                    placeholderTextColor={T.text.muted}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CVOR NUMBER (OPTIONAL)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={cvorNumber}
                    onChangeText={(val) => { setCvorNumber(val); setError(''); }}
                    placeholder="CVOR-98765"
                    placeholderTextColor={T.text.muted}
                    editable={!isLoading}
                  />
                </View>

                {/* File Uploads */}
                <View style={styles.filePickerGroup}>
                  <Text style={styles.inputLabel}>INSURANCE CERTIFICATE</Text>
                  <Pressable style={styles.fileButton} onPress={() => handleSelectFile('insurance')}>
                    <Text style={styles.fileButtonText}>
                      {insuranceFile ? `📄 ${insuranceFile.name}` : '📁 SELECT INSURANCE CERTIFICATE'}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.filePickerGroup}>
                  <Text style={styles.inputLabel}>CVSA REPORT</Text>
                  <Pressable style={styles.fileButton} onPress={() => handleSelectFile('cvsa')}>
                    <Text style={styles.fileButtonText}>
                      {cvsaFile ? `📄 ${cvsaFile.name}` : '📁 SELECT CVSA PDF/IMAGE'}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.filePickerGroup}>
                  <Text style={styles.inputLabel}>CVOR DOCUMENT</Text>
                  <Pressable style={styles.fileButton} onPress={() => handleSelectFile('cvor')}>
                    <Text style={styles.fileButtonText}>
                      {cvorFile ? `📄 ${cvorFile.name}` : '📁 SELECT CVOR PDF/IMAGE'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.pressed,
                isLoading && styles.submitBtnDisabled,
              ]}
              onPress={handleSignupSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>CONTINUE TO VERIFY ➔</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal Overlay */}
      {showOtpOverlay && (
        <View style={styles.overlayContainer}>
          <View style={[styles.otpCard, { backgroundColor: T.background.card, borderColor: T.border.variant }]}>
            <Text style={[styles.welcomeText, { fontSize: 18, marginBottom: 8 }]}>VERIFY PHONE</Text>
            <Text style={[styles.subtitleText, { marginBottom: 20 }]}>
              Enter the 6-digit code sent to your phone.
            </Text>

            <TextInput
              style={[styles.textInput, { textAlign: 'center', fontSize: 24, letterSpacing: 6 }]}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={T.text.muted}
            />

            <Text style={{ fontSize: 11, color: BRAND.crimsonRed, marginTop: 12, fontWeight: '600', textAlign: 'center' }}>
              💡 Staging Bypass Code: 123456
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' }}>
              <Pressable
                style={[styles.fileButton, { flex: 1, backgroundColor: 'transparent' }]}
                onPress={() => setShowOtpOverlay(false)}
                disabled={isVerifying}
              >
                <Text style={[styles.fileButtonText, { color: T.text.secondary }]}>CANCEL</Text>
              </Pressable>

              <Pressable
                style={[styles.submitBtn, { flex: 1, marginTop: 0 }]}
                onPress={handleVerifyOtp}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={[styles.submitBtnText, { fontSize: 13 }]}>VERIFY & JOIN</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
      marginBottom: 20,
    },
    logo: {
      width: 80,
      height: 55,
      marginBottom: 10,
    },
    welcomeText: {
      ...TYPOGRAPHY.headlineLg,
      color: T.text.primary,
      fontWeight: '900',
      letterSpacing: 1.5,
      textAlign: 'center',
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
      padding: 20,
      gap: 14,
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
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: T.background.container,
      borderRadius: 8,
      padding: 3,
      marginBottom: 6,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 6,
    },
    activeTab: {
      backgroundColor: BRAND.crimsonRed,
    },
    tabText: {
      fontSize: 11,
      fontWeight: '800',
      color: T.text.muted,
      letterSpacing: 1,
    },
    activeTabText: {
      color: '#ffffff',
    },
    errorBox: {
      backgroundColor: 'rgba(186, 26, 26, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(186, 26, 26, 0.3)',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
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
      letterSpacing: 0.5,
      fontSize: 10,
    },
    textInput: {
      height: 44,
      backgroundColor: T.background.container,
      borderWidth: 1,
      borderColor: T.border.variant,
      borderRadius: 8,
      paddingHorizontal: 12,
      color: T.text.primary,
      ...TYPOGRAPHY.bodyLg,
    },
    complianceSection: {
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: T.border.variant,
      paddingTop: 12,
      marginTop: 6,
    },
    sectionTitle: {
      ...TYPOGRAPHY.labelData,
      color: BRAND.crimsonRed,
      fontWeight: '800',
      letterSpacing: 1,
      fontSize: 11,
      marginBottom: 4,
    },
    filePickerGroup: {
      gap: 4,
    },
    fileButton: {
      height: 44,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: BRAND.crimsonRed,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    fileButtonText: {
      ...TYPOGRAPHY.bodyMd,
      color: BRAND.crimsonRed,
      fontWeight: '700',
    },
    submitBtn: {
      height: 48,
      backgroundColor: BRAND.crimsonRed,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitBtnText: {
      ...TYPOGRAPHY.headlineSm,
      color: '#ffffff',
      fontWeight: '700',
      letterSpacing: 1.5,
      fontSize: 14,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    overlayContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      paddingHorizontal: 20,
    },
    otpCard: {
      width: '100%',
      borderRadius: 16,
      borderWidth: 1,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    },
  })
);

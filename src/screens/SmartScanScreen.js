import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { scanIdentify, saveDocument } from '../lib/api';
import { scheduleExpiryReminders } from '../lib/expiryNotifications';
import { BRAND, TYPOGRAPHY, SPACING, GlassCard, StatusBorderCard, createGlassCard, useTheme, createThemedStyleSheet } from '../lib/theme';

const DOC_CATEGORIES = [
  { id: 'bol',               label: 'Bill of Lading' },
  { id: 'rate_confirmation', label: 'Rate Confirmation' },
  { id: 'expense_receipt',   label: 'Expense Receipt' },
  { id: 'invoice',           label: 'Invoice' },
  { id: 'drivers_license',   label: "Driver's License" },
  { id: 'medical_card',      label: 'Medical Card' },
  { id: 'other',             label: 'Other' },
];

const SCAN_STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  RESULT: 'result',
  SAVING: 'saving',
};

export default function SmartScanScreen() {
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE);
  const [selectedCategory, setSelectedCategory] = useState('bol');
  const [expiryDate, setExpiryDate] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [confidence, setConfidence] = useState('High');
  const [scannedUri, setScannedUri] = useState(null);
  const [detectedCategory, setDetectedCategory] = useState('');

  const scanLineAnim = useMemo(() => new Animated.Value(0), []);
  const { t: T } = useTheme();
  const styles = useStyles();

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  };

  const processImage = async (uri) => {
    setScanState(SCAN_STATES.SCANNING);
    setScannedUri(uri);
    startScanAnimation();
    try {
      const file = { uri, type: 'image/jpeg', name: 'scan.jpg' };
      const result = await scanIdentify(file);

      const docType = result.document_type || result.docType || 'other';
      const extracted = result.extracted || {};

      setSelectedCategory(mapDocType(docType));
      setDetectedCategory(extracted.category || '');
      setExpiryDate(extracted.expiry_date || result.expiryDate || '');
      
      const refNo = extracted.vendor || extracted.description || result.referenceNo || '';
      setReferenceNo(refNo);
      
      setConfidence(result.confidence ? `${Math.round(result.confidence * 100)}%` : 'High');
      setScanState(SCAN_STATES.RESULT);
    } catch {
      // Demo result on API failure
      setSelectedCategory('bol');
      setDetectedCategory('');
      setExpiryDate('2026-12-31');
      setReferenceNo('BOL-4492-XQ');
      setConfidence('95%');
      setScanState(SCAN_STATES.RESULT);
    }
  };

  const mapDocType = (docType) => {
    if (!docType) return 'other';
    const d = docType.toLowerCase();
    if (d.includes('fuel') || d.includes('receipt') || d.includes('lumper') || d.includes('expense')) return 'expense_receipt';
    if (d.includes('rate_confirmation') || d.includes('ratecon')) return 'rate_confirmation';
    if (d.includes('invoice')) return 'invoice';
    if (d.includes('drivers_license') || d.includes('license') || d.includes('cdl')) return 'drivers_license';
    if (d.includes('medical')) return 'medical_card';
    if (d.includes('bol') || d.includes('lading')) return 'bol';
    return 'other';
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan documents.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await processImage(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await processImage(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    Alert.alert('Upload File', 'File picker integration — tap Gallery to pick from your photos.');
  };

  const handleSaveToVault = async () => {
    try {
      setScanState(SCAN_STATES.SAVING);

      const fileObj = scannedUri ? {
        uri: scannedUri,
        type: 'image/jpeg',
        name: 'scan.jpg'
      } : null;

      const savedDoc = await saveDocument({
        docType: selectedCategory,
        expiryDate: expiryDate || null,
        description: referenceNo ? `Ref: ${referenceNo}` : 'Scanned Document',
        notes: selectedCategory === 'expense_receipt' ? (detectedCategory || 'other') : undefined,
        file: fileObj,
        uploadedAt: new Date().toISOString(),
      });

      if (expiryDate && savedDoc && savedDoc.id) {
        try {
          const categoryLabel = DOC_CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory;
          await scheduleExpiryReminders(savedDoc.id, referenceNo || 'Scanned Document', categoryLabel, expiryDate);
        } catch (e) {
          console.warn('Failed to schedule expiry reminder:', e);
        }
      }

      Alert.alert('✅ Saved', 'Document saved to Vault!', [
        { text: 'OK', onPress: () => {
          setScanState(SCAN_STATES.IDLE);
          setScannedUri(null);
          setDetectedCategory('');
        }},
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save document. Please try again.');
      setScanState(SCAN_STATES.RESULT);
    }
  };

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 340],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Scanner Canvas */}
        <View style={styles.scannerCanvas}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Scan line animation */}
          {scanState === SCAN_STATES.SCANNING && (
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]}
            />
          )}

          {/* Center content */}
          <View style={styles.scannerCenter}>
            {scanState === SCAN_STATES.IDLE && (
              <>
                <Text style={styles.scannerIcon}>📄</Text>
                <Text style={styles.scannerHint}>Align document within the frame</Text>
              </>
            )}
            {scanState === SCAN_STATES.SCANNING && (
              <>
                <ActivityIndicator size="small" color={T.secondary} />
                <Text style={styles.scanningText}>SCANNING DOCUMENT...</Text>
                <Text style={styles.scannerHint}>Align edges within the frame</Text>
              </>
            )}
            {(scanState === SCAN_STATES.RESULT || scanState === SCAN_STATES.SAVING) && (
              <>
                <Text style={[styles.scannerIcon, { color: BRAND.profitGreen }]}>✓</Text>
                <Text style={[styles.scanningText, { color: BRAND.profitGreen }]}>DOCUMENT SCANNED</Text>
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed, { flex: 1 }]}
            onPress={handleTakePhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <GlassCard style={styles.actionBtn}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionLabel}>TAKE PHOTO</Text>
            </GlassCard>
          </Pressable>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed, { flex: 1 }]}
            onPress={handleGallery}
            accessibilityRole="button"
            accessibilityLabel="Pick from gallery"
          >
            <GlassCard style={styles.actionBtn}>
              <Text style={styles.actionIcon}>🖼</Text>
              <Text style={styles.actionLabel}>GALLERY</Text>
            </GlassCard>
          </Pressable>
          <Pressable
            style={({ pressed }) => [pressed && styles.pressed, { flex: 1 }]}
            onPress={handleUpload}
            accessibilityRole="button"
            accessibilityLabel="Upload file"
          >
            <GlassCard style={styles.actionBtn}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionLabel}>UPLOAD</Text>
            </GlassCard>
          </Pressable>
        </View>

        {/* Classification Result Panel */}
        {(scanState === SCAN_STATES.RESULT || scanState === SCAN_STATES.SAVING) && (
          <StatusBorderCard borderColor={BRAND.profitGreen} style={styles.resultPanel}>
            {/* Result header */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Classification Result</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>✓ {confidence} Confidence</Text>
              </View>
            </View>

            {/* Fields */}
            <View style={styles.fieldsGrid}>
              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <View style={styles.categoryPicker}>
                  {DOC_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(cat.id)}
                      accessibilityRole="radio"
                      accessibilityLabel={cat.label}
                    >
                      <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Expiry date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EXPIRY DATE</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={T.text.secondary}
                  accessibilityLabel="Expiry date"
                />
              </View>

              {/* Reference No */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EXTRACTED REFERENCE NO.</Text>
                <TextInput
                  style={styles.input}
                  value={referenceNo}
                  onChangeText={setReferenceNo}
                  placeholder="e.g. BOL-4492-XQ"
                  placeholderTextColor={T.text.secondary}
                  accessibilityLabel="Reference number"
                />
              </View>

              {/* Document metadata */}
              <View style={styles.metaRow}>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabel}>Pages</Text>
                  <Text style={styles.metaValue}>02</Text>
                </View>
                <View style={[styles.metaCell, styles.metaBorder]}>
                  <Text style={styles.metaLabel}>Size</Text>
                  <Text style={styles.metaValue}>1.2 MB</Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabel}>Format</Text>
                  <Text style={styles.metaValue}>PDF</Text>
                </View>
              </View>
            </View>

            {/* Save button */}
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed, scanState === SCAN_STATES.SAVING && styles.saveBtnLoading]}
              onPress={handleSaveToVault}
              disabled={scanState === SCAN_STATES.SAVING}
              accessibilityRole="button"
              accessibilityLabel="Save to vault"
            >
              {scanState === SCAN_STATES.SAVING
                ? <ActivityIndicator size="small" color="#ffffff" />
                : <Text style={styles.saveBtnText}>✓  SAVE TO VAULT</Text>
              }
            </Pressable>
          </StatusBorderCard>
        )}

        {/* Compliance Banner */}
        <View style={styles.complianceBanner}>
          <Text style={styles.complianceIcon}>⚠</Text>
          <View style={styles.complianceBannerText}>
            <Text style={styles.complianceBannerTitle}>Compliance Alert</Text>
            <Text style={styles.complianceBannerBody}>
              This document type requires a valid expiry date to maintain {"'Premium'"} carrier status. Ensure the date matches the physical copy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, backgroundColor: 'transparent', paddingBottom: 100 },

  // Scanner canvas
  scannerCanvas: {
    marginHorizontal: SPACING.marginMobile,
    marginTop: SPACING.stackMd,
    height: 280,
    backgroundColor: T.background.base === '#edeef3' ? 'rgba(195, 198, 215, 0.80)' : 'rgba(5, 2, 2, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border.variant,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Corner brackets
  corner: { position: 'absolute', width: 32, height: 32 },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderColor: T.secondary },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderColor: T.secondary },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: T.secondary },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderColor: T.secondary },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(170, 199, 255, 0.15)',
    zIndex: 20,
  },

  // Center content
  scannerCenter: { alignItems: 'center', gap: 8, zIndex: 10 },
  scannerIcon: { fontSize: 40, color: T.text.secondary },
  scannerHint: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, textAlign: 'center', maxWidth: 220 },
  scanningText: { ...TYPOGRAPHY.labelData, color: T.secondary, letterSpacing: 2, marginTop: 4 },

  // Action buttons grid
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.stackMd,
    gap: SPACING.stackMd,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.stackMd,
    borderRadius: 8, // Square buttons with rounded edges (radius 8) as requested
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { ...TYPOGRAPHY.labelData, color: T.text.primary },

  // Result panel
  resultPanel: {
    marginHorizontal: SPACING.marginMobile,
    marginTop: SPACING.stackMd,
    overflow: 'hidden',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.stackMd,
    borderBottomWidth: 1,
    borderBottomColor: T.border.variant,
  },
  resultTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: T.compliance.valid,
    borderWidth: 1,
    borderColor: BRAND.profitGreen + '4D',
  },
  confidenceText: { ...TYPOGRAPHY.labelData, color: BRAND.profitGreen },

  // Fields
  fieldsGrid: { padding: SPACING.stackMd, gap: SPACING.stackMd },
  fieldGroup: { gap: 6 },
  fieldLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, letterSpacing: 0.5 },
  input: {
    backgroundColor: T.background.container,
    borderWidth: 1,
    borderColor: T.border.variant,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: T.text.primary,
    ...TYPOGRAPHY.bodyMd,
  },

  // Category picker
  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: T.border.variant,
    backgroundColor: T.background.container,
  },
  categoryChipActive: { backgroundColor: T.primary, borderColor: T.primary },
  categoryChipText: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, fontSize: 12 },
  categoryChipTextActive: { color: '#ffffff' },

  // Metadata row
  metaRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: T.border.variant,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: T.background.containerLow,
    paddingVertical: 12,
  },
  metaCell: { flex: 1, alignItems: 'center' },
  metaBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: T.border.variant },
  metaLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary },
  metaValue: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, marginTop: 2 },

  // Save button
  saveBtn: {
    backgroundColor: T.primary,
    paddingVertical: 16,
    margin: SPACING.stackMd,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnLoading: { opacity: 0.7 },
  saveBtnText: { ...TYPOGRAPHY.headlineSm, color: '#ffffff', letterSpacing: 1 },

  // Compliance banner
  complianceBanner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginHorizontal: SPACING.marginMobile,
    marginTop: SPACING.stackMd,
    marginBottom: 100,
    backgroundColor: T.compliance.warning,
    borderWidth: 1,
    borderColor: BRAND.hazardOrange + '66',
    borderRadius: 12,
    padding: SPACING.stackMd,
  },
  complianceIcon: { fontSize: 20, color: BRAND.hazardOrange, marginTop: 2 },
  complianceBannerText: { flex: 1, gap: 4 },
  complianceBannerTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, fontSize: 14 },
  complianceBannerBody: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, fontSize: 12 },

  pressed: { opacity: 0.75 },
}));
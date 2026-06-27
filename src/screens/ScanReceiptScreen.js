import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { scanReceipt, createExpense } from '../lib/api';
import { BRAND, TYPOGRAPHY, SPACING, GlassCard, useTheme, createThemedStyleSheet } from '../lib/theme';

// ── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'fuel',        label: 'FUEL',        emoji: '⛽' },
  { id: 'tolls',       label: 'TOLLS',       emoji: '🛣️' },
  { id: 'meals',       label: 'MEALS',       emoji: '🍽️' },
  { id: 'lodging',     label: 'LODGING',     emoji: '🏨' },
  { id: 'maintenance', label: 'MAINTENANCE', emoji: '🔧' },
  { id: 'other',       label: 'OTHER',       emoji: '🧾' },
];

// ── Smart auto-categorizer based on vendor / description from AI ──────────────
function autoDetectCategory(vendor = '', description = '', rawCategory = '') {
  const text = `${vendor} ${description} ${rawCategory}`.toLowerCase();

  if (/fuel|gas|diesel|petrol|pilot|loves|flying j|sheetz|kwik|speedway|marathon|bp|shell|exxon|chevron|sunoco|citgo|texaco/.test(text)) return 'fuel';
  if (/toll|e-z pass|ezpass|peach pass|i-pass|fastlane|turnpike|bridge|tunnel/.test(text)) return 'tolls';
  if (/meal|food|restaurant|diner|mcdonald|subway|burger|wendy|taco|pizza|waffle|ihop|dennys|starbucks|coffee|eat|lunch|dinner|breakfast/.test(text)) return 'meals';
  if (/hotel|motel|inn|lodge|marriott|hilton|holiday|comfort|super 8|sleep|best western|hyatt|sheraton/.test(text)) return 'lodging';
  if (/repair|maintenance|oil|tire|brake|fluid|service|mechanic|lube|truck stop/.test(text)) return 'maintenance';

  return 'other';
}

// ── Scan states ────────────────────────────────────────────────────────────────
const STATES = { IDLE: 'idle', SCANNING: 'scanning', REVIEW: 'review', SAVING: 'saving', SAVED: 'saved' };

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScanReceiptScreen({ onExpenseSaved }) {
  const { t: T } = useTheme();
  const styles = useStyles();

  const [scanState, setScanState] = useState(STATES.IDLE);

  // Review form state (populated from scan result)
  const [description, setDescription]   = useState('');
  const [vendor,      setVendor]        = useState('');
  const [amount,      setAmount]        = useState('');
  const [date,        setDate]          = useState('');
  const [category,    setCategory]      = useState('other');

  // ── Scan helpers ─────────────────────────────────────────────────────────────
  const handleScan = async (asset) => {
    setScanState(STATES.SCANNING);
    try {
      const file = { uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || 'receipt.jpg' };
      const result = await scanReceipt(file);

      // Populate review form from AI result
      const detectedVendor  = result.vendor      || result.merchant || '';
      const detectedAmount  = result.amount       != null ? String(result.amount) : '';
      const detectedDate    = result.date         || new Date().toISOString().split('T')[0];
      const detectedDesc    = result.description  || result.items?.[0]?.description || 'Receipt scan';
      const detectedCat     = autoDetectCategory(detectedVendor, detectedDesc, result.category || '');

      setVendor(detectedVendor);
      setAmount(detectedAmount);
      setDate(detectedDate);
      setDescription(detectedDesc);
      setCategory(detectedCat);
      setScanState(STATES.REVIEW);
    } catch (err) {
      setScanState(STATES.IDLE);
      Alert.alert('Scan Error', err.message || 'Could not read this receipt. Please try a clearer photo.');
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled && result.assets?.[0]) await handleScan(result.assets[0]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled && result.assets?.[0]) await handleScan(result.assets[0]);
  };

  // ── Save expense ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Amount Required', 'Please enter a valid expense amount.');
      return;
    }
    setScanState(STATES.SAVING);
    try {
      await createExpense({
        description: description || 'Scanned Receipt',
        vendor:      vendor      || undefined,
        amount:      parseFloat(amount),
        category,
        date:        date        || new Date().toISOString().split('T')[0],
      });
      setScanState(STATES.SAVED);
      if (onExpenseSaved) onExpenseSaved();
    } catch (err) {
      setScanState(STATES.REVIEW);
      Alert.alert('Save Failed', 'Could not save expense. Please try again.');
    }
  };

  const resetScan = () => {
    setScanState(STATES.IDLE);
    setDescription(''); setVendor(''); setAmount(''); setDate(''); setCategory('other');
  };

  const catInfo = CATEGORIES.find(c => c.id === category) || CATEGORIES[CATEGORIES.length - 1];

  // ── IDLE ─────────────────────────────────────────────────────────────────────
  if (scanState === STATES.IDLE) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✨ SCAN RECEIPT</Text>
          <Text style={styles.headerSub}>AI will identify and categorize your expense</Text>
        </View>

        <View style={styles.idleContent}>
          <View style={styles.scanIllustration}>
            <Text style={{ fontSize: 64 }}>🧾</Text>
            <View style={styles.scanCornerTL} /><View style={styles.scanCornerTR} />
            <View style={styles.scanCornerBL} /><View style={styles.scanCornerBR} />
          </View>

          <Text style={styles.idleHint}>Point your camera at a receipt or select from your gallery</Text>

          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={takePhoto}>
            <Text style={styles.primaryBtnText}>📷  TAKE PHOTO</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]} onPress={pickImage}>
            <Text style={styles.secondaryBtnText}>🖼️  CHOOSE FROM GALLERY</Text>
          </Pressable>

          <View style={styles.categoriesHint}>
            {CATEGORIES.map(c => (
              <View key={c.id} style={styles.catHintPill}>
                <Text style={{ fontSize: 14 }}>{c.emoji}</Text>
                <Text style={styles.catHintLabel}>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────────────────────
  if (scanState === STATES.SCANNING) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={BRAND.crimsonRed} />
          <Text style={styles.scanningText}>Analyzing receipt...</Text>
          <Text style={styles.scanningSubText}>AI is extracting vendor, amount, and category</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── SAVED ─────────────────────────────────────────────────────────────────────
  if (scanState === STATES.SAVED) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centeredContent}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={styles.savedTitle}>Expense Saved!</Text>
          <View style={styles.savedSummary}>
            <Text style={styles.savedEmoji}>{catInfo.emoji}</Text>
            <View>
              <Text style={styles.savedDesc}>{description || 'Scanned Receipt'}</Text>
              <Text style={styles.savedMeta}>{catInfo.label}{vendor ? ` • ${vendor}` : ''}</Text>
            </View>
            <Text style={styles.savedAmount}>-${parseFloat(amount).toFixed(2)}</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.primaryBtn, { marginTop: 24 }, pressed && styles.pressed]} onPress={resetScan}>
            <Text style={styles.primaryBtnText}>📷  SCAN ANOTHER</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── REVIEW ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={resetScan} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← RESCAN</Text>
        </Pressable>
        <Text style={styles.headerTitle}>REVIEW & SAVE</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Auto-detected Category Banner */}
        <GlassCard style={styles.detectedBanner}>
          <Text style={styles.detectedLabel}>AI DETECTED CATEGORY</Text>
          <View style={styles.detectedCatRow}>
            <Text style={{ fontSize: 28 }}>{catInfo.emoji}</Text>
            <Text style={styles.detectedCatText}>{catInfo.label}</Text>
          </View>
        </GlassCard>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>DESCRIPTION</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Fuel Stop - Pilot"
            placeholderTextColor={T.text.muted}
          />
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>AMOUNT ($)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>

        {/* Vendor */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>VENDOR</Text>
          <TextInput
            style={styles.input}
            value={vendor}
            onChangeText={setVendor}
            placeholder="e.g. Pilot Flying J"
            placeholderTextColor={T.text.muted}
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>DATE</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={T.text.muted}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>CATEGORY</Text>
          <View style={styles.catPicker}>
            {CATEGORIES.map(c => (
              <Pressable
                key={c.id}
                style={[styles.catPickerItem, category === c.id && styles.catPickerItemActive]}
                onPress={() => setCategory(c.id)}
              >
                <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                <Text style={[styles.catPickerLabel, category === c.id && styles.catPickerLabelActive]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, scanState === STATES.SAVING && styles.saveBtnDisabled, pressed && styles.pressed]}
          onPress={handleSave}
          disabled={scanState === STATES.SAVING}
        >
          {scanState === STATES.SAVING
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>✓  SAVE EXPENSE</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const useStyles = createThemedStyleSheet((T) => {
  const isLight = T.background.base === '#edeef3';
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: 'transparent' },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1.5,
      borderBottomColor: T.border.variant,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, fontWeight: '800', letterSpacing: 1 },
    headerSub: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, fontSize: 11, marginTop: 2 },
    backBtn: {
      paddingVertical: 6, paddingHorizontal: 10,
      borderRadius: 6, backgroundColor: T.background.containerHighest,
      borderWidth: 1, borderColor: T.border.variant,
    },
    backBtnText: { fontSize: 12, fontWeight: '700', color: T.text.primary },
    idleContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
    centeredContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

    // Scan illustration
    scanIllustration: {
      width: 160, height: 160,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 8,
      position: 'relative',
    },
    scanCornerTL: { position: 'absolute', top: 0,  left: 0,  width: 20, height: 20, borderTopWidth: 3,    borderLeftWidth: 3,   borderColor: BRAND.crimsonRed, borderTopLeftRadius: 4 },
    scanCornerTR: { position: 'absolute', top: 0,  right: 0, width: 20, height: 20, borderTopWidth: 3,    borderRightWidth: 3,  borderColor: BRAND.crimsonRed, borderTopRightRadius: 4 },
    scanCornerBL: { position: 'absolute', bottom: 0, left: 0,  width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3,   borderColor: BRAND.crimsonRed, borderBottomLeftRadius: 4 },
    scanCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3,  borderColor: BRAND.crimsonRed, borderBottomRightRadius: 4 },

    idleHint: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, textAlign: 'center', maxWidth: 280 },
    primaryBtn: {
      width: '100%', height: 52, borderRadius: 8,
      backgroundColor: BRAND.crimsonRed,
      justifyContent: 'center', alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
    secondaryBtn: {
      width: '100%', height: 48, borderRadius: 8,
      borderWidth: 1.5, borderColor: T.border.variant,
      backgroundColor: T.background.containerHighest,
      justifyContent: 'center', alignItems: 'center',
    },
    secondaryBtnText: { color: T.text.primary, fontSize: 13, fontWeight: '700' },
    pressed: { opacity: 0.75 },

    categoriesHint: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 8 },
    catHintPill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 20, backgroundColor: T.background.containerHighest,
      borderWidth: 1, borderColor: T.border.variant,
    },
    catHintLabel: { fontSize: 10, fontWeight: '600', color: T.text.secondary },

    // Scanning state
    scanningText: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, marginTop: 20, fontWeight: '700' },
    scanningSubText: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, marginTop: 6, textAlign: 'center' },

    // Saved state
    savedTitle: { ...TYPOGRAPHY.headlineMd, color: BRAND.profitGreen, fontWeight: '800', marginBottom: 16 },
    savedSummary: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      padding: 16, borderRadius: 8,
      backgroundColor: T.background.containerHighest,
      borderWidth: 1, borderColor: T.border.variant,
      width: '100%',
    },
    savedEmoji: { fontSize: 28 },
    savedDesc: { ...TYPOGRAPHY.bodyMd, color: T.text.primary, fontWeight: '700' },
    savedMeta: { fontSize: 11, color: T.text.secondary, marginTop: 2 },
    savedAmount: { marginLeft: 'auto', ...TYPOGRAPHY.labelData, color: BRAND.crimsonRed, fontWeight: '800', fontSize: 16 },

    // Review form
    detectedBanner: {
      padding: 14, marginBottom: 16,
      borderWidth: 1.5, borderColor: BRAND.crimsonRed + '66',
      backgroundColor: isLight ? 'rgba(255,220,216,0.5)' : 'rgba(90,10,10,0.35)',
    },
    detectedLabel: { fontSize: 10, fontWeight: '700', color: BRAND.crimsonRed, letterSpacing: 0.8, marginBottom: 6 },
    detectedCatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detectedCatText: { fontSize: 20, fontWeight: '800', color: T.text.primary },

    inputGroup: { marginBottom: 14 },
    inputLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10, marginBottom: 5 },
    input: {
      height: 48, borderRadius: 6,
      borderWidth: 1.5, borderColor: T.border.variant,
      paddingHorizontal: 12, fontSize: 14,
      color: T.text.primary, backgroundColor: T.background.container,
    },

    catPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    catPickerItem: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 10, paddingVertical: 8,
      borderRadius: 6, backgroundColor: T.background.containerHighest,
      borderWidth: 1.5, borderColor: T.border.variant,
    },
    catPickerItemActive: { backgroundColor: BRAND.crimsonRed, borderColor: BRAND.crimsonRed },
    catPickerLabel: { fontSize: 10, fontWeight: '600', color: T.text.secondary },
    catPickerLabelActive: { color: '#ffffff' },

    saveBtn: {
      height: 54, borderRadius: 8,
      backgroundColor: BRAND.profitGreen,
      justifyContent: 'center', alignItems: 'center',
      marginTop: 8,
    },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  });
});
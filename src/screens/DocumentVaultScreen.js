import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { listDocuments, deleteDocument } from '../lib/api';
import { cancelExpiryReminders } from '../lib/expiryNotifications';
import { BRAND, TYPOGRAPHY, SPACING, GlassCard, useTheme, createThemedStyleSheet } from '../lib/theme';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOC_TYPE_META = {
  driverLicense:     { emoji: '🪪', label: "Driver's License" },
  coi:               { emoji: '🛡️', label: 'Certificate of Insurance' },
  operatingAuthority:{ emoji: '📜', label: 'Operating Authority (MC/DOT)' },
  nsc:               { emoji: '🏛️', label: 'National Safety Code' },
  ifta:              { emoji: '⛽', label: 'IFTA Certificate' },
  invoice:           { emoji: '🧾', label: 'Invoice' },
  receipt:           { emoji: '🧾', label: 'Receipt' },
  registration:      { emoji: '🚛', label: 'Vehicle Registration' },
  insurance:         { emoji: '🛡️', label: 'Insurance' },
  contract:          { emoji: '📋', label: 'Contract' },
};

function getDocMeta(docType = '') {
  const key = Object.keys(DOC_TYPE_META).find(k => k.toLowerCase() === docType.toLowerCase()) || null;
  return key ? DOC_TYPE_META[key] : { emoji: '📄', label: docType || 'Document' };
}

function isImageUrl(url = '') {
  return /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url);
}

function isPdfUrl(url = '') {
  return /\.pdf(\?.*)?$/i.test(url);
}

const getStatusStyles = (T) => ({
  overdue: {
    container: { borderLeftColor: T.status.error, backgroundColor: T.compliance.critical },
    text: { color: T.status.error, fontWeight: '600' },
  },
  'expiring-soon': {
    container: { borderLeftColor: BRAND.hazardOrange, backgroundColor: T.compliance.warning },
    text: { color: BRAND.hazardOrange, fontWeight: '600' },
  },
  valid: {
    container: { borderLeftColor: BRAND.profitGreen, backgroundColor: T.compliance.valid },
    text: { color: T.text.secondary },
  },
});

// ── Document Viewer Modal ─────────────────────────────────────────────────────

function DocumentViewer({ doc, visible, onClose, T, styles }) {
  const fileUrl = doc?.fileUrl || doc?.url || doc?.file_url;
  const isImage = fileUrl && isImageUrl(fileUrl);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.viewerOverlay}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {/* Viewer Header */}
          <View style={styles.viewerHeader}>
            <Pressable onPress={onClose} style={styles.viewerCloseBtn}>
              <Text style={styles.viewerCloseBtnText}>✕ CLOSE</Text>
            </Pressable>
            <Text style={styles.viewerTitle} numberOfLines={1}>
              {getDocMeta(doc?.docType).emoji}  {doc?.label || doc?.description || getDocMeta(doc?.docType).label}
            </Text>
          </View>

          {/* Content */}
          {isImage ? (
            <ScrollView
              contentContainerStyle={{ flex: 1 }}
              maximumZoomScale={4}
              minimumZoomScale={1}
              centerContent
            >
              <Image
                source={{ uri: fileUrl }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            </ScrollView>
          ) : (
            <View style={styles.viewerPdfPlaceholder}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>📄</Text>
              <Text style={styles.viewerPdfText}>
                {fileUrl ? 'Tap below to open this document in your device viewer' : 'No file attached to this document'}
              </Text>
              {fileUrl && (
                <Pressable
                  style={({ pressed }) => [styles.viewerOpenBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => {
                    onClose();
                    WebBrowser.openBrowserAsync(fileUrl);
                  }}
                >
                  <Text style={styles.viewerOpenBtnText}>🔗  OPEN DOCUMENT</Text>
                </Pressable>
              )}
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {(() => void) | undefined} [props.onBack]
 */
export default function DocumentVaultScreen({ onBack = undefined } = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);
  const { t: T } = useTheme();
  const styles = useStyles();

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Error', 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDelete = async (docId) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(docId);
              await cancelExpiryReminders(docId);
              loadDocuments();
            } catch {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  // Share or email a document via the OS share sheet
  const handleShare = async (doc) => {
    const fileUrl = doc.fileUrl || doc.url || doc.file_url;
    if (!fileUrl) {
      Alert.alert('No File', 'This document has no file attached.');
      return;
    }

    try {
      // If it's a remote URL, download to a temp file first
      let localUri = fileUrl;
      if (fileUrl.startsWith('http')) {
        const ext    = fileUrl.split('?')[0].split('.').pop() || 'pdf';
        const dest   = `${FileSystem.cacheDirectory}vault_share_${doc.id}.${ext}`;
        const dl     = await FileSystem.downloadAsync(fileUrl, dest);
        localUri     = dl.uri;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localUri, {
          mimeType: isPdfUrl(fileUrl) ? 'application/pdf' : 'image/*',
          dialogTitle: `Share: ${doc.label || doc.description || 'Document'}`,
        });
      } else {
        // Fallback: open in browser
        await WebBrowser.openBrowserAsync(fileUrl);
      }
    } catch (err) {
      Alert.alert('Share Failed', err.message || 'Could not share this document.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const daysLeft = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0)  return 'overdue';
    if (daysLeft <= 7) return 'expiring-soon';
    return 'valid';
  };

  // ── Document Card ─────────────────────────────────────────────────────────
  const renderDocument = ({ item }) => {
    const status      = getExpiryStatus(item.expiryDate);
    const statusStyle = status ? getStatusStyles(T)[status] : null;
    const meta        = getDocMeta(item.docType);
    const docName     = item.label || item.description || null;
    const hasFile     = !!(item.fileUrl || item.url || item.file_url);

    return (
      <TouchableOpacity
        style={styles.documentCard}
        onPress={() => setViewingDoc(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`Open ${docName || meta.label}`}
      >
        {/* Left colour stripe based on status */}
        {status && (
          <View style={[styles.statusStripe, {
            backgroundColor: status === 'overdue' ? T.status.error
              : status === 'expiring-soon' ? BRAND.hazardOrange
              : BRAND.profitGreen
          }]} />
        )}

        <View style={styles.cardBody}>
          {/* Top row: icon + names + action buttons */}
          <View style={styles.cardTopRow}>
            {/* Doc type icon */}
            <View style={styles.docIconBox}>
              <Text style={{ fontSize: 24 }}>{meta.emoji}</Text>
            </View>

            {/* Names */}
            <View style={{ flex: 1 }}>
              <Text style={styles.docTypeBadge}>{meta.label.toUpperCase()}</Text>
              {docName && (
                <Text style={styles.docNameText} numberOfLines={2}>{docName}</Text>
              )}
              <Text style={styles.docDateText}>Uploaded: {formatDate(item.uploadedAt)}</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.cardActions}>
              {/* Share button */}
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: BRAND.profitGreen + '88' }]}
                onPress={() => handleShare(item)}
                disabled={!hasFile}
                accessibilityLabel="Share document"
              >
                <Text style={[styles.actionBtnText, { color: BRAND.profitGreen }]}>
                  {Platform.OS === 'ios' ? '↑' : '✉'}
                </Text>
              </TouchableOpacity>

              {/* Delete button */}
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: BRAND.crimsonRed + '88' }]}
                onPress={() => handleDelete(item.id)}
                accessibilityLabel="Delete document"
              >
                <Text style={[styles.actionBtnText, { color: BRAND.crimsonRed }]}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiry row */}
          {item.expiryDate && statusStyle && (
            <View style={[styles.expiryBadge, statusStyle.container]}>
              <Text style={[styles.expiryText, statusStyle.text]}>
                Expires: {formatDate(item.expiryDate)}
                {status === 'overdue' && '  ⚠ OVERDUE'}
                {status === 'expiring-soon' && '  ⏳ EXPIRING SOON'}
              </Text>
            </View>
          )}

          {/* Open hint */}
          {hasFile && (
            <View style={styles.openHint}>
              <Text style={styles.openHintText}>👆 Tap to open</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topHeader}>
          {onBack && (
            <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
              <Text style={styles.headerIconText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Document Vault</Text>
        </View>
        <View style={styles.skeletonList}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <View style={[styles.skeletonLine, { width: '40%', height: 10, marginBottom: 8 }]} />
              <View style={[styles.skeletonLine, { width: '70%', height: 14, marginBottom: 6 }]} />
              <View style={[styles.skeletonLine, { width: '30%', height: 10 }]} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topHeader}>
        {onBack && (
          <TouchableOpacity style={styles.headerBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={styles.headerIconText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Document Vault</Text>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{documents.length}</Text>
        </View>
      </View>

      <View style={styles.container}>
        {documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 56 }}>🗄️</Text>
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>Start by scanning your first document</Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderDocument}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={loadDocuments}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer
          doc={viewingDoc}
          visible={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          T={T}
          styles={styles}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const useStyles = createThemedStyleSheet((T) => {
  const isLight = T.background.base === '#edeef3';

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: 'transparent' },

    topHeader: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1.5,
      borderBottomColor: T.border.variant,
      gap: 12,
    },
    headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerIconText: { fontSize: 20, color: T.primary },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: T.text.primary },
    headerCount: {
      paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 20, backgroundColor: BRAND.crimsonRed + '22',
      borderWidth: 1, borderColor: BRAND.crimsonRed + '44',
    },
    headerCountText: { fontSize: 12, fontWeight: '700', color: BRAND.crimsonRed },

    container: { flex: 1, backgroundColor: 'transparent' },
    listContainer: { padding: 12, paddingBottom: 32 },

    // Document card
    documentCard: {
      marginBottom: 12,
      borderRadius: 10,
      backgroundColor: isLight ? 'rgba(190, 195, 210, 0.85)' : 'rgba(13, 4, 4, 0.85)',
      borderWidth: 1,
      borderColor: T.border.variant,
      overflow: 'hidden',
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isLight ? 0.08 : 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    statusStripe: { width: 4 },
    cardBody: { flex: 1, padding: 14 },
    cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },

    docIconBox: {
      width: 44, height: 44,
      borderRadius: 8,
      backgroundColor: T.background.containerHighest,
      borderWidth: 1, borderColor: T.border.variant,
      alignItems: 'center', justifyContent: 'center',
    },
    docTypeBadge: {
      fontSize: 9, fontWeight: '800', letterSpacing: 0.8,
      color: BRAND.crimsonRed, marginBottom: 3,
    },
    docNameText: {
      fontSize: 14, fontWeight: '700',
      color: T.text.primary, lineHeight: 18,
      marginBottom: 3,
    },
    docDateText: { fontSize: 11, color: T.text.secondary },

    cardActions: { flexDirection: 'row', gap: 6, marginTop: 2 },
    actionBtn: {
      width: 32, height: 32, borderRadius: 6,
      borderWidth: 1.5,
      backgroundColor: T.background.containerHighest,
      alignItems: 'center', justifyContent: 'center',
    },
    actionBtnText: { fontSize: 14 },

    expiryBadge: {
      marginTop: 10, paddingVertical: 6, paddingHorizontal: 10,
      borderRadius: 4, borderLeftWidth: 4,
    },
    expiryText: { fontSize: 12 },

    openHint: { marginTop: 8, alignItems: 'flex-end' },
    openHintText: { fontSize: 10, color: T.text.muted, fontStyle: 'italic' },

    // Skeleton loading
    skeletonList: { padding: 12, gap: 12 },
    skeletonCard: {
      height: 90, borderRadius: 10,
      backgroundColor: T.background.containerHighest,
      padding: 16, borderWidth: 1, borderColor: T.border.variant,
      justifyContent: 'center',
    },
    skeletonLine: {
      borderRadius: 4,
      backgroundColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    },

    // Empty state
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    emptyText: { fontSize: 18, fontWeight: '600', color: T.text.primary },
    emptySubtext: { fontSize: 14, color: T.text.secondary, textAlign: 'center', maxWidth: 260 },

    // Document Viewer Modal
    viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.93)' },
    viewerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)',
      gap: 12,
    },
    viewerCloseBtn: {
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    viewerCloseBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
    viewerTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#ffffff' },
    viewerImage: { flex: 1, width: '100%', minHeight: 300 },
    viewerPdfPlaceholder: {
      flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
    },
    viewerPdfText: {
      color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center',
      marginBottom: 24, lineHeight: 22,
    },
    viewerOpenBtn: {
      paddingHorizontal: 24, paddingVertical: 14,
      borderRadius: 8, backgroundColor: BRAND.crimsonRed,
    },
    viewerOpenBtnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  });
});
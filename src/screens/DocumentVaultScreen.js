import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listDocuments, deleteDocument } from '../lib/api';
import { cancelExpiryReminders } from '../lib/expiryNotifications';
import { BRAND, TYPOGRAPHY, SPACING, GlassCard, createGlassCard, useTheme, createThemedStyleSheet } from '../lib/theme';

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

/**
 * @param {object} props
 * @param {(() => void) | undefined} [props.onBack]
 */
export default function DocumentVaultScreen({ onBack = undefined } = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t: T } = useTheme();
  const styles = useStyles();

  const loadDocuments = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocuments();
  }, []);

  const handleDelete = async (docId) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDocument(docId);
              await cancelExpiryReminders(docId);
              loadDocuments();
            } catch {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 7) return 'expiring-soon';
    return 'valid';
  };

  const renderDocument = ({ item }) => {
    const status = getExpiryStatus(item.expiryDate);
    const statusStyle = status ? getStatusStyles(T)[status] : null;

    return (
      <GlassCard style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.documentType}>{item.docType || 'Document'}</Text>
            <Text style={styles.documentDate}>
              Uploaded: {formatDate(item.uploadedAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {item.expiryDate && statusStyle && (
          <View style={[styles.expiryInfo, statusStyle.container]}>
            <Text style={[styles.expiryText, statusStyle.text]}>
              Expires: {formatDate(item.expiryDate)}
              {status === 'overdue' && ' (OVERDUE)'}
              {status === 'expiring-soon' && ' (EXPIRING SOON)'}
            </Text>
          </View>
        )}

        {item.description && (
          <Text style={styles.documentDescription}>{item.description}</Text>
        )}
      </GlassCard>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to Home"
            >
              <Text style={styles.headerIconText}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Document Vault</Text>
        </View>
      </View>
      <View style={styles.container}>
        {documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>
              Start by scanning your first document
            </Text>
          </View>
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderDocument}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={loadDocuments}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: T.border.variant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 20,
    color: T.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text.primary,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  listContainer: {
    padding: 12,
  },
  documentCard: {
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text.primary,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: T.text.secondary,
  },
  deleteButton: {
    backgroundColor: T.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  expiryInfo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  expiryText: {
    fontSize: 13,
  },
  documentDescription: {
    fontSize: 14,
    color: T.text.secondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: T.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: T.text.secondary,
  },
}));
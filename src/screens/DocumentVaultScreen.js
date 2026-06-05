import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listDocuments, deleteDocument } from '../lib/api';
import { cancelExpiryReminders } from '../lib/expiryNotifications';

export default function DocumentVaultScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadDocuments();
    }, [])
  );

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await listDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

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
            } catch (error) {
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

    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View>
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

        {item.expiryDate && (
          <View
            style={[
              styles.expiryInfo,
              status === 'overdue' && styles.expiryOverdue,
              status === 'expiring-soon' && styles.expiryExpiringSoon,
            ]}
          >
            <Text
              style={[
                styles.expiryText,
                (status === 'overdue' || status === 'expiring-soon') &&
                  styles.expiryTextWarning,
              ]}
            >
              Expires: {formatDate(item.expiryDate)}
              {status === 'overdue' && ' (OVERDUE)'}
              {status === 'expiring-soon' && ' (EXPIRING SOON)'}
            </Text>
          </View>
        )}

        {item.description && (
          <Text style={styles.documentDescription}>{item.description}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
    color: '#000',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
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
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  expiryExpiringSoon: {
    borderLeftColor: '#FF9500',
    backgroundColor: '#fff3cd',
  },
  expiryOverdue: {
    borderLeftColor: '#FF3B30',
    backgroundColor: '#ffebee',
  },
  expiryText: {
    fontSize: 13,
    color: '#333',
  },
  expiryTextWarning: {
    fontWeight: '600',
    color: '#d32f2f',
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
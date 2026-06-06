import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';

type TabName = 'loads' | 'expenses' | 'scan' | 'vault';

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState<TabName>('loads');

  const renderScreen = () => {
    switch (activeTab) {
      case 'loads':
        return (
          <ScrollView style={styles.screenContent}>
            <View style={styles.hero}>
              <ThemedText type="title" style={styles.heroTitle}>
                My Loads
              </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Scan and verify rate confirmations
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Scan Rate Confirmation</ThemedText>
              <ThemedText style={styles.cardText}>
                📸 Camera access enabled{'\n'}
                ✅ API connected to backend{'\n'}
                ✅ Extracts: vehicle, rate, date, carrier
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Phase 1 Status</ThemedText>
              <ThemedText style={styles.cardText}>
                ✅ Rate Confirmation Scanner{'\n'}
                ✅ Photo/Gallery picker{'\n'}
                ⏳ TODO: Edit form before save
              </ThemedText>
            </View>
          </ScrollView>
        );

      case 'expenses':
        return (
          <ScrollView style={styles.screenContent}>
            <View style={styles.hero}>
              <ThemedText type="title" style={styles.heroTitle}>
                Expenses
              </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Scan and record receipts
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Scan Receipt</ThemedText>
              <ThemedText style={styles.cardText}>
                📸 Camera access enabled{'\n'}
                ✅ API connected to backend{'\n'}
                ✅ Extracts: vendor, amount, date, description
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Phase 1 Status</ThemedText>
              <ThemedText style={styles.cardText}>
                ✅ Receipt Scanner{'\n'}
                ✅ Photo/Gallery picker{'\n'}
                ⏳ TODO: Save as expense record{'\n'}
                ⏳ TODO: Edit form before save
              </ThemedText>
            </View>
          </ScrollView>
        );

      case 'scan':
        return (
          <ScrollView style={styles.screenContent}>
            <View style={styles.hero}>
              <ThemedText type="title" style={styles.heroTitle}>
                Smart Scan
              </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Universal document identification
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Smart Scan Features</ThemedText>
              <ThemedText style={styles.cardText}>
                📸 Scan any document{'\n'}
                ✅ Auto-identifies document type{'\n'}
                ✅ Detects expiry dates{'\n'}
                ✅ Category picker (License, Insurance, etc){'\n'}
                ✅ Saves to vault with expiry tracking
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Phase 1 Status</ThemedText>
              <ThemedText style={styles.cardText}>
                ✅ Document Scanner{'\n'}
                ✅ Category Selection{'\n'}
                ✅ Expiry Detection{'\n'}
                ✅ Save to Vault
              </ThemedText>
            </View>
          </ScrollView>
        );

      case 'vault':
        return (
          <ScrollView style={styles.screenContent}>
            <View style={styles.hero}>
              <ThemedText type="title" style={styles.heroTitle}>
                Document Vault
              </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                View and manage all your documents
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Vault Features</ThemedText>
              <ThemedText style={styles.cardText}>
                📋 List all saved documents{'\n'}
                🔴 Expiry status color-coded{'\n'}
                🗑️ Delete documents{'\n'}
                📅 Shows: type, upload date, expiry date{'\n'}
                🔔 Expiry reminders (60/30/15/7/1 days)
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText type="subtitle">Phase 1 Status</ThemedText>
              <ThemedText style={styles.cardText}>
                ✅ Document List{'\n'}
                ✅ Status Color Coding{'\n'}
                ✅ Delete Functionality{'\n'}
                ✅ Expiry Notifications{'\n'}
                ⏳ TODO: Edit documents{'\n'}
                ⏳ TODO: View full details
              </ThemedText>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const tabs: { id: TabName; label: string }[] = [
    { id: 'loads', label: 'My Loads' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'scan', label: 'Smart Scan' },
    { id: 'vault', label: 'Vault' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Integra Vault</ThemedText>
        <ThemedText style={styles.subtitle}>Phase 1 Testing - Web</ThemedText>
      </View>

      <View style={styles.content}>{renderScreen()}</View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...tabButtonStyle,
              borderTopColor: activeTab === tab.id ? '#007AFF' : 'transparent',
            } as any}
            onClick={() => setActiveTab(tab.id)}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: activeTab === tab.id ? '600' : '500',
                color: activeTab === tab.id ? '#007AFF' : '#666',
              }}
            >
              {tab.label}
            </Text>
          </button>
        ))}
      </View>
    </ThemedView>
  );
}

const tabButtonStyle: any = {
  flex: 1,
  paddingVertical: 12,
  alignItems: 'center',
  justifyContent: 'center',
  borderTopWidth: 3,
  backgroundColor: '#0a0a0a',
  border: 'none',
  cursor: 'pointer',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    backgroundColor: '#000',
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  hero: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  heroTitle: {
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#e8f0fe',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#2a2a2a',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 24,
    color: '#ccc',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#0a0a0a',
  },
});

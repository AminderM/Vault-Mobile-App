import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import HomeScreen from '@/screens/HomeScreen';
import ScanRateConScreen from '@/screens/ScanRateConScreen';
import ScanReceiptScreen from '@/screens/ScanReceiptScreen';
import SmartScanScreen from '@/screens/SmartScanScreen';
import DocumentVaultScreen from '@/screens/DocumentVaultScreen';

type TabName = 'loads' | 'expenses' | 'scan' | 'vault';

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState<TabName>('loads');

  const renderScreen = () => {
    switch (activeTab) {
      case 'loads':
        return <HomeScreen />;
      case 'expenses':
        return <ScanReceiptScreen />;
      case 'scan':
        return <SmartScanScreen />;
      case 'vault':
        return <DocumentVaultScreen />;
      default:
        return <HomeScreen />;
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
        <ThemedText style={styles.subtitle}>Phase 1 Testing</ThemedText>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderScreen()}
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.tabButtonActive : {}),
            } as any}
            onClick={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.id && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </button>
        ))}
      </View>
    </ThemedView>
  );
}

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
  },
  contentContainer: {
    flexGrow: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#0a0a0a',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 3,
    borderTopColor: 'transparent',
    backgroundColor: '#0a0a0a',
    border: 'none',
    cursor: 'pointer',
  },
  tabButtonActive: {
    borderTopColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

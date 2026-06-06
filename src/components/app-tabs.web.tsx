import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import SmartScanScreen from '@/screens/SmartScanScreen';
import ExpenseScreen from '@/screens/ExpenseScreen';
import LoadsScreen from '@/screens/LoadsScreen';
import FilePickerScreen from '@/screens/FilePickerScreen';

type TabName = 'loads' | 'expenses' | 'scan' | 'vault';

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState<TabName>('loads');

  const renderScreen = () => {
    switch (activeTab) {
      case 'loads':
        return <LoadsScreen />;

      case 'expenses':
        return <ExpenseScreen />;

      case 'scan':
        return <SmartScanScreen />;

      case 'vault':
        return <FilePickerScreen />;

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

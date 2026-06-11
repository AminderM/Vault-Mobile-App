import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExpenseScreen from '@/screens/ExpenseScreen';
import DocumentVaultScreen from '@/screens/DocumentVaultScreen';
import HomeScreen from '@/screens/HomeScreen';
import LoadsScreen from '@/screens/LoadsScreen';
import SmartScanScreen from '@/screens/SmartScanScreen';
import { BRAND } from '@/lib/theme';

type TabName = 'loads' | 'vault' | 'scan' | 'finance' | 'fleet';

class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error('Screen error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Screen Error</Text>
          <Text style={styles.errorSubtitle}>
            This screen encountered an error. Try another tab.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState<TabName>('loads');

  const renderScreen = () => {
    switch (activeTab) {
      case 'loads':
        return (
          <ErrorBoundary>
            <HomeScreen />
          </ErrorBoundary>
        );

      case 'vault':
        return (
          <ErrorBoundary>
            <DocumentVaultScreen />
          </ErrorBoundary>
        );

      case 'scan':
        return (
          <ErrorBoundary>
            <SmartScanScreen />
          </ErrorBoundary>
        );

      case 'finance':
        return (
          <ErrorBoundary>
            <ExpenseScreen />
          </ErrorBoundary>
        );

      case 'fleet':
        return (
          <ErrorBoundary>
            <LoadsScreen />
          </ErrorBoundary>
        );

      default:
        return null;
    }
  };

  const tabs: { id: TabName; label: string; icon: string }[] = [
    { id: 'loads', label: 'Loads', icon: '📋' },
    { id: 'vault', label: 'Vault', icon: '🗄️' },
    { id: 'scan', label: 'Scan', icon: '📸' },
    { id: 'finance', label: 'Finance', icon: '📊' },
    { id: 'fleet', label: 'Fleet', icon: '%F0%9F%9A%9B' }, // 🚛 raw url encoding bypass or emoji
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>{renderScreen()}</View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isScan = tab.id === 'scan';

          // Decode 🚛 emoji safely
          const displayIcon = tab.icon.includes('%') ? decodeURIComponent(tab.icon) : tab.icon;

          if (isScan) {
            return (
              <Pressable
                key={tab.id}
                style={styles.scanTabContainer}
                onPress={() => setActiveTab('scan')}
                accessibilityRole="button"
                accessibilityLabel="Open Scan"
              >
                <View style={[styles.scanCircle, isActive && styles.scanCircleActive]}>
                  <Text style={styles.scanIcon}>{displayIcon}</Text>
                </View>
                <Text style={[styles.scanLabelText, isActive && styles.tabLabelActive]}>
                  {tab.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {displayIcon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#0A0A0C',
    borderTopWidth: 1.5,
    borderTopColor: '#221616',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ab8987',
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: '#ffb4ab',
    fontWeight: '700',
  },
  // Scan button styles (red circle)
  scanTabContainer: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12, // slightly raised
  },
  scanCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND.crimsonRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#5b1010',
  },
  scanCircleActive: {
    backgroundColor: '#CC1C24',
    borderColor: '#ffb4ab',
    transform: [{ scale: 1.05 }],
  },
  scanIcon: {
    fontSize: 22,
  },
  scanLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#ab8987',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorTitle: {
    color: '#f9dcda',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  errorSubtitle: {
    color: '#e4bebc',
    fontSize: 14,
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExpenseScreen from '@/screens/ExpenseScreen';
import DocumentVaultScreen from '@/screens/DocumentVaultScreen';
import HomeScreen from '@/screens/HomeScreen';
import LoadsScreen from '@/screens/LoadsScreen';
import SmartScanScreen from '@/screens/SmartScanScreen';
import SplashScreen from '@/screens/SplashScreen';
import { BRAND, useTheme, toggleTheme } from '@/lib/theme';

type TabName = 'loads' | 'vault' | 'scan' | 'finance' | 'fleet';

// High-fidelity custom vector drawings for the bottom tabs
function TruckIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', bottom: -3, left: 2, width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: -3, right: 3, width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: color }} />
      <View style={{ width: 14, height: 11, borderWidth: 1.8, borderColor: color, borderRadius: 1.5, marginRight: 1 }} />
      <View style={{ width: 6, height: 8, borderWidth: 1.8, borderColor: color, borderTopRightRadius: 3, borderBottomRightRadius: 1, borderLeftWidth: 0 }} />
    </View>
  );
}

function FolderIcon({ color, bg }: { color: string, bg: string }) {
  return (
    <View style={{ width: 24, height: 18, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 0, left: 2, width: 8, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
      <View style={{ width: 20, height: 13, borderWidth: 1.8, borderColor: color, borderRadius: 2, marginTop: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginBottom: 1 }} />
        <View style={{ width: 8, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

function ScanIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 26, height: 26, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 1, left: 1, width: 6, height: 6, borderLeftWidth: 1.8, borderTopWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', top: 1, right: 1, width: 6, height: 6, borderRightWidth: 1.8, borderTopWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, left: 1, width: 6, height: 6, borderLeftWidth: 1.8, borderBottomWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, right: 1, width: 6, height: 6, borderRightWidth: 1.8, borderBottomWidth: 1.8, borderColor: color }} />
      <View style={{ width: 10, height: 13, borderWidth: 1.8, borderColor: color, borderRadius: 1.5, justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
        <View style={{ width: 5, height: 1.5, backgroundColor: color }} />
        <View style={{ width: 5, height: 1.5, backgroundColor: color }} />
      </View>
    </View>
  );
}

function FinanceIcon({ color, bg }: { color: string, bg: string }) {
  return (
    <View style={{ width: 24, height: 18, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 0, left: 5, width: 16, height: 11, borderWidth: 1.5, borderColor: color, borderRadius: 1.5, transform: [{ rotate: '4deg' }], opacity: 0.6 }} />
      <View style={{ width: 18, height: 12, borderWidth: 1.8, borderColor: color, borderRadius: 2, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, borderWidth: 1.2, borderColor: color }} />
      </View>
    </View>
  );
}

function FleetIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 26, height: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
      <View style={{ alignItems: 'center', marginRight: -2, opacity: 0.8 }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 8, height: 5, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: color }} />
      </View>
      <View style={{ alignItems: 'center', zIndex: 10, marginBottom: 1 }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
        <View style={{ width: 11, height: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: color }} />
      </View>
      <View style={{ alignItems: 'center', marginLeft: -2, opacity: 0.8 }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 8, height: 5, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: color }} />
      </View>
    </View>
  );
}

function TabIcon({ id, color, bg }: { id: string; color: string; bg: string }) {
  switch (id) {
    case 'loads':
      return <TruckIcon color={color} />;
    case 'vault':
      return <FolderIcon color={color} bg={bg} />;
    case 'scan':
      return <ScanIcon color={color} />;
    case 'finance':
      return <FinanceIcon color={color} bg={bg} />;
    case 'fleet':
      return <FleetIcon color={color} />;
    default:
      return null;
  }
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode, t: any }, { hasError: boolean }> {
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
    const { t: T } = this.props;
    if (this.state.hasError) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: T.background.base }]}>
          <Text style={[styles.errorTitle, { color: T.text.primary }]}>⚠️ Screen Error</Text>
          <Text style={[styles.errorSubtitle, { color: T.text.secondary }]}>
            This screen encountered an error. Try another tab.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function AppTabs() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('loads');
  const { mode: themeMode, t: T } = useTheme();

  const renderScreen = () => {
    switch (activeTab) {
      case 'loads':
        return (
          <ErrorBoundary t={T}>
            <HomeScreen />
          </ErrorBoundary>
        );

      case 'vault':
        return (
          <ErrorBoundary t={T}>
            <DocumentVaultScreen />
          </ErrorBoundary>
        );

      case 'scan':
        return (
          <ErrorBoundary t={T}>
            <SmartScanScreen />
          </ErrorBoundary>
        );

      case 'finance':
        return (
          <ErrorBoundary t={T}>
            <ExpenseScreen />
          </ErrorBoundary>
        );

      case 'fleet':
        return (
          <ErrorBoundary t={T}>
            <LoadsScreen />
          </ErrorBoundary>
        );

      default:
        return null;
    }
  };

  const tabs: { id: TabName; label: string }[] = [
    { id: 'loads', label: 'Loads' },
    { id: 'vault', label: 'Vault' },
    { id: 'scan', label: 'Scan' },
    { id: 'finance', label: 'Finance' },
    { id: 'fleet', label: 'Fleet' },
  ];

  const renderThemeToggle = () => (
    <Pressable
      style={[
        styles.themeToggleBtn,
        {
          backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
          borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
        }
      ]}
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel="Toggle light/dark theme"
    >
      <Text style={styles.themeToggleIcon}>
        {themeMode === 'dark' ? '☀️' : '🌙'}
      </Text>
    </Pressable>
  );

  if (showSplash) {
    return (
      <View style={styles.flex1}>
        <SplashScreen onGetStarted={() => setShowSplash(false)} />
        {renderThemeToggle()}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.background.base }]} edges={['bottom']}>
      {renderThemeToggle()}

      <View style={[styles.content, { backgroundColor: T.background.base }]}>{renderScreen()}</View>

      <View style={[styles.tabBar, { backgroundColor: T.background.dark, borderTopColor: T.border.variant }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isScan = tab.id === 'scan';

          if (isScan) {
            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.scanTabContainer,
                  { marginTop: -18 }
                ]}
                onPress={() => setActiveTab('scan')}
                accessibilityRole="button"
                accessibilityLabel="Open Scan"
              >
                <View style={[
                  styles.scanSquare,
                  {
                    backgroundColor: T.primary,
                    borderColor: isActive ? '#ffb4ab' : '#5b1010',
                  }
                ]}>
                  <TabIcon id="scan" color="#ffffff" bg={T.primary} />
                  <Text style={styles.scanLabelText}>
                    SCAN
                  </Text>
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabButton,
                isActive && {
                  backgroundColor: T.primary,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }
              ]}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
            >
              <TabIcon id={tab.id} color={isActive ? '#ffffff' : T.text.muted} bg={isActive ? T.primary : T.background.dark} />
              <Text style={[
                styles.tabLabel,
                isActive ? { color: '#ffffff', fontWeight: '700' } : { color: T.text.muted }
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tabButton: {
    height: 50,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  scanTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanSquare: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    gap: 2,
  },
  scanLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  themeToggleBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  themeToggleIcon: {
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

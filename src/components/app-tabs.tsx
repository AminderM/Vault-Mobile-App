import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExpenseScreen from '@/screens/ExpenseScreen';
import DocumentVaultScreen from '@/screens/DocumentVaultScreen';
import HomeScreen from '@/screens/HomeScreen';
import LoadsScreen from '@/screens/LoadsScreen';
import SmartScanScreen from '@/screens/SmartScanScreen';
import SplashScreen from '@/screens/SplashScreen';
import { BRAND, useTheme, toggleTheme } from '@/lib/theme';
import { saveDocument } from '../lib/api';

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

function ToolsIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 8, height: 4, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 1.5, borderColor: color, borderBottomWidth: 0, marginBottom: -1 }} />
      <View style={{ width: 18, height: 11, borderWidth: 1.8, borderColor: color, borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 4, height: 3, backgroundColor: color, borderRadius: 0.5 }} />
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

// Subcomponent: Load Calculator
function LoadCalculator({ T, styles }: { T: any; styles: any }) {
  const [rate, setRate] = useState('');
  const [distance, setDistance] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [mpg, setMpg] = useState('6.2');
  const [accessorials, setAccessorials] = useState('');
  const [fees, setFees] = useState('');

  const rateVal = parseFloat(rate) || 0;
  const distVal = parseFloat(distance) || 0;
  const fuelPriceVal = parseFloat(fuelPrice) || 0;
  const mpgVal = parseFloat(mpg) || 6.2;
  const accVal = parseFloat(accessorials) || 0;
  const feesVal = parseFloat(fees) || 0;

  const grossRevenue = rateVal + accVal;
  const rpm = distVal > 0 ? (grossRevenue / distVal).toFixed(2) : '0.00';
  const fuelConsumed = mpgVal > 0 ? distVal / mpgVal : 0;
  const fuelCost = fuelConsumed * fuelPriceVal;
  const totalCost = fuelCost + feesVal;
  const netProfit = grossRevenue - totalCost;
  const cpm = distVal > 0 ? (totalCost / distVal).toFixed(2) : '0.00';
  const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputRow}>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>RATE AMOUNT ($)</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={rate}
            onChangeText={setRate}
            placeholder="e.g. 3500"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>DISTANCE (MILES)</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={distance}
            onChangeText={setDistance}
            placeholder="e.g. 1000"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>AVG FUEL PRICE ($/GAL)</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={fuelPrice}
            onChangeText={setFuelPrice}
            placeholder="e.g. 3.85"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>TRUCK MPG</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={mpg}
            onChangeText={setMpg}
            placeholder="e.g. 6.2"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>ACCESSORIALS ($)</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={accessorials}
            onChangeText={setAccessorials}
            placeholder="e.g. 150"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>TOLLS & FEES ($)</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={fees}
            onChangeText={setFees}
            placeholder="e.g. 80"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Calculations Summary Card */}
      <View style={[styles.calcSummaryCard, { backgroundColor: T.background.container, borderColor: T.border.variant }]}>
        <Text style={[styles.calcSummaryTitle, { color: T.text.primary }]}>Profitability Analysis</Text>
        <View style={styles.calcGrid}>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: T.text.secondary }]}>Gross Revenue:</Text>
            <Text style={[styles.calcValue, { color: BRAND.profitGreen }]}>${grossRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: T.text.secondary }]}>Revenue per Mile:</Text>
            <Text style={[styles.calcValue, { color: T.text.primary }]}>${rpm} / mi</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: T.text.secondary }]}>Est. Fuel Cost:</Text>
            <Text style={[styles.calcValue, { color: T.primary }]}>${fuelCost.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: T.text.secondary }]}>Total Expenses:</Text>
            <Text style={[styles.calcValue, { color: T.primary }]}>${totalCost.toFixed(2)}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: T.border.variant, marginVertical: 8 }} />
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabelBold, { color: T.text.primary }]}>NET PROFIT:</Text>
            <Text style={[styles.calcValueBold, { color: BRAND.profitGreen }]}>${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: T.text.secondary }]}>Cost per Mile (CPM):</Text>
            <Text style={[styles.calcValue, { color: T.text.primary }]}>${cpm} / mi</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: T.text.secondary }]}>Profit Margin:</Text>
            <Text style={[styles.calcValue, { color: BRAND.profitGreen }]}>{profitMargin}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Subcomponent: Invoice Generator
function InvoiceGenerator({ T, styles, onClose, setActiveTab }: { T: any; styles: any; onClose: () => void; setActiveTab: (tab: any) => void }) {
  const [loadId, setLoadId] = useState('');
  const [broker, setBroker] = useState('');
  const [rate, setRate] = useState('');
  const [surcharge, setSurcharge] = useState('');
  const [accessorials, setAccessorials] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const rateVal = parseFloat(rate) || 0;
  const surVal = parseFloat(surcharge) || 0;
  const accVal = parseFloat(accessorials) || 0;
  const totalAmount = rateVal + surVal + accVal;

  const handleSaveToVault = async () => {
    if (!loadId || !broker || !rate) {
      if (Platform.OS === 'web') {
        alert('Required Fields: Please fill in Load ID, Broker/Customer, and Base Rate.');
      } else {
        Alert.alert('Required Fields', 'Please fill in Load ID, Broker/Customer, and Base Rate.');
      }
      return;
    }

    try {
      setIsSaving(true);
      await saveDocument({
        docType: 'Invoice',
        expiryDate: null,
        description: `Invoice: ${loadId} • Broker: ${broker} • Amount: $${totalAmount.toLocaleString()}`,
        uploadedAt: new Date().toISOString(),
      });
      if (Platform.OS === 'web') {
        alert('Invoice generated and saved to Vault!');
        onClose();
        setActiveTab('vault');
      } else {
        Alert.alert('✅ Saved', 'Invoice generated and saved to Vault!', [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              setActiveTab('vault');
            },
          },
        ]);
      }
    } catch {
      if (Platform.OS === 'web') {
        alert('Error: Failed to save generated invoice to the Doc Vault.');
      } else {
        Alert.alert('Error', 'Failed to save generated invoice to the Doc Vault.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: T.text.secondary }]}>LOAD / REFERENCE ID</Text>
        <TextInput
          style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
          value={loadId}
          onChangeText={setLoadId}
          placeholder="e.g. L-94029-TX"
          placeholderTextColor={T.text.muted}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: T.text.secondary }]}>CUSTOMER / BROKER NAME</Text>
        <TextInput
          style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
          value={broker}
          onChangeText={setBroker}
          placeholder="e.g. CH Robinson"
          placeholderTextColor={T.text.muted}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>BASE RATE ($)</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={rate}
            onChangeText={setRate}
            placeholder="e.g. 2800"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputCell}>
          <Text style={[styles.inputLabel, { color: T.text.secondary }]}>FUEL SURCHARGE ($)</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
            value={surcharge}
            onChangeText={setSurcharge}
            placeholder="e.g. 450"
            placeholderTextColor={T.text.muted}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: T.text.secondary }]}>ACCESSORIALS / DETENTION ($)</Text>
        <TextInput
          style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
          value={accessorials}
          onChangeText={setAccessorials}
          placeholder="e.g. 150"
          placeholderTextColor={T.text.muted}
          keyboardType="numeric"
        />
      </View>

      {/* Invoice Preview Card */}
      <View style={[styles.invoicePreviewCard, { backgroundColor: T.background.card, borderColor: T.border.default }]}>
        <View style={{ borderBottomWidth: 1.5, borderBottomColor: T.border.default, paddingBottom: 8, marginBottom: 10 }}>
          <Text style={[styles.invoiceTitle, { color: T.text.primary }]}>INVOICE PREVIEW</Text>
          <Text style={[styles.invoiceText, { color: T.text.secondary }]}>Broker: {broker || '—'}</Text>
          <Text style={[styles.invoiceText, { color: T.text.secondary }]}>Ref ID: {loadId || '—'}</Text>
        </View>
        <View style={styles.invoiceItem}>
          <Text style={[styles.invoiceText, { color: T.text.secondary }]}>Freight Charges:</Text>
          <Text style={[styles.invoiceValue, { color: T.text.primary }]}>${rateVal.toLocaleString()}</Text>
        </View>
        <View style={styles.invoiceItem}>
          <Text style={[styles.invoiceText, { color: T.text.secondary }]}>Fuel Surcharge:</Text>
          <Text style={[styles.invoiceValue, { color: T.text.primary }]}>${surVal.toLocaleString()}</Text>
        </View>
        <View style={styles.invoiceItem}>
          <Text style={[styles.invoiceText, { color: T.text.secondary }]}>Accessorials:</Text>
          <Text style={[styles.invoiceValue, { color: T.text.primary }]}>${accVal.toLocaleString()}</Text>
        </View>
        <View style={{ height: 1.5, backgroundColor: T.border.default, marginVertical: 8 }} />
        <View style={styles.invoiceItem}>
          <Text style={[styles.invoiceTextBold, { color: T.text.primary }]}>TOTAL INVOICED:</Text>
          <Text style={[styles.invoiceValueBold, { color: BRAND.profitGreen }]}>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.saveToVaultBtn, { backgroundColor: T.primary }, pressed && { opacity: 0.8 }, isSaving && { opacity: 0.6 }]}
        onPress={handleSaveToVault}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel="Generate and save invoice"
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveToVaultBtnText}>✓ GENERATE & SAVE TO VAULT</Text>
        )}
      </Pressable>
    </View>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode; t: any }, { hasError: boolean }> {
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
  const [showTools, setShowTools] = useState(false);
  const [activeToolView, setActiveToolView] = useState<'hub' | 'calculator' | 'invoices'>('hub');
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

  const renderToolsButton = () => (
    <Pressable
      style={[
        styles.toolsBtn,
        {
          backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
          borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
        }
      ]}
      onPress={() => {
        setShowTools(true);
        setActiveToolView('hub');
      }}
      accessibilityRole="button"
      accessibilityLabel="Open Tools Hub"
    >
      <ToolsIcon color={themeMode === 'dark' ? '#f9dcda' : '#221515'} />
    </Pressable>
  );

  const renderToolsHub = () => {
    const utilityTools = [
      {
        id: 'calculator',
        title: 'Load Calculator',
        desc: 'Calculate trip profit, CPM, RPM, and profit margins.',
        icon: '🧮',
        action: () => setActiveToolView('calculator'),
      },
      {
        id: 'invoices',
        title: 'Invoices Generator',
        desc: 'Generate, preview, and save load invoices to the vault.',
        icon: '📋',
        action: () => setActiveToolView('invoices'),
      },
      {
        id: 'loads',
        title: 'Load Management',
        desc: 'Access the load marketplace and active assignments.',
        icon: '🚛',
        action: () => {
          setActiveTab('fleet');
          setShowTools(false);
        },
      },
      {
        id: 'vault',
        title: 'Doc Vault',
        desc: 'Manage and review scanned driver documents.',
        icon: '🗄️',
        action: () => {
          setActiveTab('vault');
          setShowTools(false);
        },
      },
      {
        id: 'expenses',
        title: 'Expenses',
        desc: 'Review operational expenditures and fuel stops.',
        icon: '🧾',
        action: () => {
          setActiveTab('finance');
          setShowTools(false);
        },
      },
      {
        id: 'pnl',
        title: 'P&L View',
        desc: 'Track long-term revenue and business metrics.',
        icon: '📊',
        action: () => {
          setActiveTab('finance');
          setShowTools(false);
        },
      },
    ];

    return (
      <View style={styles.toolsGrid}>
        {utilityTools.map((tool) => (
          <Pressable
            key={tool.id}
            style={({ pressed }) => [
              styles.toolCard,
              { backgroundColor: T.background.card, borderColor: T.border.variant },
              pressed && { opacity: 0.8 },
            ]}
            onPress={tool.action}
            accessibilityRole="button"
            accessibilityLabel={`Open ${tool.title}`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Text style={{ fontSize: 24 }}>{tool.icon}</Text>
              <Text style={[styles.toolTitle, { color: T.text.primary }]}>{tool.title}</Text>
            </View>
            <Text style={[styles.toolDesc, { color: T.text.secondary }]}>{tool.desc}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderToolsScreen = () => {
    if (!showTools) return null;

    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 2000, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[styles.modalContent, { backgroundColor: T.background.base, borderColor: T.border.variant }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: T.text.primary }]}>
              {activeToolView === 'hub' && 'Integra Utility Suite'}
              {activeToolView === 'calculator' && 'Load Profit Calculator'}
              {activeToolView === 'invoices' && 'Invoice Generator'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {activeToolView !== 'hub' && (
                <Pressable
                  style={styles.backBtn}
                  onPress={() => setActiveToolView('hub')}
                  accessibilityRole="button"
                  accessibilityLabel="Back to tools list"
                >
                  <Text style={{ color: T.primary, fontWeight: '700', fontSize: 13 }}>← BACK</Text>
                </Pressable>
              )}
              <Pressable
                style={styles.closeBtn}
                onPress={() => setShowTools(false)}
                accessibilityRole="button"
                accessibilityLabel="Close tools hub"
              >
                <Text style={{ color: T.text.secondary, fontWeight: '700', fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* Sub Views Content */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {activeToolView === 'hub' && renderToolsHub()}
            {activeToolView === 'calculator' && <LoadCalculator T={T} styles={styles} />}
            {activeToolView === 'invoices' && <InvoiceGenerator T={T} styles={styles} onClose={() => setShowTools(false)} setActiveTab={setActiveTab} />}
          </ScrollView>
        </View>
      </View>
    );
  };

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
      {renderToolsButton()}
      {renderToolsScreen()}

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
  toolsBtn: {
    position: 'absolute',
    top: 16,
    right: 60,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
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

  // Tools Overlay
  modalContent: {
    width: '92%',
    maxWidth: 500,
    height: '84%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(128,128,128,0.2)',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  toolsGrid: {
    gap: 12,
  },
  toolCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolDesc: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Interactive forms
  formContainer: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCell: {
    flex: 1,
    gap: 6,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  calcSummaryCard: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  calcSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  calcGrid: {
    gap: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 13,
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  calcLabelBold: {
    fontSize: 14,
    fontWeight: '700',
  },
  calcValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  invoicePreviewCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  invoiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  invoiceText: {
    fontSize: 12,
  },
  invoiceTextBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  invoiceValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceValueBold: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveToVaultBtn: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveToVaultBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

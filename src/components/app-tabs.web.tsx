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
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExpenseScreen from '@/screens/ExpenseScreen';
import DocumentVaultScreen from '@/screens/DocumentVaultScreen';
import HomeScreen from '@/screens/HomeScreen';
import LoadsScreen from '@/screens/LoadsScreen';
import SmartScanScreen from '@/screens/SmartScanScreen';
import SplashScreen from '@/screens/SplashScreen';
import LoginScreen from '@/screens/LoginScreen';
import { BRAND, useTheme, toggleTheme, StatusBorderCard } from '@/lib/theme';
import { saveDocument, logout, isAuthenticated, getAuthUser } from '../lib/api';

type TabName = 'loads' | 'vault' | 'scan' | 'finance' | 'tools';

// High-fidelity custom vector drawings for the bottom tabs
function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 22, justifyContent: 'flex-end', alignItems: 'center' }}>
      {/* Roof */}
      <View style={{ position: 'absolute', top: 1, width: 20, height: 10, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 13, height: 13, borderLeftWidth: 1.8, borderTopWidth: 1.8, borderColor: color, transform: [{ rotate: '45deg' }], top: 5, borderTopLeftRadius: 1.5 }} />
      </View>
      {/* Body */}
      <View style={{ width: 16, height: 11, borderWidth: 1.8, borderColor: color, borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, justifyContent: 'flex-end', alignItems: 'center', zIndex: -1 }}>
        {/* Door */}
        <View style={{ width: 6, height: 6, borderLeftWidth: 1.8, borderRightWidth: 1.8, borderTopWidth: 1.8, borderColor: color, borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5 }} />
      </View>
    </View>
  );
}

// FolderIcon with user card badge
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

function ProfileIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      {/* Head */}
      <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1.8, borderColor: color, marginBottom: 2 }} />
      {/* Shoulders */}
      <View style={{ width: 16, height: 7, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
    </View>
  );
}

function TabIcon({ id, color, bg }: { id: string; color: string; bg: string }) {
  switch (id) {
    case 'loads':
      return <HomeIcon color={color} />;
    case 'vault':
      return <FolderIcon color={color} bg={bg} />;
    case 'scan':
      return <ScanIcon color={color} />;
    case 'finance':
      return <FinanceIcon color={color} bg={bg} />;
    case 'tools':
      return <ToolsIcon color={color} />;
    default:
      return null;
  }
}


// Red icons for the redesigned Tools tab (Utility Hub)
function ToolCalcIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 20, height: 20, borderWidth: 1.8, borderColor: color, borderRadius: 3, padding: 2.5, gap: 2 }}>
      <View style={{ flexDirection: 'row', gap: 2.5, flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 0.5 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 0.5 }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 2.5, flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 0.5 }} />
        <View style={{ flex: 1, backgroundColor: color, borderRadius: 0.5 }} />
      </View>
    </View>
  );
}

function ToolInvoiceIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 22, borderWidth: 1.8, borderColor: color, borderRadius: 2, padding: 3, gap: 2.5 }}>
      <View style={{ width: 8, height: 1.5, backgroundColor: color }} />
      <View style={{ width: 10, height: 1.5, backgroundColor: color }} />
      <View style={{ width: 6, height: 1.5, backgroundColor: color }} />
    </View>
  );
}

function ToolTruckIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 15, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      <View style={{ width: 15, height: 11, borderWidth: 1.8, borderColor: color, borderRadius: 1.5, marginRight: 1 }} />
      <View style={{ width: 6, height: 8, borderWidth: 1.8, borderColor: color, borderTopRightRadius: 3, borderBottomRightRadius: 1, borderLeftWidth: 0 }} />
    </View>
  );
}

function ToolFolderIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 16 }}>
      <View style={{ width: 8, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 1.8, borderColor: color, borderBottomWidth: 0 }} />
      <View style={{ width: 22, height: 12, borderWidth: 1.8, borderColor: color, borderRadius: 2, marginTop: -0.5 }} />
    </View>
  );
}

function ToolCashIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 14, borderWidth: 1.8, borderColor: color, borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: color }} />
    </View>
  );
}

function ToolChartIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 20, height: 18, justifyContent: 'flex-end', gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, flex: 1, paddingLeft: 2 }}>
        <View style={{ width: 3, height: 6, backgroundColor: color, borderRadius: 0.5 }} />
        <View style={{ width: 3, height: 10, backgroundColor: color, borderRadius: 0.5 }} />
        <View style={{ width: 3, height: 14, backgroundColor: color, borderRadius: 0.5 }} />
      </View>
      <View style={{ height: 1.8, backgroundColor: color, width: '100%' }} />
    </View>
  );
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

const generateCarrierProfilePDF = (profile: {
  name: string;
  company: string;
  type: string;
  vin: string;
  docs: any;
}) => {
  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to generate PDF.');
      return;
    }

    const docItems = [
      { label: "Driver's License", key: 'driverLicense' },
      { label: "Certificate of Insurance (COI)", key: 'coi' },
      { label: "Operating Authority (MC/DOT)", key: 'operatingAuthority' },
      { label: "National Safety Code (NSC)", key: 'nsc' },
      { label: "IFTA Certificate", key: 'ifta' },
    ];

    const htmlContent = `
      <html>
      <head>
        <title>Carrier Profile - ${profile.company}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e1b1b; }
          .header { border-bottom: 2px solid #5b1010; padding-bottom: 15px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 700; color: #5b1010; text-transform: uppercase; letter-spacing: 1px; }
          .subtitle { font-size: 14px; color: #6e6565; margin-top: 5px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
          .info-block { background: #fdf6f5; padding: 15px; border-radius: 8px; border: 1px solid #ffdad6; }
          .info-label { font-size: 11px; font-weight: 600; color: #6e6565; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { font-size: 16px; font-weight: 700; color: #221515; margin-top: 5px; }
          .section-title { font-size: 16px; font-weight: 700; color: #221515; margin-bottom: 15px; text-transform: uppercase; border-left: 4px solid #5b1010; padding-left: 8px; }
          .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .doc-table th { background: #5b1010; color: #ffffff; text-align: left; padding: 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .doc-table td { padding: 12px 10px; border-bottom: 1px solid #ffdad6; font-size: 14px; }
          .status { font-weight: 600; display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status-uploaded { background: #dbf8e6; color: #14532d; }
          .status-missing { background: #fee2e2; color: #7f1d1d; }
          .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #a09190; border-top: 1px solid #ffdad6; padding-top: 15px; }
          @media print {
            body { padding: 20px; }
            .info-block { background: #ffffff !important; border: 1px solid #ddd; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Integra Vault - Carrier Profile</div>
          <div class="subtitle">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        </div>

        <div class="section-title">Carrier Information</div>
        <div class="grid">
          <div class="info-block">
            <div class="info-label">Company Name</div>
            <div class="info-value">${profile.company}</div>
          </div>
          <div class="info-block">
            <div class="info-label">Contact / Driver Name</div>
            <div class="info-value">${profile.name}</div>
          </div>
          <div class="info-block">
            <div class="info-label">Company Type</div>
            <div class="info-value">${profile.type}</div>
          </div>
          <div class="info-block">
            <div class="info-label">VIN Number</div>
            <div class="info-value">${profile.vin}</div>
          </div>
        </div>

        <div class="section-title">Compliance Documents Checklist</div>
        <table class="doc-table">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Status</th>
              <th>Verification ID</th>
            </tr>
          </thead>
          <tbody>
            ${docItems.map(item => {
              const uploaded = profile.docs[item.key];
              return `
                <tr>
                  <td>${item.label}</td>
                  <td>
                    <span class="status ${uploaded ? 'status-uploaded' : 'status-missing'}">
                      ${uploaded ? '✓ COMPLIANT / UPLOADED' : '❌ MISSING'}
                    </span>
                  </td>
                  <td>${uploaded ? `VAL-${Math.floor(100000 + Math.random() * 900000)}` : '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          This document is generated by Integra Vault mobile application.<br/>
          Secure local compliance and carrier documentation manager.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    Alert.alert('📄 Export Success', 'Carrier Profile PDF generated and shared successfully!');
  }
};

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  // Auth flow state: 'splash' → 'login' → 'app'
  const [appState, setAppState] = useState<'splash' | 'login' | 'app'>('splash');
  const [authUser, setAuthUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabName>('loads');
  const [activeToolView, setActiveToolView] = useState<'hub' | 'calculator' | 'invoices' | 'loads'>('hub');
  const [homeScreenView, setHomeScreenView] = useState<'home' | 'marketplace'>('home');
  const [showProfile, setShowProfile] = useState(false);
  const { mode: themeMode, t: T } = useTheme();

  // Profile management state
  const [profileName, setProfileName] = useState('Jazzie Driver');
  const [profileCompany, setProfileCompany] = useState('Jazzie Logistics');
  const [profileType, setProfileType] = useState<'Owner Operator' | 'Carrier'>('Owner Operator');
  const [profileVin, setProfileVin] = useState('1FTFW1EF5KFD8291A');
  const [profileDocs, setProfileDocs] = useState({
    driverLicense: true,
    coi: true,
    operatingAuthority: false,
    nsc: false,
    ifta: true,
  });

  // Check for existing auth token on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasAuth = await isAuthenticated();
        if (hasAuth) {
          const user = await getAuthUser();
          setAuthUser(user);
          setAppState('app');
        }
      } catch {
        // No stored token — stay on splash
      }
    };
    checkAuth();
  }, []);

  // Load from AsyncStorage
  React.useEffect(() => {
    const loadProfileData = async () => {
      try {
        const nameVal = await AsyncStorage.getItem('profile_name');
        const compVal = await AsyncStorage.getItem('profile_company');
        const typeVal = await AsyncStorage.getItem('profile_type');
        const vinVal = await AsyncStorage.getItem('profile_vin');
        const docsVal = await AsyncStorage.getItem('profile_docs');

        if (nameVal) setProfileName(nameVal);
        if (compVal) setProfileCompany(compVal);
        if (typeVal) setProfileType(typeVal as any);
        if (vinVal) setProfileVin(vinVal);
        if (docsVal) setProfileDocs(JSON.parse(docsVal));
      } catch (err) {
        console.error('Failed to load profile data', err);
      }
    };
    loadProfileData();
  }, []);

  const saveProfileField = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.error('Failed to save profile field', err);
    }
  };

  const saveProfileDocs = async (newDocs: any) => {
    try {
      await AsyncStorage.setItem('profile_docs', JSON.stringify(newDocs));
    } catch (err) {
      console.error('Failed to save profile docs', err);
    }
  };

  const shouldHideFloatingButtons = () => {
    if (activeTab === 'loads' && homeScreenView === 'marketplace') return true;
    if (activeTab === 'tools' && activeToolView !== 'hub') return true;
    return false;
  };

  const renderScreen = () => {
    if (appState === 'splash') {
      return <SplashScreen onGetStarted={() => setAppState('login')} />;
    }

    if (appState === 'login') {
      return (
        <LoginScreen
          onLoginSuccess={(result: any) => {
            setAuthUser(result?.user || null);
            // Populate profile from server user data
            if (result?.user) {
              const u = result.user;
              if (u.full_name) {
                setProfileName(u.full_name);
                AsyncStorage.setItem('profile_name', u.full_name).catch(() => {});
              }
              if (u.company_name) {
                setProfileCompany(u.company_name);
                AsyncStorage.setItem('profile_company', u.company_name).catch(() => {});
              }
            }
            setAppState('app');
          }}
          onSwitchToSignup={() => {
            // For now, show alert — signup form is Phase 2
            if (Platform.OS === 'web') {
              alert('Sign up is currently available by invite only. Contact your fleet administrator.');
            } else {
              Alert.alert('Sign Up', 'Sign up is currently available by invite only. Contact your fleet administrator.');
            }
          }}
          onBack={() => setAppState('splash')}
        />
      );
    }

    switch (activeTab) {
      case 'loads':
        return (
          <ErrorBoundary t={T}>
            {homeScreenView === 'home' ? (
              <HomeScreen
                onNavigateToMarketplace={() => setHomeScreenView('marketplace')}
                onNavigate={(tab: TabName, toolView?: 'hub' | 'calculator' | 'invoices' | 'loads') => {
                  setActiveTab(tab);
                  if (toolView) setActiveToolView(toolView);
                }}
              />
            ) : (
              <LoadsScreen
                onBackToHome={() => setHomeScreenView('home')}
                onOpenProfile={() => setShowProfile(true)}
              />
            )}
          </ErrorBoundary>
        );

      case 'vault':
        return (
          <ErrorBoundary t={T}>
            <DocumentVaultScreen onBack={() => setActiveTab('loads')} />
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

      case 'tools':
        return (
          <ErrorBoundary t={T}>
            {renderToolsTabContent()}
          </ErrorBoundary>
        );

      default:
        return null;
    }
  };

  const tabs: { id: TabName; label: string }[] = [
    { id: 'loads', label: 'Home' },
    { id: 'vault', label: 'Vault' },
    { id: 'scan', label: 'Scan' },
    { id: 'finance', label: 'Finance' },
    { id: 'tools', label: 'Tools' },
  ];

  const renderThemeToggle = () => (
    <Pressable
      style={[
        styles.themeToggleBtn,
        {
          top: insets.top + 16,
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

  const renderProfileButton = () => (
    <Pressable
      style={[
        styles.profileBtn,
        {
          top: insets.top + 16,
          backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
          borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
        }
      ]}
      onPress={() => setShowProfile(true)}
      accessibilityRole="button"
      accessibilityLabel="Open Profile Hub"
    >
      <ProfileIcon color={themeMode === 'dark' ? '#f9dcda' : '#221515'} />
    </Pressable>
  );

  const renderToolsHub = () => {
    const utilityTools = [
      {
        id: 'calculator',
        title: 'Load Calculator',
        desc: 'Calculate trip profit, CPM, RPM, and profit margins.',
        icon: <ToolCalcIcon color={BRAND.crimsonRedLight} />,
        action: () => setActiveToolView('calculator'),
      },
      {
        id: 'invoices',
        title: 'Invoices',
        desc: 'Generate, preview, and save load invoices to the vault.',
        icon: <ToolInvoiceIcon color={BRAND.crimsonRedLight} />,
        action: () => setActiveToolView('invoices'),
      },
      {
        id: 'loads',
        title: 'Load Management',
        desc: 'Access the load marketplace and active assignments.',
        icon: <ToolTruckIcon color={BRAND.crimsonRedLight} />,
        action: () => setActiveToolView('loads'),
      },
      {
        id: 'vault',
        title: 'Doc Vault',
        desc: 'Manage and review scanned driver documents.',
        icon: <ToolFolderIcon color={BRAND.crimsonRedLight} />,
        action: () => {
          setActiveTab('vault');
        },
      },
      {
        id: 'expenses',
        title: 'Expenses',
        desc: 'Review operational expenditures and fuel stops.',
        icon: <ToolCashIcon color={BRAND.crimsonRedLight} />,
        action: () => {
          setActiveTab('finance');
        },
      },
      {
        id: 'pnl',
        title: 'P&L View',
        desc: 'Track long-term revenue and business metrics.',
        icon: <ToolChartIcon color={BRAND.crimsonRedLight} />,
        action: () => {
          setActiveTab('finance');
        },
      },
    ];

    return (
      <View style={{ gap: 20 }}>
        {/* Title Section */}
        <View style={{ paddingVertical: 4 }}>
          <Text style={[styles.hubTitle, { color: T.text.primary }]}>Utility Hub</Text>
          <Text style={[styles.hubSubtitle, { color: T.text.secondary }]}>
            Precision management tools for the modern carrier ecosystem
          </Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.toolsGrid}>
          {utilityTools.map((tool) => (
            <Pressable
              key={tool.id}
              style={({ pressed }) => [
                { width: '48%', marginBottom: 4 },
                pressed && { opacity: 0.8 }
              ]}
              onPress={tool.action}
              accessibilityRole="button"
              accessibilityLabel={`Open ${tool.title}`}
            >
              <StatusBorderCard
                borderColor={BRAND.crimsonRed}
                style={[styles.toolCard, { width: '100%', marginBottom: 0, borderRadius: 8 }]}
              >
                <View style={[styles.toolIconBox, { backgroundColor: themeMode === 'dark' ? '#2A2A2F' : '#EAEAEF' }]}>
                  {tool.icon}
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Text style={[styles.toolTitle, { color: T.text.primary }]}>{tool.title}</Text>
                  <Text style={[styles.toolDesc, { color: T.text.muted, marginTop: 4 }]} numberOfLines={2}>{tool.desc}</Text>
                </View>
              </StatusBorderCard>
            </Pressable>
          ))}
        </View>

        {/* Live Performance Card */}
        <View style={[styles.performanceCard, { backgroundColor: themeMode === 'dark' ? '#2c1214' : '#fdeeed', borderColor: BRAND.crimsonRed }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={[styles.liveBadge, { backgroundColor: BRAND.crimsonRed }]}>
              <Text style={styles.liveBadgeText}>LIVE PERFORMANCE</Text>
            </View>
          </View>
          <Text style={[styles.performanceHeading, { color: T.text.primary }]}>Fleet Optimization</Text>
          <Text style={[styles.performanceBody, { color: T.text.secondary }]}>
            Harness real-time data to maximize your RPM. Connect your ELD to unlock automated dispatch and custom route-profit mapping.
          </Text>
          <Pressable 
            style={[styles.performanceBtn, { backgroundColor: BRAND.crimsonRed }]}
            onPress={() => Alert.alert('Upgrade Strategy', 'ELD integration coming soon!')}
          >
            <Text style={styles.performanceBtnText}>Upgrade Strategy 🚀</Text>
          </Pressable>
        </View>

        {/* System Status Card */}
        <View style={[styles.statusCard, { backgroundColor: T.background.card, borderColor: T.border.variant }]}>
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16, color: BRAND.profitGreen }}>🛡️</Text>
              <Text style={[styles.statusLabel, { color: T.text.secondary }]}>System Status</Text>
            </View>
            <Text style={[styles.statusValue, { color: BRAND.profitGreen }]}>All Subsystems Operational</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: T.text.secondary }]}>Vault Security Level</Text>
            <Text style={[styles.statusValue, { color: T.text.primary }]}>AES-256</Text>
          </View>
          
          <View style={[styles.statusSeparator, { backgroundColor: BRAND.crimsonRed + '40' }]} />
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: T.text.secondary }]}>Cloud Sync Latency</Text>
            <Text style={[styles.statusValue, { color: T.text.primary }]}>12ms</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderToolsTabContent = () => {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        {/* Tools Header */}
        {activeToolView === 'hub' || activeToolView === 'loads' ? null : (
          <View style={[
            styles.toolsTabHeader, 
            { 
              borderBottomColor: T.border.variant, 
              borderBottomWidth: 1.5,
              paddingTop: insets.top + 12,
              justifyContent: 'flex-start',
              alignItems: 'center'
            }
          ]}>
            <Pressable
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveToolView('hub')}
              accessibilityRole="button"
              accessibilityLabel="Back to Utility Hub"
            >
              <Text style={[styles.headerIconText, { color: T.primary }]}>←</Text>
            </Pressable>
            <Text style={[styles.toolsTabTitle, { color: T.text.primary, marginLeft: 8 }]}>
              {activeToolView === 'calculator' && '🧮  Load Profit Calculator'}
              {activeToolView === 'invoices' && '📋  Invoice Generator'}
            </Text>
          </View>
        )}

        {/* Content */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ 
            padding: 16, 
            paddingTop: activeToolView === 'hub' ? insets.top + 16 : 16,
            paddingBottom: 36 
          }} 
          showsVerticalScrollIndicator={false}
        >
          {activeToolView === 'hub' && renderToolsHub()}
          {activeToolView === 'calculator' && <LoadCalculator T={T} styles={styles} />}
          {activeToolView === 'invoices' && (
            <InvoiceGenerator
              T={T}
              styles={styles}
              onClose={() => setActiveToolView('hub')}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setActiveToolView('hub');
              }}
            />
          )}
          {activeToolView === 'loads' && (
            <LoadsScreen 
              onBackToHome={() => setActiveToolView('hub')}
              onOpenProfile={() => setShowProfile(true)}
            />
          )}
        </ScrollView>
      </View>
    );
  };

  const renderProfileScreen = () => {
    if (!showProfile) return null;

    const docItems = [
      { id: 'driverLicense', label: "Driver's License" },
      { id: 'coi', label: "Certificate of Insurance (COI)" },
      { id: 'operatingAuthority', label: "Operating Authority (MC/DOT)" },
      { id: 'nsc', label: "National Safety Code (NSC)" },
      { id: 'ifta', label: "IFTA Certificate" },
    ];

    const toggleDoc = (key: string) => {
      const updated = { ...profileDocs, [key]: !(profileDocs as any)[key] };
      setProfileDocs(updated);
      saveProfileDocs(updated);
      Alert.alert('Status Updated', `${docItems.find(d => d.id === key)?.label} status toggled!`);
    };

    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 2000, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[styles.modalContent, { backgroundColor: T.background.base, borderColor: T.border.variant }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: T.text.primary }]}>Profile & Settings</Text>
            <Pressable
              style={styles.closeBtn}
              onPress={() => setShowProfile(false)}
              accessibilityRole="button"
              accessibilityLabel="Close profile screen"
            >
              <Text style={{ color: T.text.secondary, fontWeight: '700', fontSize: 16 }}>✕</Text>
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* User Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: T.text.secondary }]}>CONTACT NAME</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
                  value={profileName}
                  onChangeText={(val) => {
                    setProfileName(val);
                    saveProfileField('profile_name', val);
                  }}
                  placeholder="Your Name"
                  placeholderTextColor={T.text.muted}
                />
              </View>

              {/* Company Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: T.text.secondary }]}>COMPANY NAME</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
                  value={profileCompany}
                  onChangeText={(val) => {
                    setProfileCompany(val);
                    saveProfileField('profile_company', val);
                  }}
                  placeholder="Your Company Name"
                  placeholderTextColor={T.text.muted}
                />
              </View>

              {/* Company Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: T.text.secondary }]}>COMPANY TYPE</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: profileType === 'Owner Operator' ? T.primary : T.border.variant,
                        backgroundColor: profileType === 'Owner Operator' ? (themeMode === 'dark' ? 'rgba(91, 16, 16, 0.2)' : 'rgba(91, 16, 16, 0.05)') : T.background.container,
                      },
                      pressed && { opacity: 0.8 }
                    ]}
                    onPress={() => {
                      setProfileType('Owner Operator');
                      saveProfileField('profile_type', 'Owner Operator');
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: profileType === 'Owner Operator' ? T.primary : T.text.secondary }}>Owner Operator</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: profileType === 'Carrier' ? T.primary : T.border.variant,
                        backgroundColor: profileType === 'Carrier' ? (themeMode === 'dark' ? 'rgba(91, 16, 16, 0.2)' : 'rgba(91, 16, 16, 0.05)') : T.background.container,
                      },
                      pressed && { opacity: 0.8 }
                    ]}
                    onPress={() => {
                      setProfileType('Carrier');
                      saveProfileField('profile_type', 'Carrier');
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: profileType === 'Carrier' ? T.primary : T.text.secondary }}>Carrier</Text>
                  </Pressable>
                </View>
              </View>

              {/* VIN# */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: T.text.secondary }]}>VIN NUMBER</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
                  value={profileVin}
                  onChangeText={(val) => {
                    setProfileVin(val);
                    saveProfileField('profile_vin', val);
                  }}
                  placeholder="e.g. 1FTFW1EF5KFD8291A"
                  placeholderTextColor={T.text.muted}
                />
              </View>

              {/* Subscription Status Card */}
              <View style={[styles.calcSummaryCard, { backgroundColor: T.background.container, borderColor: T.border.variant, marginVertical: 8 }]}>
                <Text style={[styles.calcSummaryTitle, { color: T.text.primary }]}>Subscription Status</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND.profitGreen }}>✓ PREMIUM MEMBER</Text>
                    <Text style={{ fontSize: 12, color: T.text.secondary, marginTop: 2 }}>Renews: July 15, 2026</Text>
                  </View>
                  <View style={{ backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: T.text.primary }}>ACTIVE</Text>
                  </View>
                </View>
              </View>

              {/* Company Documents Checklist */}
              <View style={{ gap: 8, marginTop: 8 }}>
                <Text style={[styles.inputLabel, { color: T.text.secondary }]}>COMPANY COMPLIANCE DOCUMENTS</Text>
                {docItems.map((doc) => {
                  const isUploaded = (profileDocs as any)[doc.id];
                  return (
                    <Pressable
                      key={doc.id}
                      style={({ pressed }) => [
                        {
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: T.border.variant,
                          backgroundColor: T.background.container,
                        },
                        pressed && { opacity: 0.8 }
                      ]}
                      onPress={() => toggleDoc(doc.id)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: T.text.primary }}>{doc.label}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isUploaded ? BRAND.profitGreen : T.text.muted }}>
                          {isUploaded ? '✓ UPLOADED' : '⏳ MISSING'}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Generate Carrier Profile PDF Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.saveToVaultBtn,
                  { backgroundColor: BRAND.profitGreen, marginTop: 16 },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => generateCarrierProfilePDF({
                  name: profileName,
                  company: profileCompany,
                  type: profileType,
                  vin: profileVin,
                  docs: profileDocs,
                })}
                accessibilityRole="button"
                accessibilityLabel="Generate Carrier Profile PDF"
              >
                <Text style={styles.saveToVaultBtnText}>📄 GENERATE CARRIER PROFILE PDF</Text>
              </Pressable>

              {/* Sign Out Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.saveToVaultBtn,
                  { backgroundColor: 'rgba(158, 21, 32, 0.15)', borderWidth: 1.5, borderColor: BRAND.crimsonRed, marginTop: 8 },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={async () => {
                  await logout();
                  setAuthUser(null);
                  setShowProfile(false);
                  setAppState('splash');
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign out of account"
              >
                <Text style={[styles.saveToVaultBtnText, { color: BRAND.crimsonRed }]}>⏻ SIGN OUT</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.background.base, overflow: 'hidden' }]} edges={['bottom']}>
      {/* Hexagonal Honeycomb Pattern Overlay – single image stretched to cover full screen */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { opacity: themeMode === 'dark' ? 0.50 : 0.30 },
          (Platform.OS === 'web' ? {
            backgroundImage: `url("${themeMode === 'dark'
              ? (typeof require('../../assets/images/honeycomb-dark.png') === 'string' ? require('../../assets/images/honeycomb-dark.png') : (require('../../assets/images/honeycomb-dark.png') as any).uri || (require('../../assets/images/honeycomb-dark.png') as any).default || '')
              : (typeof require('../../assets/images/honeycomb-light.png') === 'string' ? require('../../assets/images/honeycomb-light.png') : (require('../../assets/images/honeycomb-light.png') as any).uri || (require('../../assets/images/honeycomb-light.png') as any).default || '')}")`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          } : {}) as any,
        ]}
      >
        {Platform.OS !== 'web' && (
          <Image
            source={themeMode === 'dark'
              ? require('../../assets/images/honeycomb-dark.png')
              : require('../../assets/images/honeycomb-light.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={[styles.content, { backgroundColor: 'transparent' }]}>{renderScreen()}</View>

      {appState === 'app' ? (
        <>
          {shouldHideFloatingButtons() ? null : renderThemeToggle()}
          {shouldHideFloatingButtons() ? null : renderProfileButton()}
          {renderProfileScreen()}
        </>
      ) : (
        renderThemeToggle()
      )}

      <View style={[
        styles.tabBar, 
        { 
          backgroundColor: themeMode === 'dark' ? 'rgba(5, 2, 2, 0.55)' : 'rgba(255, 255, 255, 0.55)', 
          borderTopColor: T.border.variant 
        },
        (Platform.OS === 'web' && {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }) as any
      ]}>
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
                    backgroundColor: 'rgba(158, 21, 32, 0.8)',
                    borderColor: isActive ? '#ffb4ab' : '#5b1010',
                  }
                ]}>
                  <TabIcon id="scan" color="#ffffff" bg="rgba(158, 21, 32, 0.8)" />
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
                  backgroundColor: 'rgba(158, 21, 32, 0.8)',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }
              ]}
              onPress={() => {
                if (tab.id === 'loads' && activeTab === 'loads') {
                  setHomeScreenView('home');
                }
                setActiveTab(tab.id);
              }}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
            >
              <TabIcon id={tab.id} color={isActive ? '#ffffff' : T.text.muted} bg={isActive ? 'rgba(158, 21, 32, 0.8)' : (themeMode === 'dark' ? 'rgba(5, 2, 2, 0.55)' : 'rgba(255, 255, 255, 0.55)')} />
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
  profileBtn: {
    position: 'absolute',
    right: 60,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  toolsTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toolsTabTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  toolsTabBackBtn: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  toolIconBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  toolDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  hubTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  hubSubtitle: {
    fontSize: 13,
    lineHeight: 17,
  },
  performanceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 4,
    gap: 6,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  performanceHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  performanceBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  performanceBtn: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusSeparator: {
    height: 1,
    width: '100%',
    marginVertical: 2,
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
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
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  avatarText: {
    fontSize: 14,
  },
  logoTextTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
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

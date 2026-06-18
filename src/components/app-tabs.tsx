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
import * as ImagePicker from 'expo-image-picker';
import ExpenseScreen from '@/screens/ExpenseScreen';
import ExpensesScreen from '@/screens/ExpensesScreen';
import DocumentVaultScreen from '@/screens/DocumentVaultScreen';
import HomeScreen from '@/screens/HomeScreen';
import LoadsScreen from '@/screens/LoadsScreen';
import SmartScanScreen from '@/screens/SmartScanScreen';
import SplashScreen from '@/screens/SplashScreen';
import LoginScreen from '@/screens/LoginScreen';
import { BRAND, useTheme, toggleTheme, StatusBorderCard } from '@/lib/theme';
import { saveDocument, logout, isAuthenticated, getAuthUser, getMe } from '../lib/api';

type TabName = 'loads' | 'vault' | 'scan' | 'finance' | 'tools';

// High-fidelity custom vector drawings for the bottom tabs
function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 22, justifyContent: 'flex-end', alignItems: 'center' }}>
      {/* Roof */}
      <View style={{ position: 'absolute', top: 1, width: 20, height: 10, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 13, height: 13, borderLeftWidth: 2.6, borderTopWidth: 2.6, borderColor: color, transform: [{ rotate: '45deg' }], top: 5, borderTopLeftRadius: 1.5 }} />
      </View>
      {/* Body */}
      <View style={{ width: 16, height: 11, borderWidth: 2.6, borderColor: color, borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, justifyContent: 'flex-end', alignItems: 'center', zIndex: -1 }}>
        {/* Door */}
        <View style={{ width: 6, height: 6, borderLeftWidth: 2.6, borderRightWidth: 2.6, borderTopWidth: 2.6, borderColor: color, borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5 }} />
      </View>
    </View>
  );
}

// FolderIcon with user card badge
function FolderIcon({ color, bg }: { color: string, bg: string }) {
  return (
    <View style={{ width: 24, height: 18, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 0, left: 2, width: 8, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 2.6, borderColor: color, borderBottomWidth: 0 }} />
      <View style={{ width: 20, height: 13, borderWidth: 2.6, borderColor: color, borderRadius: 2, marginTop: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginBottom: 1 }} />
        <View style={{ width: 8, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

function ScanIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 26, height: 26, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 1, left: 1, width: 6, height: 6, borderLeftWidth: 2.6, borderTopWidth: 2.6, borderColor: color }} />
      <View style={{ position: 'absolute', top: 1, right: 1, width: 6, height: 6, borderRightWidth: 2.6, borderTopWidth: 2.6, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, left: 1, width: 6, height: 6, borderLeftWidth: 2.6, borderBottomWidth: 2.6, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, right: 1, width: 6, height: 6, borderRightWidth: 2.6, borderBottomWidth: 2.6, borderColor: color }} />
      <View style={{ width: 10, height: 13, borderWidth: 2.6, borderColor: color, borderRadius: 1.5, justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
        <View style={{ width: 5, height: 1.8, backgroundColor: color }} />
        <View style={{ width: 5, height: 1.8, backgroundColor: color }} />
      </View>
    </View>
  );
}

function FinanceIcon({ color, bg }: { color: string, bg: string }) {
  return (
    <View style={{ width: 24, height: 18, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 0, left: 5, width: 16, height: 11, borderWidth: 2.5, borderColor: color, borderRadius: 1.5, transform: [{ rotate: '4deg' }], opacity: 0.6 }} />
      <View style={{ width: 18, height: 12, borderWidth: 2.6, borderColor: color, borderRadius: 2, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, borderWidth: 2.0, borderColor: color }} />
      </View>
    </View>
  );
}

function ToolsIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 8, height: 4, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 2.5, borderColor: color, borderBottomWidth: 0, marginBottom: -1 }} />
      <View style={{ width: 18, height: 11, borderWidth: 2.6, borderColor: color, borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 4, height: 3, backgroundColor: color, borderRadius: 0.5 }} />
      </View>
    </View>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
      {/* Head */}
      <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 2.6, borderColor: color, marginBottom: 2 }} />
      {/* Shoulders */}
      <View style={{ width: 16, height: 7, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderWidth: 2.6, borderColor: color, borderBottomWidth: 0 }} />
    </View>
  );
}

function TabIcon({ id, color, bg }: { id: string; color: string; bg: string }) {
  const iconScale = id === 'scan' ? 1.25 : 1.15;
  return (
    <View style={{ transform: [{ scale: iconScale }] }}>
      {(() => {
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
      })()}
    </View>
  );
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

interface InvoiceGeneratorProps {
  T: any;
  styles: any;
  onClose: () => void;
  setActiveTab: (tab: any) => void;
  prepopulatedLoad: any;
  profileCompany: string;
  profileMc: string;
  profileDot: string;
  profileLogo: string;
}

// Subcomponent: Invoice Generator
function InvoiceGenerator({
  T,
  styles,
  onClose,
  setActiveTab,
  prepopulatedLoad,
  profileCompany,
  profileMc,
  profileDot,
  profileLogo,
}: InvoiceGeneratorProps) {
  const [loadId, setLoadId] = useState(prepopulatedLoad?.loadId || prepopulatedLoad?.id || '');
  const [broker, setBroker] = useState(prepopulatedLoad?.carrier || prepopulatedLoad?.broker || '');
  const [lineItems, setLineItems] = useState<Array<{ id: string; description: string; amount: string }>>([
    { id: 'base', description: 'Freight / Base Rate', amount: prepopulatedLoad?.rateAmount ? prepopulatedLoad.rateAmount.toString() : '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (prepopulatedLoad) {
      setLoadId(prepopulatedLoad.loadId || prepopulatedLoad.id || '');
      setBroker(prepopulatedLoad.carrier || prepopulatedLoad.broker || '');
      setLineItems([
        { id: 'base', description: 'Freight / Base Rate', amount: prepopulatedLoad.rateAmount ? prepopulatedLoad.rateAmount.toString() : '' }
      ]);
    }
  }, [prepopulatedLoad]);

  const totalAmount = lineItems.reduce((sum, item) => {
    const val = parseFloat(item.amount) || 0;
    return sum + val;
  }, 0);

  const generateInvoicePDF = () => {
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Pop-up blocked! Please allow pop-ups to generate PDF.');
        return;
      }

      const invoiceNum = `INV-${loadId || 'TEMP'}-${Math.floor(1000 + Math.random() * 9000)}`;
      const dateStr = new Date().toLocaleDateString();

      const htmlContent = `
        <html>
        <head>
          <title>Invoice - ${loadId || 'Draft'}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e1b1b; line-height: 1.5; }
            .letterhead { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #5b1010; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-company { display: flex; align-items: center; gap: 15px; }
            .logo-img { max-height: 60px; max-width: 120px; border-radius: 4px; object-fit: contain; }
            .company-info { text-align: left; }
            .company-name { font-size: 22px; font-weight: 700; color: #5b1010; margin-bottom: 4px; }
            .company-details { font-size: 13px; color: #6e6565; }
            .invoice-title-box { text-align: right; }
            .invoice-title { font-size: 26px; font-weight: 800; color: #221515; letter-spacing: 0.5px; }
            .invoice-meta { font-size: 13px; color: #6e6565; margin-top: 5px; }
            
            .billing-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .billing-box { background: #fdf6f5; padding: 15px; border-radius: 8px; border: 1px solid #ffdad6; }
            .box-title { font-size: 11px; font-weight: 600; color: #5b1010; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; border-bottom: 1px solid #ffdad6; padding-bottom: 4px; }
            .box-content { font-size: 14px; font-weight: 700; color: #221515; }
            .box-content-detail { font-size: 13px; color: #6e6565; font-weight: normal; margin-top: 2px; }

            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .invoice-table th { background: #5b1010; color: #ffffff; text-align: left; padding: 12px 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .invoice-table td { padding: 14px 10px; border-bottom: 1px solid #ffdad6; font-size: 14px; color: #221515; }
            .invoice-table td.amount-col { text-align: right; font-weight: 700; }
            .invoice-table th.amount-col { text-align: right; }

            .totals-container { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .totals-table { width: 300px; border-collapse: collapse; }
            .totals-table td { padding: 8px 10px; font-size: 14px; color: #6e6565; }
            .totals-table td.val-col { text-align: right; font-weight: 700; color: #221515; }
            .totals-table tr.grand-total { border-top: 1.5px solid #5b1010; font-size: 16px; font-weight: 700; }
            .totals-table tr.grand-total td { color: #5b1010; padding-top: 12px; }
            .totals-table tr.grand-total td.val-col { color: #14532d; font-size: 18px; }

            .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #a09190; border-top: 1px solid #ffdad6; padding-top: 15px; }
            @media print {
              body { padding: 20px; }
              .billing-box { background: #ffffff !important; border: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="logo-company">
              ${profileLogo ? `<img src="${profileLogo}" class="logo-img" />` : ''}
              <div class="company-info">
                <div class="company-name">${profileCompany || 'Carrier Company'}</div>
                <div class="company-details">
                  ${profileMc ? `MC#: ${profileMc}` : ''} ${profileMc && profileDot ? '•' : ''} ${profileDot ? `DOT#: ${profileDot}` : ''}
                </div>
              </div>
            </div>
            <div class="invoice-title-box">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-meta">
                <strong>Invoice Number:</strong> ${invoiceNum}<br/>
                <strong>Date:</strong> ${dateStr}
              </div>
            </div>
          </div>

          <div class="billing-section">
            <div class="billing-box">
              <div class="box-title">Bill From</div>
              <div class="box-content">${profileCompany || 'Carrier Company'}</div>
              <div class="box-content-detail">
                ${profileMc ? `MC: ${profileMc}<br/>` : ''}
                ${profileDot ? `USDOT: ${profileDot}<br/>` : ''}
                Professional Carrier Services
              </div>
            </div>
            <div class="billing-box">
              <div class="box-title">Bill To</div>
              <div class="box-content">${broker || 'Customer / Broker'}</div>
              <div class="box-content-detail">
                Reference ID: ${loadId || '—'}
              </div>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Item / Description</th>
                <th class="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map(item => {
                const val = parseFloat(item.amount) || 0;
                return `
                  <tr>
                    <td>${item.description || 'Unnamed Item'}</td>
                    <td class="amount-col">$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td class="val-col">$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr class="grand-total">
                <td>Total Due</td>
                <td class="val-col">$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            Thank you for your business!<br/>
            This document is generated by Integra Vault mobile application.
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
      Alert.alert('📄 Export Success', `Invoice PDF generated and shared successfully!`);
    }
  };

  const handleSaveToVault = async () => {
    if (!loadId || !broker || lineItems.some(i => !i.description || !i.amount)) {
      const errMsg = 'Required Fields: Please enter Load ID, Customer/Broker Name, and fill in all Line Items.';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Required Fields', errMsg);
      }
      return;
    }

    try {
      setIsSaving(true);
      const itemsStr = lineItems.map(i => `${i.description}: $${(parseFloat(i.amount) || 0).toLocaleString()}`).join(' • ');
      await saveDocument({
        docType: 'Invoice',
        expiryDate: null,
        description: `Invoice: ${loadId} • Broker: ${broker} • ${itemsStr} • Total: $${totalAmount.toLocaleString()}`,
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

      {/* Dynamic Line Items */}
      <View style={[styles.inputGroup, { marginTop: 8 }]}>
        <Text style={[styles.inputLabel, { color: T.text.secondary }]}>LINE ITEMS</Text>
        {lineItems.map((item, index) => (
          <View key={item.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <TextInput
              style={[styles.modalInput, { flex: 2, backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
              value={item.description}
              onChangeText={(val) => {
                setLineItems(prev => prev.map((itm, i) => i === index ? { ...itm, description: val } : itm));
              }}
              placeholder="e.g. Fuel Surcharge"
              placeholderTextColor={T.text.muted}
            />
            <TextInput
              style={[styles.modalInput, { flex: 1, backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
              value={item.amount}
              onChangeText={(val) => {
                setLineItems(prev => prev.map((itm, i) => i === index ? { ...itm, amount: val } : itm));
              }}
              placeholder="0.00"
              placeholderTextColor={T.text.muted}
              keyboardType="numeric"
            />
            {lineItems.length > 1 && (
              <Pressable
                onPress={() => {
                  const updated = lineItems.filter((_, i) => i !== index);
                  setLineItems(updated);
                }}
                style={{ padding: 6 }}
              >
                <Text style={{ fontSize: 16, color: BRAND.crimsonRed }}>🗑️</Text>
              </Pressable>
            )}
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 8,
              alignSelf: 'flex-start',
            },
            pressed && { opacity: 0.7 }
          ]}
          onPress={() => {
            setLineItems([...lineItems, { id: Date.now().toString(), description: '', amount: '' }]);
          }}
        >
          <Text style={{ fontSize: 16, color: T.primary }}>➕</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: T.primary }}>ADD LINE ITEM</Text>
        </Pressable>
      </View>

      {/* Invoice Preview Card */}
      <View style={[styles.invoicePreviewCard, { backgroundColor: T.background.card, borderColor: T.border.default }]}>
        <View style={{ borderBottomWidth: 1.5, borderBottomColor: T.border.default, paddingBottom: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {profileLogo ? (
            <Image source={{ uri: profileLogo }} style={{ width: 44, height: 44, borderRadius: 4, resizeMode: 'contain' }} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={[styles.invoiceTitle, { color: T.text.primary }]}>INVOICE PREVIEW</Text>
            <Text style={[styles.invoiceText, { color: T.text.secondary }]} numberOfLines={1}>Broker: {broker || '—'}</Text>
            <Text style={[styles.invoiceText, { color: T.text.secondary }]}>Ref ID: {loadId || '—'}</Text>
          </View>
        </View>
        {lineItems.map((item) => {
          const val = parseFloat(item.amount) || 0;
          return (
            <View key={item.id} style={styles.invoiceItem}>
              <Text style={[styles.invoiceText, { color: T.text.secondary }]} numberOfLines={1}>{item.description || 'Item Description'}:</Text>
              <Text style={[styles.invoiceValue, { color: T.text.primary }]}>${val.toLocaleString()}</Text>
            </View>
          );
        })}
        <View style={{ height: 1.5, backgroundColor: T.border.default, marginVertical: 8 }} />
        <View style={styles.invoiceItem}>
          <Text style={[styles.invoiceTextBold, { color: T.text.primary }]}>TOTAL INVOICED:</Text>
          <Text style={[styles.invoiceValueBold, { color: BRAND.profitGreen }]}>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 8 }}>
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

        <Pressable
          style={({ pressed }) => [
            styles.saveToVaultBtn,
            {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: BRAND.crimsonRed
            },
            pressed && { backgroundColor: BRAND.crimsonRed + '15' }
          ]}
          onPress={generateInvoicePDF}
          accessibilityRole="button"
          accessibilityLabel="Generate PDF Invoice"
        >
          <Text style={[styles.saveToVaultBtnText, { color: T.text.primary }]}>📄 GENERATE PDF INVOICE</Text>
        </Pressable>
      </View>
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
  const [prepopulatedLoad, setPrepopulatedLoad] = useState<any>(null);
  const [financeSubView, setFinanceSubView] = useState<'pnl' | 'expenses'>('pnl');
  const [showProfile, setShowProfile] = useState(false);
  const { mode: themeMode, t: T } = useTheme();

  // Profile management state
  const [profileName, setProfileName] = useState('Jazzie Driver');
  const [profileCompany, setProfileCompany] = useState('Jazzie Logistics');
  const [profileType, setProfileType] = useState<'Owner Operator' | 'Carrier'>('Owner Operator');
  const [profileVin, setProfileVin] = useState('1FTFW1EF5KFD8291A');
  const [profileMc, setProfileMc] = useState('MC-123456');
  const [profileDot, setProfileDot] = useState('USDOT-3749201');
  const [profileLogo, setProfileLogo] = useState('');
  const [profileDocs, setProfileDocs] = useState({
    driverLicense: true,
    coi: true,
    operatingAuthority: false,
    nsc: false,
    ifta: true,
  });

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasAuth = await isAuthenticated();
        if (hasAuth) {
          const user = await getAuthUser();
          setAuthUser(user);
          setAppState('app');

          // Fetch fresh user profile on startup (Implementation #1)
          try {
            const freshUser = await getMe();
            if (freshUser) {
              setAuthUser(freshUser);
              if (freshUser.full_name) {
                setProfileName(freshUser.full_name);
                AsyncStorage.setItem('profile_name', freshUser.full_name).catch(() => {});
              }
              if (freshUser.company_name) {
                setProfileCompany(freshUser.company_name);
                AsyncStorage.setItem('profile_company', freshUser.company_name).catch(() => {});
              }
            }
          } catch (profileErr) {
            console.warn('Failed to fetch user profile on startup', profileErr);
          }
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
        const mcVal = await AsyncStorage.getItem('profile_mc');
        const dotVal = await AsyncStorage.getItem('profile_dot');
        const logoVal = await AsyncStorage.getItem('profile_logo');
        const docsVal = await AsyncStorage.getItem('profile_docs');

        if (nameVal) setProfileName(nameVal);
        if (compVal) setProfileCompany(compVal);
        if (typeVal) setProfileType(typeVal as any);
        if (vinVal) setProfileVin(vinVal);
        if (mcVal) setProfileMc(mcVal);
        if (dotVal) setProfileDot(dotVal);
        if (logoVal) setProfileLogo(logoVal);
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
                onNavigate={(tab: TabName, toolView?: 'hub' | 'calculator' | 'invoices' | 'loads' | 'expenses') => {
                  setActiveTab(tab);
                  if (tab === 'finance') {
                    setFinanceSubView(toolView === 'expenses' ? 'expenses' : 'pnl');
                  } else if (toolView) {
                    setActiveToolView(toolView as any);
                  }
                }}
              />
            ) : (
              <LoadsScreen
                onBackToHome={() => setHomeScreenView('home')}
                onOpenProfile={() => setShowProfile(true)}
                onCreateInvoice={(load: any) => {
                  setPrepopulatedLoad(load);
                  setActiveTab('tools');
                  setActiveToolView('invoices');
                }}
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
            {financeSubView === 'pnl' ? (
              <ExpenseScreen onViewAllExpenses={() => setFinanceSubView('expenses')} />
            ) : (
              <ExpensesScreen
                onBack={() => setFinanceSubView('pnl')}
                onNavigateToScan={() => {
                  setFinanceSubView('pnl');
                  setActiveTab('scan');
                }}
              />
            )}
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
        <View style={[styles.toolsGrid, { justifyContent: 'space-between', gap: 12, paddingBottom: 8 }]}>
          {utilityTools.map((tool) => {
            const shortLabel = 
              tool.id === 'calculator' ? 'LOAD CALC' :
              tool.id === 'invoices' ? 'INVOICES' :
              tool.id === 'loads' ? 'LOADS' :
              tool.id === 'vault' ? 'DOC VAULT' :
              tool.id === 'expenses' ? 'EXPENSES' :
              tool.id === 'pnl' ? 'P&L VIEW' : tool.title;
            return (
              <View key={tool.id} style={{ width: '31%', marginBottom: 12 }}>
                <SkeuomorphicToolButton
                  id={tool.id}
                  label={shortLabel}
                  isDark={themeMode === 'dark'}
                  onPress={tool.action}
                />
              </View>
            );
          })}
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
              onClose={() => {
                setActiveToolView('hub');
                setPrepopulatedLoad(null);
              }}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setActiveToolView('hub');
                setPrepopulatedLoad(null);
              }}
              prepopulatedLoad={prepopulatedLoad}
              profileCompany={profileCompany}
              profileMc={profileMc}
              profileDot={profileDot}
              profileLogo={profileLogo}
            />
          )}
          {activeToolView === 'loads' && (
            <LoadsScreen 
              onBackToHome={() => setActiveToolView('hub')}
              onOpenProfile={() => setShowProfile(true)}
              onCreateInvoice={(load: any) => {
                setPrepopulatedLoad(load);
                setActiveToolView('invoices');
              }}
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
              {/* Company Logo Row */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: T.text.secondary }]}>COMPANY LOGO</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
                  {profileLogo ? (
                    <Image
                      source={{ uri: profileLogo }}
                      style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1.5, borderColor: T.border.variant }}
                    />
                  ) : (
                    <View style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: BRAND.crimsonRed, justifyContent: 'center', alignItems: 'center', backgroundColor: T.background.container }}>
                      <Text style={{ fontSize: 20 }}>🏢</Text>
                    </View>
                  )}
                  <View style={{ gap: 8 }}>
                    <Pressable
                      style={({ pressed }) => [
                        {
                          backgroundColor: BRAND.crimsonRed,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 6,
                        },
                        pressed && { opacity: 0.8 }
                      ]}
                      onPress={async () => {
                        try {
                          const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            quality: 0.7,
                            base64: true,
                          });
                          if (!result.canceled && result.assets && result.assets[0]) {
                            const asset = result.assets[0];
                            let base64Str = '';
                            if (asset.base64) {
                              const ext = asset.uri.split('.').pop()?.toLowerCase() || 'png';
                              base64Str = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${asset.base64}`;
                            } else {
                              base64Str = asset.uri;
                            }
                            setProfileLogo(base64Str);
                            saveProfileField('profile_logo', base64Str);
                          }
                        } catch (err: any) {
                          Alert.alert('Error', 'Failed to select logo: ' + err.message);
                        }
                      }}
                    >
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>SELECT LOGO</Text>
                    </Pressable>
                    {profileLogo ? (
                      <Pressable
                        onPress={() => {
                          setProfileLogo('');
                          saveProfileField('profile_logo', '');
                        }}
                      >
                        <Text style={{ color: BRAND.crimsonRed, fontSize: 11, fontWeight: '600' }}>Remove Logo</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>

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

              {/* MC# & DOT# Row */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: T.text.secondary }]}>MC NUMBER</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
                    value={profileMc}
                    onChangeText={(val) => {
                      setProfileMc(val);
                      saveProfileField('profile_mc', val);
                    }}
                    placeholder="e.g. MC-123456"
                    placeholderTextColor={T.text.muted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: T.text.secondary }]}>USDOT NUMBER</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: T.background.container, borderColor: T.border.variant, color: T.text.primary }]}
                    value={profileDot}
                    onChangeText={(val) => {
                      setProfileDot(val);
                      saveProfileField('profile_dot', val);
                    }}
                    placeholder="e.g. DOT-3749201"
                    placeholderTextColor={T.text.muted}
                  />
                </View>
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
          { opacity: themeMode === 'dark' ? 1.0 : 1.0 },
        ]}
      >
        <Image
          source={themeMode === 'dark'
            ? require('../../assets/images/background-dark.jpg')
            : require('../../assets/images/background-light.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
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

          // Base colors for puffy 3D buttons
          const btnBg = isScan 
            ? (themeMode === 'dark' ? '#8A121B' : '#A81A24')
            : (isActive 
                ? (themeMode === 'dark' ? '#8A121B' : '#A81A24')
                : (themeMode === 'dark' ? '#1C0E10' : '#E5E5EA'));

          const borderTopLeft = isScan
            ? (themeMode === 'dark' ? '#D92A36' : '#E05A65')
            : (isActive
                ? (themeMode === 'dark' ? '#D92A36' : '#E05A65')
                : (themeMode === 'dark' ? '#321D20' : '#FFFFFF'));

          const borderBottomRight = isScan
            ? (themeMode === 'dark' ? '#54080D' : '#6E0E16')
            : (isActive
                ? (themeMode === 'dark' ? '#54080D' : '#6E0E16')
                : (themeMode === 'dark' ? '#0F0607' : '#B5B5BA'));

          const textColor = isScan 
            ? '#ffffff'
            : (isActive ? '#ffffff' : (themeMode === 'dark' ? '#8E8E93' : '#6B6B70'));

          const renderPuffyButton = (content: React.ReactNode, onPress: () => void, isFloating: boolean) => {
            const btnHeight = isFloating ? 64 : 58;
            const btnWidth = isFloating ? 64 : 76;
            const borderRadius = isFloating ? 20 : 16;
            const highlightOpacity = isScan || isActive ? 0.22 : 0.08;

            return (
              <Pressable
                key={tab.id}
                onPress={onPress}
                style={({ pressed }) => [
                  {
                    width: btnWidth,
                    height: btnHeight,
                    borderRadius: borderRadius,
                    backgroundColor: btnBg,
                    borderWidth: 2.2,
                    borderTopColor: borderTopLeft,
                    borderLeftColor: borderTopLeft,
                    borderBottomColor: borderBottomRight,
                    borderRightColor: borderBottomRight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: isFloating ? 5 : 3 },
                    shadowOpacity: themeMode === 'dark' ? 0.6 : 0.22,
                    shadowRadius: isFloating ? 5 : 3,
                    elevation: isFloating ? 8 : 4,
                    position: 'relative',
                    overflow: 'hidden',
                  },
                  pressed && {
                    transform: [{ translateY: 1.5 }],
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                  }
                ]}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                {/* 3D Curved/Convex Puffy Highlight bar at the top */}
                <View style={{
                  position: 'absolute',
                  top: 2,
                  left: 4,
                  right: 4,
                  height: '22%',
                  borderTopLeftRadius: borderRadius - 4,
                  borderTopRightRadius: borderRadius - 4,
                  backgroundColor: `rgba(255, 255, 255, ${highlightOpacity})`,
                }} />
                {content}
              </Pressable>
            );
          };

          if (isScan) {
            return (
              <View key={tab.id} style={{ alignItems: 'center', justifyContent: 'center', marginTop: -20 }}>
                {renderPuffyButton(
                  <>
                    <TabIcon id="scan" color="#ffffff" bg={btnBg} />
                    <Text style={[styles.scanLabelText, { color: '#ffffff', fontWeight: '900', marginTop: 1, fontSize: 8 }]}>
                      SCAN
                    </Text>
                  </>,
                  () => setActiveTab('scan'),
                  true
                )}
              </View>
            );
          }

          return renderPuffyButton(
            <>
              <TabIcon id={tab.id} color={textColor} bg={btnBg} />
              <Text style={[
                styles.tabLabel,
                { color: textColor, fontWeight: isActive ? '900' : '700', marginTop: 2 }
              ]}>
                {tab.label}
              </Text>
            </>,
            () => {
              if (tab.id === 'loads' && activeTab === 'loads') {
                setHomeScreenView('home');
              }
              setActiveTab(tab.id);
            },
            false
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
    height: 80,
    borderTopWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tabButton: {
    height: 58,
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '800',
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

// Skeuomorphic 3D Mechanical Tool Button
function SkeuomorphicToolButton({ id, label, isDark, onPress }: { id: string; label: string; isDark: boolean; onPress: () => void }) {
  const baseColor = isDark ? '#8A121B' : '#E0E0E0';
  const highlightColor = isDark ? '#D92A36' : '#FFFFFF';
  const shadowColor = isDark ? '#54080D' : '#A0A0A0';
  const innerCircleBg = isDark ? '#0A0303' : '#F5F5F7';
  const innerCircleBorder = isDark ? '#4A0C10' : '#D0D0D5';
  const textColor = isDark ? '#FFFFFF' : '#333333';

  const renderIcon = () => {
    switch (id) {
      case 'calculator': // Abacus
        return (
          <View style={{ width: 44, height: 34, borderWidth: 2.5, borderColor: '#C87D2D', borderRadius: 4, backgroundColor: '#1A0E0B', paddingVertical: 2, paddingHorizontal: 1, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 2, elevation: 3 }}>
            {[0, 1, 2, 3].map((rowIdx) => {
              const leftBeadsCount = rowIdx === 0 ? 2 : rowIdx === 1 ? 4 : rowIdx === 2 ? 1 : 3;
              const rightBeadsCount = 5 - leftBeadsCount;
              const rowColors = ['#D32F2F', '#1976D2', '#FBC02D', '#388E3C'];
              const beadColor = rowColors[rowIdx];
              return (
                <View key={rowIdx} style={{ height: 6, flexDirection: 'row', alignItems: 'center', marginVertical: 0.5, position: 'relative' }}>
                  <View style={{ position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#B0BEC5' }} />
                  <View style={{ flexDirection: 'row', gap: 0.5 }}>
                    {Array.from({ length: leftBeadsCount }).map((_, i) => (
                      <View key={`l-${i}`} style={{ width: 4, height: 6, borderRadius: 1.5, backgroundColor: beadColor, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.3)' }} />
                    ))}
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={{ flexDirection: 'row', gap: 0.5 }}>
                    {Array.from({ length: rightBeadsCount }).map((_, i) => (
                      <View key={`r-${i}`} style={{ width: 4, height: 6, borderRadius: 1.5, backgroundColor: beadColor, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.3)' }} />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        );
      case 'invoices': // Clipboard
        return (
          <View style={{ width: 34, height: 44, borderRadius: 4, backgroundColor: '#D7A15C', borderWidth: 1.5, borderColor: '#A36F35', padding: 2, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 }}>
            <View style={{ width: 16, height: 5, backgroundColor: '#CFD8DC', borderWidth: 1, borderColor: '#78909C', borderTopLeftRadius: 2, borderTopRightRadius: 2, alignSelf: 'center', zIndex: 1, marginBottom: 1 }} />
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 1.5, padding: 3, gap: 2.5 }}>
              <View style={{ height: 1.5, backgroundColor: '#CFD8DC', width: '50%' }} />
              <View style={{ height: 1.5, backgroundColor: '#CFD8DC', width: '85%' }} />
              <View style={{ height: 1.5, backgroundColor: '#90A4AE', width: '70%' }} />
              <View style={{ height: 1.5, backgroundColor: '#90A4AE', width: '80%' }} />
              <View style={{ height: 1.5, backgroundColor: '#CFD8DC', width: '60%' }} />
            </View>
          </View>
        );
      case 'expenses': // Receipt
        return (
          <View style={{ width: 32, height: 44, backgroundColor: '#FFFFFF', padding: 3, gap: 2, position: 'relative', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: '#B0BEC5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 }}>
            <View style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 2, flexDirection: 'row', overflow: 'hidden' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={`top-${i}`} style={{ width: 4, height: 4, backgroundColor: innerCircleBg, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
              ))}
            </View>
            <Text style={{ fontSize: 4.5, fontWeight: '800', textAlign: 'center', color: '#37474F', letterSpacing: 0.5, marginTop: 1 }}>RECEIPT</Text>
            <View style={{ borderBottomWidth: 0.5, borderStyle: 'dashed', borderColor: '#78909C', marginVertical: 1 }} />
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ height: 1.5, backgroundColor: '#78909C', width: '40%' }} />
                <View style={{ height: 1.5, backgroundColor: '#78909C', width: '20%' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ height: 1.5, backgroundColor: '#78909C', width: '50%' }} />
                <View style={{ height: 1.5, backgroundColor: '#78909C', width: '25%' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                <View style={{ height: 1.5, backgroundColor: '#37474F', width: '30%' }} />
                <View style={{ height: 1.5, backgroundColor: '#37474F', width: '35%' }} />
              </View>
            </View>
            <View style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, flexDirection: 'row', overflow: 'hidden' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={`bot-${i}`} style={{ width: 4, height: 4, backgroundColor: innerCircleBg, transform: [{ rotate: '45deg' }], marginTop: 0 }} />
              ))}
            </View>
          </View>
        );
      case 'vault': // Safe
        return (
          <View style={{ width: 38, height: 38, borderRadius: 4, backgroundColor: isDark ? '#7f131a' : '#90A4AE', borderWidth: 2, borderColor: isDark ? '#b8212a' : '#CFD8DC', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 2, elevation: 3, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ position: 'absolute', left: 4, top: 4, right: 4, bottom: 4, borderLeftWidth: 1, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#455A64', borderWidth: 1.5, borderColor: '#CFD8DC', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 1 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#B0BEC5' }} />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <View key={angle} style={{ position: 'absolute', width: 1.5, height: 1.5, backgroundColor: '#CFD8DC', top: 6, transform: [{ rotate: `${angle}deg` }, { translateY: -5 }] }} />
              ))}
            </View>
            <View style={{ position: 'absolute', bottom: 6, width: 8, height: 2.5, backgroundColor: '#CFD8DC', borderRadius: 1 }} />
          </View>
        );
      case 'loads': // Semi-truck
        return (
          <View style={{ width: 42, height: 32, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
            {/* Cabin */}
            <View style={{ position: 'absolute', left: 4, bottom: 6, width: 12, height: 16, backgroundColor: '#D32F2F', borderWidth: 1.5, borderColor: '#B71C1C', borderTopRightRadius: 4, borderBottomRightRadius: 1 }} />
            {/* Windshield */}
            <View style={{ position: 'absolute', left: 9, top: 12, width: 5, height: 5, backgroundColor: '#E0F7FA', borderTopRightRadius: 1.5 }} />
            {/* Trailer */}
            <View style={{ position: 'absolute', right: 4, bottom: 8, width: 22, height: 18, backgroundColor: '#ECEFF1', borderWidth: 1.5, borderColor: '#B0BEC5', borderRadius: 2 }} />
            {/* Connector */}
            <View style={{ position: 'absolute', left: 14, bottom: 7, width: 4, height: 2, backgroundColor: '#37474F' }} />
            {/* Wheels */}
            <View style={{ position: 'absolute', left: 6, bottom: 3, width: 6, height: 6, borderRadius: 3, backgroundColor: '#263238', borderWidth: 1, borderColor: '#CFD8DC' }} />
            <View style={{ position: 'absolute', right: 6, bottom: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: '#263238', borderWidth: 1, borderColor: '#CFD8DC' }} />
            <View style={{ position: 'absolute', right: 13, bottom: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: '#263238', borderWidth: 1, borderColor: '#CFD8DC' }} />
          </View>
        );
      case 'pnl': // Growth Chart
        return (
          <View style={{ width: 36, height: 36, position: 'relative', paddingLeft: 4, justifyContent: 'flex-end', gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3.5, flex: 1, paddingBottom: 2 }}>
              {/* Bars */}
              <View style={{ width: 6, height: 12, backgroundColor: '#EF5350', borderRadius: 1 }} />
              <View style={{ width: 6, height: 20, backgroundColor: '#FFCA28', borderRadius: 1 }} />
              <View style={{ width: 6, height: 28, backgroundColor: '#66BB6A', borderRadius: 1 }} />
            </View>
            {/* Green Upward Arrow */}
            <Text style={{ position: 'absolute', right: 1, top: 0, fontSize: 13, color: '#66BB6A', fontWeight: '900' }}>↗</Text>
            {/* Base Axis line */}
            <View style={{ height: 2, backgroundColor: '#B0BEC5', alignSelf: 'stretch' }} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        {
          width: '100%',
          aspectRatio: 0.95,
          borderRadius: 18,
          backgroundColor: baseColor,
          borderWidth: 2.2,
          borderColor: shadowColor,
          borderTopColor: highlightColor,
          borderLeftColor: highlightColor,
          paddingHorizontal: 4,
          paddingVertical: 8,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.55 : 0.22,
          shadowRadius: 5,
          elevation: 6,
        },
        pressed && {
          transform: [{ translateY: 2 }],
          shadowOffset: { width: 0, height: 1.5 },
          shadowOpacity: 0.35,
          shadowRadius: 2.5,
        }
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={{
        width: '80%',
        aspectRatio: 1.0,
        borderRadius: 99,
        backgroundColor: innerCircleBg,
        borderWidth: 1.5,
        borderColor: innerCircleBorder,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.7 : 0.15,
        shadowRadius: 3,
        marginBottom: 8,
      }}>
        <View style={{ transform: [{ scale: 1.45 }] }}>
          {renderIcon()}
        </View>
      </View>
      <Text style={{ fontSize: 10, fontWeight: '900', color: textColor, letterSpacing: 0.4, textTransform: 'uppercase', textAlign: 'center', width: '100%' }}>
        {label}
      </Text>
    </Pressable>
  );
}

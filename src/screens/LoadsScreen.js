import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { getAuthToken, getAuthUser, saveDocument } from '../lib/api';
import { getAvailableLoads, acceptLoad, getMyLoads, updateLoadStatus } from '../lib/tms';
import { BRAND, TYPOGRAPHY, SPACING, StatusBorderCard, useTheme, createThemedStyleSheet } from '../lib/theme';

const getStatusStyles = (T) => ({
  high: {
    badge: { backgroundColor: T.compliance.valid, borderColor: BRAND.profitGreen + '4D' },
    badgeText: { color: BRAND.profitGreen },
    rpm: { color: BRAND.profitGreen },
    leftBorder: BRAND.profitGreen,
    label: 'PULSE: HIGH',
    icon: '↑',
  },
  hazmat: {
    badge: { backgroundColor: T.compliance.warning, borderColor: BRAND.hazardOrange + '4D' },
    badgeText: { color: BRAND.hazardOrange },
    rpm: { color: BRAND.profitGreen },
    leftBorder: BRAND.crimsonRed,
    label: 'HAZMAT',
    icon: '⚠',
  },
  avg: {
    badge: { backgroundColor: T.background.containerHighest, borderColor: T.border.variant },
    badgeText: { color: T.text.secondary },
    rpm: { color: T.text.secondary },
    leftBorder: T.border.default,
    label: 'PULSE: AVG',
    icon: '≈',
  },
});

const TABS = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'available', label: 'Available' },
  { id: 'active', label: 'Active' },
  { id: 'history', label: 'History' },
];

function MetricsRow({ distance, estTime, rate }) {
  const { t: T } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.metricsGrid}>
      <View style={[styles.metricCell, styles.metricBorderRight]}>
        <Text style={styles.metricLabel}>DISTANCE</Text>
        <Text style={styles.metricValue}>{distance}</Text>
      </View>
      <View style={[styles.metricCell, styles.metricBorderRight]}>
        <Text style={styles.metricLabel}>EST. TIME</Text>
        <Text style={styles.metricValue}>{estTime}</Text>
      </View>
      <View style={styles.metricCell}>
        <Text style={styles.metricLabel}>RATE</Text>
        <Text style={[styles.metricValue, { color: T.primary }]}>{rate}</Text>
      </View>
    </View>
  );
}

function LoadCard({ load, pulseType = 'avg', onViewRoute, onAccept, onManage, onCreateInvoice, activeTab }) {
  const { t: T } = useTheme();
  const styles = useStyles();
  const STATUS_STYLES = getStatusStyles(T);
  const pulse = STATUS_STYLES[pulseType] || STATUS_STYLES.avg;
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <StatusBorderCard borderColor={pulse.leftBorder} style={styles.loadCard}>
      {/* Load Header */}
      <View style={styles.loadCardHeader}>
        <View>
          <Text style={styles.loadIdLabel}>LOAD ID</Text>
          <Text style={styles.loadId}>{load.loadId || load.id}</Text>
        </View>
        <View style={styles.loadCardHeaderRight}>
          <View style={[styles.pulseBadge, pulse.badge]}>
            <Text style={[styles.pulseBadgeText, pulse.badgeText]}>
              {pulse.icon} {pulse.label}
            </Text>
          </View>
          <Text style={[styles.rpmText, pulse.rpm]}>{load.rpm || '$3.22'} RPM</Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeRow}>
        <View style={styles.routeIconCol}>
          <Text style={[styles.routeIcon, { color: T.primary }]}>📍</Text>
          <View style={styles.routeLine} />
          <Text style={[styles.routeIcon, { color: T.secondary }]}>➤</Text>
        </View>
        <View style={styles.routeDetails}>
          <View style={styles.routeStop}>
            <Text style={styles.routeStopLabel}>PICKUP</Text>
            <Text style={styles.routeCity}>{load.startLocation || 'Houston, TX'}</Text>
          </View>
          <View style={styles.routeStop}>
            <Text style={styles.routeStopLabel}>DELIVERY</Text>
            <Text style={styles.routeCity}>{load.endLocation || 'Chicago, IL'}</Text>
          </View>
        </View>
      </View>

      {/* Metrics */}
      <MetricsRow
        distance={load.distance || '1,082 mi'}
        estTime={load.estTime || '18.5 hrs'}
        rate={load.rateAmount ? `$${load.rateAmount.toLocaleString()}` : '$3,700'}
      />

      {/* Actions */}
      <View style={styles.cardActions}>
        <Pressable
          style={({ pressed }) => [styles.routeBtn, pressed && styles.pressed]}
          onPress={onViewRoute}
          accessibilityRole="button"
          accessibilityLabel="View route"
        >
          <Text style={styles.routeBtnText}>🗺  VIEW ROUTE</Text>
        </Pressable>

        {activeTab === 'active' || ['Accepted', 'En Route to Pick-up', 'Loaded', 'En Route to Delivery', 'At Delivery', 'in-progress'].includes(load.status) ? (
          <Pressable
            style={({ pressed }) => [styles.acceptBtn, { backgroundColor: BRAND.hazardOrange }, pressed && styles.pressed]}
            onPress={onManage}
            accessibilityRole="button"
            accessibilityLabel="Manage active load status"
          >
            <Text style={styles.acceptBtnText}>⚙  STATUS</Text>
          </Pressable>
        ) : activeTab === 'history' || ['Delivered', 'Invoiced', 'Payment Overdue', 'Paid', 'completed'].includes(load.status) ? (
          <View style={{ flex: 1, flexDirection: 'row', gap: 8, position: 'relative' }}>
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, { backgroundColor: BRAND.hazardOrange, flex: 1 }, pressed && styles.pressed]}
              onPress={onManage}
              accessibilityRole="button"
              accessibilityLabel="Manage load status"
            >
              <Text style={styles.acceptBtnText}>⚙  STATUS</Text>
            </Pressable>

            <View style={{ flex: 1, position: 'relative' }}>
              <Pressable
                style={({ pressed }) => [styles.acceptBtn, { backgroundColor: BRAND.profitGreen }, pressed && styles.pressed]}
                onPress={() => setActionsOpen(!actionsOpen)}
                accessibilityRole="button"
                accessibilityLabel="Show actions menu"
              >
                <Text style={styles.acceptBtnText}>⚙  ACTIONS {actionsOpen ? '▲' : '▼'}</Text>
              </Pressable>

              {actionsOpen && (
                <View style={styles.actionsDropdown}>
                  <Pressable
                    style={({ pressed }) => [styles.actionsDropdownItem, pressed && styles.pressed]}
                    onPress={() => {
                      setActionsOpen(false);
                      if (onCreateInvoice) onCreateInvoice();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Generate invoice"
                  >
                    <Text style={styles.actionsDropdownItemText}>📋  Generate Invoice</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.acceptBtn, pressed && styles.pressed]}
            onPress={onAccept}
            accessibilityRole="button"
            accessibilityLabel="Accept load"
          >
            <Text style={styles.acceptBtnText}>ACCEPT LOAD</Text>
          </Pressable>
        )}
      </View>
    </StatusBorderCard>
  );
}

// Demo loads shown when API returns empty
const DEMO_LOADS = [
  {
    id: '#IV-2948-TX',
    loadId: '#IV-2948-TX',
    startLocation: 'Houston, TX (Term 4)',
    endLocation: 'Chicago, IL (Rail Hub)',
    distance: '1,082 mi',
    estTime: '18.5 hrs',
    rateAmount: 3700,
    rpm: '$3.42',
    pulseType: 'high',
    status: 'Accepted',
  },
  {
    id: '#IV-8102-LA',
    loadId: '#IV-8102-LA',
    startLocation: 'Baton Rouge, LA',
    endLocation: 'Savannah, GA',
    distance: '620 mi',
    estTime: '11.0 hrs',
    rateAmount: 2542,
    rpm: '$4.10',
    pulseType: 'hazmat',
    status: 'available',
  },
  {
    id: '#IV-3312-KS',
    loadId: '#IV-3312-KS',
    startLocation: 'Wichita, KS',
    endLocation: 'Denver, CO',
    distance: '520 mi',
    estTime: '9.5 hrs',
    rateAmount: 1118,
    rpm: '$2.15',
    pulseType: 'avg',
    status: 'Delivered',
  },
];

const STATUS_OPTIONS = [
  'Accepted',
  'En Route to Pick-up',
  'Loaded',
  'En Route to Delivery',
  'At Delivery',
  'Delivered',
  'Invoiced',
  'Payment Overdue',
  'Paid',
];

/**
 * @param {object} props
 * @param {string} [props.userType]
 * @param {() => void} [props.onBackToHome]
 * @param {() => void} [props.onOpenProfile]
 * @param {(load: any) => void} [props.onCreateInvoice]
 */
export default function LoadsScreen({ userType = 'owner_operator', onBackToHome = () => {}, onOpenProfile = () => {}, onCreateInvoice = () => {} } = {}) {
  const [loads, setLoads] = useState(DEMO_LOADS);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState(userType === 'driver' ? 'active' : 'marketplace');
  const { t: T } = useTheme();
  const styles = useStyles();

  const isDriver = userType === 'driver';
  const filteredTabs = isDriver
    ? TABS.filter(t => t.id === 'active' || t.id === 'history')
    : TABS;

  // Active Load Manager Modal State
  const [selectedLoadForManage, setSelectedLoadForManage] = useState(null);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [manageStatus, setManageStatus] = useState('Accepted');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [gateTimes, setGateTimes] = useState({
    gateInPickup: '',
    gateOutPickup: '',
    gateInDelivery: '',
    gateOutDelivery: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isDriver && (activeTab === 'marketplace' || activeTab === 'available')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('active');
    }
  }, [userType, isDriver, activeTab]);

  const loadLoads = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const token = await getAuthToken();
      let fetchedLoads = [];
      
      if (activeTab === 'marketplace' || activeTab === 'available') {
        fetchedLoads = await getAvailableLoads(token);
      } else {
        fetchedLoads = await getMyLoads(token);
      }
      
      let allLoads = [];
      if (fetchedLoads && fetchedLoads.length > 0) {
        allLoads = fetchedLoads.map((l, i) => ({
          ...l,
          loadId: l.id || l.loadId,
          rpm: l.rateAmount && l.distance
            ? `$${(l.rateAmount / parseFloat(l.distance)).toFixed(2)}`
            : '$3.22',
          pulseType: l.pulseType || (i % 3 === 0 ? 'high' : i % 3 === 1 ? 'hazmat' : 'avg'),
          status: l.status || 'available',
        }));
      } else {
        allLoads = [...DEMO_LOADS];
      }

      // Apply local status overrides
      for (let i = 0; i < allLoads.length; i++) {
        const localOverride = await AsyncStorage.getItem(`load_status_override_${allLoads[i].id}`);
        if (localOverride) {
          allLoads[i].status = localOverride;
        }
      }

      // Filter locally based on activeTab
      let filtered = [];
      if (activeTab === 'marketplace') {
        filtered = allLoads.filter(l => 
          (l.status === 'available' || !l.status || l.status === '') && 
          (l.pulseType === 'high' || l.pulseType === 'hazmat')
        );
      } else if (activeTab === 'available') {
        filtered = allLoads.filter(l => 
          l.status === 'available' || !l.status || l.status === ''
        );
      } else if (activeTab === 'active') {
        filtered = allLoads.filter(l => 
          ['Accepted', 'En Route to Pick-up', 'Loaded', 'En Route to Delivery', 'At Delivery', 'in-progress'].includes(l.status)
        );
      } else if (activeTab === 'history') {
        filtered = allLoads.filter(l => 
          ['Delivered', 'Invoiced', 'Payment Overdue', 'Paid', 'completed'].includes(l.status)
        );
      }
      setLoads(filtered);
    } catch (err) {
      console.warn("Error loading loads from API, falling back to DEMO_LOADS:", err);
      setApiError(err.message || 'Failed to fetch live loads.');
      // Fallback local filtering on DEMO_LOADS
      const allDemoLoads = [...DEMO_LOADS];
      for (let i = 0; i < allDemoLoads.length; i++) {
        const localOverride = await AsyncStorage.getItem(`load_status_override_${allDemoLoads[i].id}`);
        if (localOverride) {
          allDemoLoads[i].status = localOverride;
        }
      }

      let filtered = [];
      if (activeTab === 'marketplace') {
        filtered = allDemoLoads.filter(l => 
          l.status === 'available' && 
          (l.pulseType === 'high' || l.pulseType === 'hazmat')
        );
      } else if (activeTab === 'available') {
        filtered = allDemoLoads.filter(l => l.status === 'available');
      } else if (activeTab === 'active') {
        filtered = allDemoLoads.filter(l => ['Accepted', 'En Route to Pick-up', 'Loaded', 'En Route to Delivery', 'At Delivery', 'in-progress'].includes(l.status));
      } else if (activeTab === 'history') {
        filtered = allDemoLoads.filter(l => ['Delivered', 'Invoiced', 'Payment Overdue', 'Paid', 'completed'].includes(l.status));
      }
      setLoads(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLoads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    let ws;
    const connectWebSocket = async () => {
      try {
        const token = await getAuthToken();
        const wsBaseUrl = process.env.EXPO_PUBLIC_WS_URL || 'wss://api.staging.integratedtech.ca/loads/stream';
        const wsUrl = token
          ? `${wsBaseUrl}?token=${encodeURIComponent(token)}`
          : wsBaseUrl;
        
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected to loads stream');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'load_update' && data.load) {
              setLoads(prevLoads => {
                const index = prevLoads.findIndex(l => l.id === data.load.id);
                if (index !== -1) {
                  const updated = [...prevLoads];
                  updated[index] = {
                    ...updated[index],
                    ...data.load,
                    loadId: data.load.id,
                    status: data.load.status || updated[index].status
                  };
                  return updated;
                }
                return prevLoads;
              });
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.warn('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected, reconnecting in 5s...');
          setTimeout(connectWebSocket, 5000);
        };
      } catch (err) {
        console.error('Failed to initialize WebSocket:', err);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const openManageModal = async (load) => {
    setSelectedLoadForManage(load);
    setManageStatus(load.status || 'Accepted');
    setDropdownOpen(false);
    
    // Load gate times from AsyncStorage
    try {
      const timesJSON = await AsyncStorage.getItem(`load_gate_times_${load.id}`);
      if (timesJSON) {
        setGateTimes(JSON.parse(timesJSON));
      } else {
        setGateTimes({
          gateInPickup: '',
          gateOutPickup: '',
          gateInDelivery: '',
          gateOutDelivery: '',
        });
      }
    } catch {
      setGateTimes({
        gateInPickup: '',
        gateOutPickup: '',
        gateInDelivery: '',
        gateOutDelivery: '',
      });
    }

    // Load document attachments from AsyncStorage
    try {
      const attachmentsJSON = await AsyncStorage.getItem(`load_attachments_${load.id}`);
      if (attachmentsJSON) {
        setAttachments(JSON.parse(attachmentsJSON));
      } else {
        setAttachments([]);
      }
    } catch {
      setAttachments([]);
    }

    setManageModalVisible(true);
  };

  const handleAttachDocument = async () => {
    if (!selectedLoadForManage) return;

    // Request camera and media library permissions
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!libraryPermission.granted) {
      Alert.alert('Permission Denied', 'Media library access is required to attach documents.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets || !result.assets[0]) {
        return;
      }

      setUploading(true);
      const asset = result.assets[0];

      // Format base64 string
      let base64Str = '';
      if (asset.base64) {
        const ext = asset.uri.split('.').pop()?.toLowerCase() || 'png';
        base64Str = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${asset.base64}`;
      } else {
        base64Str = asset.uri;
      }

      const newAttachment = {
        id: `attach_${Date.now()}`,
        uri: base64Str,
        name: `POD_${selectedLoadForManage.id.replace('#', '')}_${Date.now().toString().slice(-4)}.jpg`,
        uploadedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      };

      // Save to AsyncStorage
      const updatedAttachments = [...attachments, newAttachment];
      setAttachments(updatedAttachments);
      await AsyncStorage.setItem(
        `load_attachments_${selectedLoadForManage.id}`,
        JSON.stringify(updatedAttachments)
      );

      // Upload to server using saveDocument
      try {
        await saveDocument({
          docType: 'POD',
          description: `POD for load ${selectedLoadForManage.id} (${newAttachment.name})`,
          uploadedAt: new Date().toISOString(),
        });
      } catch (uploadErr) {
        console.warn('Document server save failed, saved locally only:', uploadErr);
      }

      Alert.alert('Success', 'Document attached successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to attach document: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const recordGateTime = (field) => {
    const nowStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ')';
    setGateTimes(prev => ({ ...prev, [field]: nowStr }));
  };

  const autoLogGateTimesForStatus = (status, currentTimes) => {
    const nowStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ')';
    const updated = { ...currentTimes };

    if (status === 'En Route to Pick-up') {
      if (!updated.gateInPickup) updated.gateInPickup = nowStr;
    } else if (status === 'Loaded') {
      if (!updated.gateInPickup) updated.gateInPickup = nowStr;
      if (!updated.gateOutPickup) updated.gateOutPickup = nowStr;
    } else if (status === 'At Delivery') {
      if (!updated.gateInDelivery) updated.gateInDelivery = nowStr;
    } else if (status === 'Delivered') {
      if (!updated.gateInDelivery) updated.gateInDelivery = nowStr;
      if (!updated.gateOutDelivery) updated.gateOutDelivery = nowStr;
    } else if (['Invoiced', 'Payment Overdue', 'Paid'].includes(status)) {
      if (!updated.gateInPickup) updated.gateInPickup = nowStr;
      if (!updated.gateOutPickup) updated.gateOutPickup = nowStr;
      if (!updated.gateInDelivery) updated.gateInDelivery = nowStr;
      if (!updated.gateOutDelivery) updated.gateOutDelivery = nowStr;
    }
    return updated;
  };

  const handleSaveManageChanges = async () => {
    try {
      // Save gate times locally
      await AsyncStorage.setItem(`load_gate_times_${selectedLoadForManage.id}`, JSON.stringify(gateTimes));
      
      try {
        const token = await getAuthToken();
        // Call PATCH status update endpoint from tms.js
        await updateLoadStatus(selectedLoadForManage.id, manageStatus, token);
      } catch (apiErr) {
        console.warn("API load status update failed, saving status locally as fallback:", apiErr);
        await AsyncStorage.setItem(`load_status_override_${selectedLoadForManage.id}`, manageStatus);
      }

      const successMsg = 'Load updates successfully saved!';
      const proceedWithCompletion = () => {
        setManageModalVisible(false);
        loadLoads();
        
        // If load was marked completed/delivered, prompt for invoice creation
        const isDeliveredOrCompleted = ['Delivered', 'Invoiced', 'Payment Overdue', 'Paid', 'completed'].includes(manageStatus);
        if (isDeliveredOrCompleted && onCreateInvoice) {
          const askInvoice = () => {
            if (Platform.OS === 'web') {
              if (confirm('Would you like to generate an invoice for this completed load now?')) {
                onCreateInvoice(selectedLoadForManage);
              }
            } else {
              Alert.alert(
                'Create Invoice',
                'Would you like to generate an invoice for this completed load now?',
                [
                  { text: 'No' },
                  { text: 'Yes, Create Invoice', onPress: () => onCreateInvoice(selectedLoadForManage) }
                ]
              );
            }
          };
          setTimeout(askInvoice, 400);
        }
      };

      if (Platform.OS === 'web') {
        alert(successMsg);
        proceedWithCompletion();
      } else {
        Alert.alert('✅ Saved', successMsg, [
          { text: 'OK', onPress: proceedWithCompletion }
        ]);
      }
    } catch (err) {
      const errMsg = 'Failed to save load updates: ' + err.message;
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    }
  };

  const handleAccept = (load) => {
    Alert.alert('Accept Load', `Accepting load ${load.loadId || load.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Accept', 
        style: 'default', 
        onPress: async () => {
          try {
            const token = await getAuthToken();
            const user = await getAuthUser();
            const driverId = user?.id || user?.driverId || 'driver_123';
            await acceptLoad(load.id, driverId, token);
            Alert.alert('Success', 'Load accepted successfully!', [
              {
                text: 'OK',
                onPress: () => {
                  setActiveTab('active');
                }
              }
            ]);
          } catch (err) {
            Alert.alert('Error', 'Failed to accept load: ' + err.message);
          }
        } 
      },
    ]);
  };

  const handleViewRoute = (load) => {
    Alert.alert('View Route', `Route: ${load.startLocation} → ${load.endLocation}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          {onBackToHome && (
            <Pressable 
              style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
              onPress={onBackToHome}
              accessibilityRole="button"
              accessibilityLabel="Back to Home"
            >
              <Text style={styles.headerIconText}>←</Text>
            </Pressable>
          )}
          <Text style={styles.headerTitle}>Load Management</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {apiError && (
          <View style={styles.apiErrorBanner}>
            <Text style={styles.apiErrorText}>⚠️ {apiError} (Offline/Demo Mode)</Text>
          </View>
        )}
        {/* Segmented Tabs */}
        <View style={styles.tabBar}>
          {filteredTabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
            >
              <Text 
                style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumScaleFactor={0.8}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{activeTab.toUpperCase()}</Text>
            <Text style={styles.sectionSubtitle}>
              {loads.length} {activeTab === 'active' ? 'assigned loads' : activeTab === 'history' ? 'completed loads' : 'high-yield loads'} matching your profile
            </Text>
          </View>
          <View style={styles.refreshBadge}>
            <Text style={styles.refreshText}>REFRESH: 45s</Text>
          </View>
        </View>

        {/* Cards */}
        {loading ? (
          <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.cardsList}>
            {loads.map((load, idx) => (
              <LoadCard
                key={load.id || idx}
                load={load}
                pulseType={load.pulseType}
                activeTab={activeTab}
                onViewRoute={() => handleViewRoute(load)}
                onAccept={() => handleAccept(load)}
                onManage={() => openManageModal(load)}
                onCreateInvoice={() => onCreateInvoice && onCreateInvoice(load)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Map Button */}
      <Pressable
        style={({ pressed }) => [styles.fabMap, pressed && styles.pressed]}
        onPress={() => {
          Alert.alert("Map View", "Loading interactive loads route map...");
        }}
        accessibilityRole="button"
        accessibilityLabel="Show Map"
      >
        <Text style={styles.fabMapText}>🗺️</Text>
      </Pressable>
      {/* Active Load Manager Modal */}
      <Modal visible={manageModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>MANAGE ACTIVE LOAD</Text>
              <Pressable onPress={() => setManageModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={{ fontSize: 18, color: T.text.primary }}>✕</Text>
              </Pressable>
            </View>

            {selectedLoadForManage && (
              <ScrollView contentContainerStyle={{ gap: 16 }}>
                <View style={styles.loadSummaryBox}>
                  <Text style={styles.loadSummaryId}>{selectedLoadForManage.loadId}</Text>
                  <Text style={styles.loadSummaryRoute}>{selectedLoadForManage.startLocation} → {selectedLoadForManage.endLocation}</Text>
                </View>

                {/* Status Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>LOAD STATUS</Text>
                  <Pressable
                    style={styles.dropdownSelector}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                    accessibilityRole="button"
                    accessibilityLabel="Select load status"
                  >
                    <Text style={styles.dropdownSelectorText}>{manageStatus}</Text>
                    <Text style={styles.dropdownSelectorArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
                  </Pressable>
                  
                  {dropdownOpen && (
                    <View style={styles.dropdownOptionsContainer}>
                      <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                        {STATUS_OPTIONS.map((status) => (
                          <Pressable
                            key={status}
                            style={[
                              styles.dropdownOption,
                              manageStatus === status && styles.dropdownOptionActive
                            ]}
                            onPress={() => {
                              setManageStatus(status);
                              setDropdownOpen(false);
                              setGateTimes(prev => autoLogGateTimesForStatus(status, prev));
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                manageStatus === status && styles.dropdownOptionTextActive
                              ]}
                            >
                              {status}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Gate Times Logging */}
                <View style={styles.gateTimesBox}>
                  <Text style={styles.gateSectionTitle}>LOG GATE TIMES (DEVICE SYNCED)</Text>
                  
                  {/* Pickup Gates */}
                  <View style={styles.gateRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gateLabel}>PICKUP CHECK-IN</Text>
                      <Text style={styles.gateTimeText}>{gateTimes.gateInPickup || 'Not Recorded'}</Text>
                    </View>
                    <Pressable
                      style={[styles.recordTimeBtn, gateTimes.gateInPickup && styles.recordTimeBtnSuccess]}
                      onPress={() => recordGateTime('gateInPickup')}
                    >
                      <Text style={styles.recordTimeBtnText}>{gateTimes.gateInPickup ? 'RE-LOG' : 'LOG TIME'}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.gateRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gateLabel}>PICKUP CHECK-OUT</Text>
                      <Text style={styles.gateTimeText}>{gateTimes.gateOutPickup || 'Not Recorded'}</Text>
                    </View>
                    <Pressable
                      style={[styles.recordTimeBtn, gateTimes.gateOutPickup && styles.recordTimeBtnSuccess]}
                      onPress={() => recordGateTime('gateOutPickup')}
                    >
                      <Text style={styles.recordTimeBtnText}>{gateTimes.gateOutPickup ? 'RE-LOG' : 'LOG TIME'}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.separator} />

                  {/* Delivery Gates */}
                  <View style={styles.gateRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gateLabel}>DELIVERY CHECK-IN</Text>
                      <Text style={styles.gateTimeText}>{gateTimes.gateInDelivery || 'Not Recorded'}</Text>
                    </View>
                    <Pressable
                      style={[styles.recordTimeBtn, gateTimes.gateInDelivery && styles.recordTimeBtnSuccess]}
                      onPress={() => recordGateTime('gateInDelivery')}
                    >
                      <Text style={styles.recordTimeBtnText}>{gateTimes.gateInDelivery ? 'RE-LOG' : 'LOG TIME'}</Text>
                    </Pressable>
                  </View>

                  <View style={styles.gateRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gateLabel}>DELIVERY CHECK-OUT</Text>
                      <Text style={styles.gateTimeText}>{gateTimes.gateOutDelivery || 'Not Recorded'}</Text>
                    </View>
                    <Pressable
                      style={[styles.recordTimeBtn, gateTimes.gateOutDelivery && styles.recordTimeBtnSuccess]}
                      onPress={() => recordGateTime('gateOutDelivery')}
                    >
                      <Text style={styles.recordTimeBtnText}>{gateTimes.gateOutDelivery ? 'RE-LOG' : 'LOG TIME'}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Load Documents Attachment Portal */}
                <View style={styles.gateTimesBox}>
                  <Text style={styles.gateSectionTitle}>LOAD DOCUMENTS (POD / BOL)</Text>
                  
                  {attachments.length === 0 ? (
                    <Text style={{ fontSize: 12, color: T.text.secondary, fontStyle: 'italic', marginVertical: 4 }}>
                      No documents attached to this load yet.
                    </Text>
                  ) : (
                    <View style={{ gap: 8, marginVertical: 4 }}>
                      {attachments.map((item) => (
                        <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: T.background.containerHighest, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: T.border.variant }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: T.text.primary }} numberOfLines={1}>
                              📄 {item.name}
                            </Text>
                            <Text style={{ fontSize: 10, color: T.text.muted, marginTop: 1 }}>
                              Uploaded: {item.uploadedAt}
                            </Text>
                          </View>
                          <Pressable
                            onPress={async () => {
                              const filtered = attachments.filter(a => a.id !== item.id);
                              setAttachments(filtered);
                              await AsyncStorage.setItem(`load_attachments_${selectedLoadForManage.id}`, JSON.stringify(filtered));
                              Alert.alert('Deleted', 'Document attachment removed.');
                            }}
                            style={{ padding: 4 }}
                          >
                            <Text style={{ color: BRAND.crimsonRed, fontSize: 13, fontWeight: '700' }}>Remove</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  <Pressable
                    style={({ pressed }) => [
                      styles.recordTimeBtn,
                      { backgroundColor: BRAND.crimsonRed, borderColor: BRAND.crimsonRed, height: 40, marginTop: 4 },
                      pressed && { opacity: 0.8 },
                      uploading && { opacity: 0.6 }
                    ]}
                    onPress={handleAttachDocument}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>+ ATTACH DOCUMENT</Text>
                    )}
                  </Pressable>
                </View>

                {/* Save Button */}
                <Pressable
                  style={({ pressed }) => [styles.saveChangesBtn, pressed && { opacity: 0.8 }]}
                  onPress={handleSaveManageChanges}
                >
                  <Text style={styles.saveChangesBtnText}>✓ SAVE STATUS & TIMES</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, backgroundColor: 'transparent' },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: T.border.variant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: T.text.primary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: T.background.base === '#edeef3' ? '#ffffff' : '#1e1b1b',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BRAND.crimsonRed,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: T.border.variant,
    paddingBottom: 10,
    marginBottom: 16,
  },
  modalTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: T.primary,
    letterSpacing: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  loadSummaryBox: {
    backgroundColor: T.background.containerHighest,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: T.border.variant,
    marginBottom: 8,
  },
  loadSummaryId: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text.primary,
  },
  loadSummaryRoute: {
    fontSize: 13,
    color: T.text.secondary,
    marginTop: 2,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: T.border.variant,
    backgroundColor: T.background.container,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dropdownSelectorText: {
    ...TYPOGRAPHY.bodyMd,
    color: T.text.primary,
    fontWeight: '700',
  },
  dropdownSelectorArrow: {
    fontSize: 12,
    color: T.text.secondary,
  },
  dropdownOptionsContainer: {
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: T.border.variant,
    backgroundColor: T.background.containerHighest === '#edeef3' ? '#f5f6f9' : '#272323',
    overflow: 'hidden',
    marginBottom: 8,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border.variant,
  },
  dropdownOptionActive: {
    backgroundColor: BRAND.crimsonRed + '20',
  },
  dropdownOptionText: {
    ...TYPOGRAPHY.bodyMd,
    color: T.text.secondary,
  },
  dropdownOptionTextActive: {
    color: T.primary,
    fontWeight: '700',
  },
  actionsDropdown: {
    position: 'absolute',
    bottom: 48,
    right: 0,
    width: '150%',
    backgroundColor: T.background.containerHighest === '#edeef3' ? '#ffffff' : '#221e1e',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BRAND.profitGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  actionsDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  actionsDropdownItemText: {
    ...TYPOGRAPHY.headlineSm,
    color: T.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  gateTimesBox: {
    backgroundColor: T.background.container,
    borderWidth: 1,
    borderColor: T.border.variant,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  gateSectionTitle: {
    ...TYPOGRAPHY.labelData,
    color: T.text.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  gateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  gateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: T.text.secondary,
  },
  gateTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text.primary,
    marginTop: 2,
  },
  recordTimeBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: T.background.containerHighest,
    borderWidth: 1,
    borderColor: T.border.variant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordTimeBtnSuccess: {
    backgroundColor: BRAND.crimsonRed + '20',
    borderColor: BRAND.crimsonRed,
  },
  recordTimeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: T.text.primary,
  },
  saveChangesBtn: {
    height: 52,
    backgroundColor: T.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveChangesBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: T.border.variant,
    marginVertical: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 22,
    color: T.text.primary,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: T.background.containerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border.variant,
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
    backgroundColor: T.background.containerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: T.primary,
  },
  avatarText: {
    fontSize: 16,
    color: T.text.primary,
  },
  fabMap: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  fabMapText: {
    fontSize: 24,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: T.background.base === '#edeef3' ? 'rgba(200, 202, 215, 0.65)' : 'rgba(23, 12, 12, 0.60)',
    borderRadius: 12,
    padding: 4,
    margin: SPACING.marginMobile,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: T.border.variant,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: T.primary },
  tabText: { ...TYPOGRAPHY.headlineSm, color: T.text.secondary, fontSize: 14 },
  tabTextActive: { color: '#ffffff', fontWeight: '700' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.stackMd,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: T.primary,
    letterSpacing: 1.5,
    fontSize: 14,
  },
  sectionSubtitle: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, marginTop: 2 },
  refreshBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: T.border.variant,
    backgroundColor: T.background.containerHighest,
  },
  refreshText: { ...TYPOGRAPHY.labelData, color: T.text.secondary },

  // Cards list
  cardsList: { paddingHorizontal: SPACING.marginMobile, gap: SPACING.stackMd, paddingBottom: 100 },

  // Load card
  loadCard: {
    borderLeftWidth: 4,
    padding: SPACING.stackMd,
    gap: SPACING.stackMd,
    overflow: 'hidden',
  },
  loadCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  loadCardHeaderRight: { alignItems: 'flex-end', gap: 4 },
  loadIdLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, opacity: 0.7 },
  loadId: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },

  // Pulse badge
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    gap: 4,
  },
  pulseBadgeText: { ...TYPOGRAPHY.labelData },
  rpmText: { ...TYPOGRAPHY.labelData, marginTop: 2 },

  // Route
  routeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  routeIconCol: { alignItems: 'center', gap: 2, paddingTop: 2 },
  routeIcon: { fontSize: 18 },
  routeLine: { width: 1, height: 28, backgroundColor: T.border.variant },
  routeDetails: { flex: 1, gap: SPACING.stackMd },
  routeStop: { gap: 2 },
  routeStopLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary },
  routeCity: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: T.border.variant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricCell: { flex: 1, padding: 10, alignItems: 'center' },
  metricBorderRight: { borderRightWidth: 1, borderRightColor: T.border.variant },
  metricLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10 },
  metricValue: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, marginTop: 2 },

  // Action buttons
  cardActions: { flexDirection: 'row', gap: 10 },
  routeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: T.background.containerHighest,
    borderWidth: 1,
    borderColor: T.border.variant,
  },
  routeBtnText: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, fontSize: 13 },
  acceptBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: T.primary,
    alignItems: 'center',
  },
  acceptBtnText: { ...TYPOGRAPHY.headlineSm, color: '#ffffff', fontWeight: '700', fontSize: 13 },
  pressed: { opacity: 0.75 },
  apiErrorBanner: {
    backgroundColor: 'rgba(198, 40, 40, 0.15)',
    borderWidth: 1,
    borderColor: '#c62828',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  apiErrorText: {
    color: '#e53935',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
}));

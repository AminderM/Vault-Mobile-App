import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLoads } from '../lib/api';
import { BRAND, TYPOGRAPHY, SPACING, createGlassCard, useTheme, createThemedStyleSheet } from '../lib/theme';

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
  { id: 'marketplace', label: 'Market Place' },
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

function LoadCard({ load, pulseType = 'avg', onViewRoute, onAccept }) {
  const { t: T } = useTheme();
  const styles = useStyles();
  const STATUS_STYLES = getStatusStyles(T);
  const pulse = STATUS_STYLES[pulseType] || STATUS_STYLES.avg;
  return (
    <View style={[styles.loadCard, { borderLeftColor: pulse.leftBorder }]}>
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
        <Pressable
          style={({ pressed }) => [styles.acceptBtn, pressed && styles.pressed]}
          onPress={onAccept}
          accessibilityRole="button"
          accessibilityLabel="Accept load"
        >
          <Text style={styles.acceptBtnText}>ACCEPT LOAD</Text>
        </Pressable>
      </View>
    </View>
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
  },
];

export default function LoadsScreen({ onBackToHome, onOpenProfile }) {
  const [loads, setLoads] = useState(DEMO_LOADS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');
  const { t: T } = useTheme();
  const styles = useStyles();

  useEffect(() => {
    const loadLoads = async () => {
      try {
        setLoading(true);
        const filters = activeTab !== 'marketplace' && activeTab !== 'available' ? { status: activeTab } : {};
        const data = await getLoads(filters);
        if (data.loads && data.loads.length > 0) {
          const mapped = data.loads.map((l, i) => ({
            ...l,
            loadId: l.id,
            rpm: l.rateAmount && l.distance
              ? `$${(l.rateAmount / parseFloat(l.distance)).toFixed(2)}`
              : '$3.22',
            pulseType: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'hazmat' : 'avg',
          }));
          if (activeTab === 'marketplace') {
            setLoads(mapped.filter(l => l.pulseType === 'high' || l.pulseType === 'hazmat'));
          } else {
            setLoads(mapped);
          }
        } else {
          if (activeTab === 'marketplace') {
            setLoads(DEMO_LOADS.filter(l => l.pulseType === 'high' || l.pulseType === 'hazmat'));
          } else {
            setLoads(DEMO_LOADS);
          }
        }
      } catch {
        if (activeTab === 'marketplace') {
          setLoads(DEMO_LOADS.filter(l => l.pulseType === 'high' || l.pulseType === 'hazmat'));
        } else {
          setLoads(DEMO_LOADS);
        }
      } finally {
        setLoading(false);
      }
    };

    loadLoads();
  }, [activeTab]);

  const handleAccept = (load) => {
    Alert.alert('Accept Load', `Accepting load ${load.loadId}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', style: 'default', onPress: () => Alert.alert('Success', 'Load accepted!') },
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
          {onBackToHome ? (
            <Pressable 
              style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
              onPress={onBackToHome}
              accessibilityRole="button"
              accessibilityLabel="Back to Home"
            >
              <Text style={styles.headerIconText}>←</Text>
            </Pressable>
          ) : (
            <Pressable style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}>
              <Text style={styles.headerIconText}>☰</Text>
            </Pressable>
          )}
          <View style={styles.logoBadge}>
            <Text style={{ fontSize: 16 }}>🛡️</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}>
            <Text style={styles.headerIconText}>🔍</Text>
          </Pressable>
          <Pressable 
            style={styles.avatarBtn}
            onPress={() => onOpenProfile && onOpenProfile()}
            accessibilityRole="button"
            accessibilityLabel="Open Profile"
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Segmented Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>MARKETPLACE</Text>
            <Text style={styles.sectionSubtitle}>
              {loads.length} High-yield loads matching your profile
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
                onViewRoute={() => handleViewRoute(load)}
                onAccept={() => handleAccept(load)}
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
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.background.base },
  container: { flex: 1, backgroundColor: T.background.base },

  topHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: T.background.dark,
    borderBottomWidth: 1,
    borderBottomColor: T.border.variant,
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
    backgroundColor: T.background.containerLow,
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
    ...createGlassCard(),
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
}));

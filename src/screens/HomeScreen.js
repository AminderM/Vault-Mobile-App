import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, TYPOGRAPHY, SPACING, createGlassCard, useTheme, createThemedStyleSheet } from '../lib/theme';

const VAULT_RECENT = [
  { id: '1', name: 'BOL_49208_SIGN.pdf', context: 'L-49208 • 2h ago', icon: '📄' },
  { id: '2', name: 'FUEL_RECEIPT_391.jpg', context: 'EXPENSE • 5h ago', icon: '🖼' },
];

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t: T } = useTheme();
  const styles = useStyles();

  const QUICK_ACTIONS = [
    { id: 'calc', label: 'LOAD CALC', icon: '🧮', color: T.primary },
    { id: 'invoices', label: 'INVOICES', icon: '📋', color: T.secondary },
    { id: 'expenses', label: 'EXPENSES', icon: '🧾', color: T.tertiary },
    { id: 'vault', label: 'DOC VAULT', icon: '🗄', color: T.text.muted },
  ];

  const COMPLIANCE_ITEMS = [
    { id: 'eld', label: 'ELD LOGS (24H)', status: '• COMPLIANT', statusColor: T.status.success, bg: T.compliance.valid, border: T.compliance.valid },
    { id: 'dq', label: 'DQ FILES', status: '• 1 EXPIRING', statusColor: T.status.warning, bg: T.compliance.warning, border: T.compliance.warning },
    { id: 'ifta', label: 'IFTA Q3', status: 'SUBMITTED', statusColor: T.text.muted, bg: T.background.container, border: T.border.variant },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Bento Stats Grid ── */}
        <View style={styles.bentoGrid}>
          {/* Greeting card – spans full width */}
          <View style={[styles.greetingCard, createGlassCard()]}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}, Jazzie</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>🌤</Text>
                <Text style={styles.locationText}>72°F • Houston, TX</Text>
              </View>
            </View>
            <View style={styles.fuelBadge}>
              <Text style={styles.fuelBadgeText}>⛽  SHELL • 0.8 MI AWAY</Text>
            </View>
          </View>

          {/* Active Loads */}
          <View style={[styles.statCard, createGlassCard(), { borderLeftColor: T.secondary }]}>
            <Text style={styles.statLabel}>ACTIVE LOADS</Text>
            <Text style={[styles.statNumber, { color: T.secondary }]}>08</Text>
          </View>

          {/* RPM Average */}
          <View style={[styles.statCard, createGlassCard(), { borderLeftColor: BRAND.hazardOrange }]}>
            <Text style={styles.statLabel}>RPM AVG</Text>
            <Text style={[styles.statNumber, { color: T.text.primary }]}>$3.22</Text>
          </View>
        </View>

        {/* ── Quick Actions Grid ── */}
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [styles.quickActionTile, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '33' }]}>
                <Text style={styles.quickActionEmoji}>{action.icon}</Text>
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Current Active Load ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CURRENT LOAD</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="View all loads">
            <Text style={styles.viewAllText}>View All Loads</Text>
          </Pressable>
        </View>

        <View style={[styles.loadCard, createGlassCard(), { borderLeftColor: T.primary }]}>
          {/* Status badge */}
          <View style={styles.inTransitBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.inTransitText}>IN TRANSIT</Text>
          </View>

          {/* Load ID row */}
          <View style={styles.loadIdRow}>
            <View style={styles.truckIconBox}>
              <Text style={{ fontSize: 22 }}>🚛</Text>
            </View>
            <View>
              <Text style={styles.loadIdText}>L-49208-TX</Text>
              <Text style={styles.loadSubtext}>Reefer | 42,000 lbs</Text>
            </View>
          </View>

          {/* Route visualization */}
          <View style={styles.routeVisualization}>
            <View style={styles.routeStop}>
              <Text style={[styles.routeStopDot, { color: BRAND.profitGreen }]}>📍</Text>
              <View style={styles.routeDash} />
            </View>
            <View style={styles.routeInfo}>
              <View>
                <Text style={styles.routeStopLabel}>PICKUP</Text>
                <Text style={styles.routeCity}>Houston, TX</Text>
                <Text style={styles.routeDate}>Oct 24, 08:00 AM</Text>
              </View>
              <View>
                <Text style={styles.routeStopLabel}>DELIVERY</Text>
                <Text style={styles.routeCity}>Chicago, IL</Text>
                <Text style={styles.routeDate}>Oct 26, 02:00 PM</Text>
              </View>
            </View>
            <View style={styles.routeStop}>
              <Text style={[styles.routeStopDot, { color: T.primary }]}>➤</Text>
            </View>
          </View>

          {/* Metrics row */}
          <View style={styles.loadMetrics}>
            <View style={[styles.metricCol, styles.metricBorderRight]}>
              <Text style={styles.metricLabel}>RATE</Text>
              <Text style={[styles.metricValue, { color: BRAND.profitGreen }]}>$3,450</Text>
            </View>
            <View style={[styles.metricCol, styles.metricBorderRight]}>
              <Text style={styles.metricLabel}>MILES</Text>
              <Text style={styles.metricValue}>1,082</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>RPM</Text>
              <Text style={[styles.metricValue, { color: BRAND.hazardOrange }]}>$3.18</Text>
            </View>
          </View>
        </View>

        {/* ── Bottom panels: Compliance + Vault Recent ── */}
        <View style={styles.bottomPanels}>
          {/* Compliance Status */}
          <View style={[styles.panel, { backgroundColor: T.background.containerLow, borderColor: T.border.variant }]}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>COMPLIANCE STATUS</Text>
              <Text style={{ color: BRAND.profitGreen }}>✓</Text>
            </View>
            {COMPLIANCE_ITEMS.map((item) => (
              <View key={item.id} style={[styles.complianceItem, { backgroundColor: item.bg + '4D', borderColor: item.border }]}>
                <Text style={styles.complianceLabel}>{item.label}</Text>
                <Text style={[styles.complianceStatus, { color: item.statusColor }]}>{item.status}</Text>
              </View>
            ))}
          </View>

          {/* Vault Recent */}
          <View style={[styles.panel, { backgroundColor: T.background.containerLow, borderColor: T.border.variant }]}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>VAULT RECENT</Text>
              <Text style={{ color: T.text.secondary }}>⋮</Text>
            </View>
            {VAULT_RECENT.map((doc) => (
              <Pressable
                key={doc.id}
                style={({ pressed }) => [styles.vaultItem, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={doc.name}
              >
                <View style={styles.vaultItemIcon}>
                  <Text style={{ fontSize: 20 }}>{doc.icon}</Text>
                </View>
                <View style={styles.vaultItemInfo}>
                  <Text style={styles.vaultItemName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={styles.vaultItemContext}>{doc.context}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.background.base },
  container: { flex: 1, backgroundColor: T.background.base },

  // Bento grid
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.stackMd,
    gap: SPACING.base,
  },
  greetingCard: {
    width: '100%',
    padding: SPACING.stackMd,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: T.primary,
    gap: SPACING.stackMd,
  },
  greetingText: { ...TYPOGRAPHY.headlineLg, color: T.text.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  locationIcon: { fontSize: 14 },
  locationText: { ...TYPOGRAPHY.labelData, color: T.text.secondary },
  fuelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: T.primary + '33',
    borderWidth: 1,
    borderColor: T.primary + '4D',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fuelBadgeText: { ...TYPOGRAPHY.labelData, color: T.primary, letterSpacing: 1 },
  statCard: {
    flex: 1,
    padding: SPACING.stackMd,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 6,
  },
  statLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary },
  statNumber: { ...TYPOGRAPHY.displayMetricsMobile, fontSize: 28, fontWeight: '700' },

  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.stackMd,
    gap: SPACING.gutter,
  },
  quickActionTile: {
    width: '21.5%',
    backgroundColor: T.background.containerHigh,
    borderWidth: 1,
    borderColor: T.border.variant,
    borderRadius: 12,
    padding: SPACING.stackMd,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionLabel: { ...TYPOGRAPHY.labelData, color: T.text.primary, fontSize: 9, textAlign: 'center' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.stackLg,
    paddingBottom: SPACING.stackSm,
  },
  sectionTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, letterSpacing: 1, fontSize: 14 },
  viewAllText: { ...TYPOGRAPHY.labelData, color: T.primary, fontSize: 10 },

  // Current load card
  loadCard: {
    marginHorizontal: SPACING.marginMobile,
    borderLeftWidth: 4,
    padding: SPACING.stackMd,
    gap: SPACING.stackMd,
    position: 'relative',
  },
  inTransitBadge: {
    position: 'absolute',
    top: SPACING.stackMd,
    right: SPACING.stackMd,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.primary + '33',
    borderWidth: 1,
    borderColor: T.primary + '4D',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.primary },
  inTransitText: { ...TYPOGRAPHY.labelData, color: T.primary, fontSize: 10 },
  loadIdRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  truckIconBox: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: T.background.containerHighest,
    borderWidth: 1,
    borderColor: T.border.variant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadIdText: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },
  loadSubtext: { ...TYPOGRAPHY.labelData, color: T.text.secondary, marginTop: 2 },

  // Route visualization
  routeVisualization: { flexDirection: 'row', gap: 10 },
  routeStop: { alignItems: 'center', paddingTop: 2 },
  routeStopDot: { fontSize: 18 },
  routeDash: { width: 1, flex: 1, borderStyle: 'dashed', borderWidth: 0.5, borderColor: T.border.variant, marginVertical: 4 },
  routeInfo: { flex: 1, gap: SPACING.stackLg },
  routeStopLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10 },
  routeCity: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },
  routeDate: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, fontSize: 12, marginTop: 2 },

  // Load metrics
  loadMetrics: {
    flexDirection: 'row',
    backgroundColor: T.background.dark + '80',
    borderRadius: 4,
  },
  metricCol: { flex: 1, padding: SPACING.stackMd, alignItems: 'center' },
  metricBorderRight: { borderRightWidth: 1, borderRightColor: T.border.variant },
  metricLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10 },
  metricValue: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, marginTop: 2 },

  // Bottom panels
  bottomPanels: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.stackLg,
    gap: SPACING.gutter,
    paddingBottom: 100,
  },
  panel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.stackMd,
    gap: SPACING.stackSm,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  panelTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, fontSize: 13, letterSpacing: 0.5 },

  // Compliance items
  complianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  complianceLabel: { ...TYPOGRAPHY.labelData, color: T.text.primary, fontSize: 10 },
  complianceStatus: { ...TYPOGRAPHY.labelData, fontSize: 10 },

  // Vault recent items
  vaultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    borderRadius: 8,
  },
  vaultItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: T.background.containerHighest + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultItemInfo: { flex: 1 },
  vaultItemName: { ...TYPOGRAPHY.labelData, color: T.text.primary, fontSize: 11 },
  vaultItemContext: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 9, textTransform: 'uppercase', marginTop: 2 },

  pressed: { opacity: 0.75 },
}));
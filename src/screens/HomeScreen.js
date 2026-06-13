import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, TYPOGRAPHY, SPACING, createGlassCard, createStatusBorderCard, useTheme, createThemedStyleSheet } from '../lib/theme';



export default function HomeScreen({ onNavigateToMarketplace, onNavigate }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t: T } = useTheme();
  const styles = useStyles();

  const QUICK_ACTIONS = [
    { id: 'calc', label: 'LOAD CALC', icon: '🧮', color: T.primary },
    { id: 'invoices', label: 'INVOICES', icon: '📋', color: T.secondary },
    { id: 'expenses', label: 'EXPENSES', icon: '🧾', color: T.tertiary },
    { id: 'vault', label: 'DOC VAULT', icon: '🗄', color: T.text.muted },
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
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ── Bento Stats Grid ── */}
        <View style={styles.bentoGrid}>
          {/* Greeting card – spans full width */}
          <View style={[styles.greetingCard, createStatusBorderCard(T.primary)]}>
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
          <View style={[styles.statCard, createStatusBorderCard(T.secondary)]}>
            <Text style={styles.statLabel}>ACTIVE LOADS</Text>
            <Text style={[styles.statNumber, { color: T.secondary }]}>08</Text>
          </View>

          {/* RPM Average */}
          <View style={[styles.statCard, createStatusBorderCard(BRAND.hazardOrange)]}>
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
              onPress={() => {
                if (onNavigate) {
                  if (action.id === 'calc') onNavigate('tools', 'calculator');
                  else if (action.id === 'invoices') onNavigate('tools', 'invoices');
                  else if (action.id === 'expenses') onNavigate('finance');
                  else if (action.id === 'vault') onNavigate('vault');
                }
              }}
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
          <Pressable 
            accessibilityRole="button" 
            accessibilityLabel="View all loads"
            onPress={onNavigateToMarketplace}
          >
            <Text style={styles.viewAllText}>View All Loads</Text>
          </Pressable>
        </View>

        <View style={[styles.loadCard, createStatusBorderCard(T.primary)]}>
          <Pressable onPress={onNavigateToMarketplace} style={{ gap: 12 }}>
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
                <View style={styles.routeInfoSeparator} />
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
          </Pressable>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <Pressable
              style={({ pressed }) => [
                styles.viewRouteBtn,
                pressed && styles.pressed
              ]}
              onPress={() => {
                if (Platform.OS === 'web') {
                  alert("Route Details:\nHouston, TX → Chicago, IL\nDistance: 1,082 mi\nEst. Time: 18.5 hrs");
                } else {
                  Alert.alert("Route Details", "Houston, TX → Chicago, IL\nDistance: 1,082 mi\nEst. Time: 18.5 hrs");
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="View Route"
            >
              <Text style={styles.viewRouteBtnText}>🗺️  VIEW ROUTE</Text>
            </Pressable>
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
    ...createGlassCard(),
    borderColor: BRAND.crimsonRed + '80',
    borderWidth: 1.5,
    padding: SPACING.stackMd,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
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

  routeInfoSeparator: {
    height: 1,
    backgroundColor: T.border.muted,
    marginVertical: 4,
  },

  viewRouteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: BRAND.crimsonRed,
    borderWidth: 1,
    borderColor: BRAND.crimsonRedLight + '80',
    shadowColor: BRAND.crimsonRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 4,
  },
  viewRouteBtnText: {
    ...TYPOGRAPHY.headlineSm,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  pressed: { opacity: 0.75 },
}));
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
import { BRAND, TYPOGRAPHY, SPACING, GlassCard, StatusBorderCard, createGlassCard, createStatusBorderCard, useTheme, createThemedStyleSheet } from '../lib/theme';



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
          <StatusBorderCard borderColor={T.primary + '8C'} style={styles.greetingCard}>
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
          </StatusBorderCard>

          {/* Active Loads & Completed Loads */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <StatusBorderCard borderColor={T.secondary + '8C'} style={styles.statCard}>
              <Text style={styles.statLabel}>ACTIVE LOADS</Text>
              <Text style={[styles.statNumber, { color: T.secondary }]}>08</Text>
            </StatusBorderCard>

            <StatusBorderCard borderColor={BRAND.profitGreen + '8C'} style={styles.statCard}>
              <Text style={styles.statLabel}>COMPLETED LOADS</Text>
              <Text style={[styles.statNumber, { color: BRAND.profitGreen }]}>12</Text>
            </StatusBorderCard>
          </View>

          {/* RPM Average & Fuel Consumption */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <StatusBorderCard borderColor={BRAND.hazardOrange + '8C'} style={styles.statCard}>
              <Text style={styles.statLabel}>RPM AVG</Text>
              <Text style={[styles.statNumber, { color: T.text.primary }]}>$3.22</Text>
            </StatusBorderCard>

            <StatusBorderCard borderColor={T.tertiary + '8C'} style={styles.statCard}>
              <Text style={styles.statLabel}>FUEL CONSUMPTION</Text>
              <Text style={[styles.statNumber, { color: T.text.primary }]}>6.2 MPG</Text>
            </StatusBorderCard>
          </View>

          {/* Miles Driven (Spans full width) */}
          <StatusBorderCard borderColor={T.primary + '8C'} style={styles.milesCard}>
            <Text style={styles.statLabel}>TOTAL MILES DRIVEN</Text>
            <Text style={[styles.statNumberBig, { color: T.primary }]}>14,820 mi</Text>
          </StatusBorderCard>

          {/* Loaded Miles & Empty Miles Driven */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <StatusBorderCard borderColor={T.secondary + '8C'} style={styles.statCard}>
              <Text style={styles.statLabel}>LOADED MILES</Text>
              <Text style={[styles.statNumber, { color: T.text.primary }]}>12,400</Text>
            </StatusBorderCard>

            <StatusBorderCard borderColor={BRAND.crimsonRed + '8C'} style={styles.statCard}>
              <Text style={styles.statLabel}>EMPTY MILES</Text>
              <Text style={[styles.statNumber, { color: BRAND.crimsonRed }]}>2,420</Text>
            </StatusBorderCard>
          </View>
        </View>

        {/* ── Quick Actions Grid ── */}
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <View key={action.id} style={{ width: '22%' }}>
              <SkeuomorphicButton
                id={action.id}
                label={action.label}
                isDark={T.background.base !== '#edeef3'}
                onPress={() => {
                  if (onNavigate) {
                    if (action.id === 'calc') onNavigate('tools', 'calculator');
                    else if (action.id === 'invoices') onNavigate('tools', 'invoices');
                    else if (action.id === 'expenses') onNavigate('finance', 'expenses');
                    else if (action.id === 'vault') onNavigate('vault');
                  }
                }}
              />
            </View>
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

        <StatusBorderCard borderColor={T.primary + '8C'} style={styles.loadCard}>
          <Pressable onPress={onNavigateToMarketplace} style={{ gap: 12 }}>
            {/* Status badge */}
            <View style={styles.inTransitBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.inTransitText}>IN TRANSIT</Text>
            </View>

            {/* Load ID row with navigation arrow */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={styles.loadIdRow}>
                <View style={styles.truckIconBox}>
                  <Text style={{ fontSize: 22 }}>🚛</Text>
                </View>
                <View>
                  <Text style={styles.loadIdText}>L-49208-TX</Text>
                  <Text style={styles.loadSubtext}>Reefer | 42,000 lbs</Text>
                </View>
              </View>
              <Text style={{ fontSize: 22, color: T.text.secondary, paddingRight: 4 }}>➔</Text>
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
              onPress={onNavigateToMarketplace}
              accessibilityRole="button"
              accessibilityLabel="View Route"
            >
              <Text style={styles.viewRouteBtnText}>🗺️  VIEW ROUTE</Text>
            </Pressable>
          </View>
        </StatusBorderCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => {
  const isLight = T.background.base === '#edeef3';
  const cardBg = isLight ? 'rgba(190, 195, 210, 0.55)' : 'rgba(13, 4, 4, 0.55)';

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: 'transparent' },
    container: { flex: 1, backgroundColor: 'transparent' },

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
      backgroundColor: cardBg,
    },
    greetingText: { ...TYPOGRAPHY.headlineLg, color: T.text.primary },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    locationIcon: { fontSize: 14 },
    locationText: { ...TYPOGRAPHY.labelData, color: T.text.secondary },
    fuelBadge: {
      alignSelf: 'flex-start',
      backgroundColor: T.primary + '8C',
      borderWidth: 1,
      borderColor: T.primary + '8C',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    fuelBadgeText: { ...TYPOGRAPHY.labelData, color: T.primary, letterSpacing: 1 },
    statCard: {
      flex: 1,
      padding: SPACING.stackMd,
      gap: 6,
      backgroundColor: cardBg,
    },
    milesCard: {
      width: '100%',
      padding: SPACING.stackMd,
      gap: 6,
      backgroundColor: cardBg,
    },
    statLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary },
    statNumber: { ...TYPOGRAPHY.displayMetricsMobile, fontSize: 28, fontWeight: '700' },
    statNumberBig: { ...TYPOGRAPHY.displayMetricsMobile, fontSize: 34, fontWeight: '800' },

    // Quick actions
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: SPACING.marginMobile,
      paddingTop: SPACING.stackMd,
      gap: SPACING.gutter,
    },
    quickActionTile: {
      borderWidth: 1,
      borderTopWidth: 1.5,
      borderBottomWidth: 4.5,
      borderColor: BRAND.crimsonRed + '55',
      borderTopColor: BRAND.crimsonRedLight + 'AA',
      borderBottomColor: BRAND.crimsonRed,
      borderRadius: 12,
      padding: SPACING.stackMd,
      alignItems: 'center',
      gap: 8,
      backgroundColor: isLight ? '#ffffff' : '#272323',
      
      // Embossed shadow
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
      elevation: 6,
    },
    quickActionIcon: {
      width: 44,
      height: 44,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionEmoji: { fontSize: 22 },
    quickActionLabel: { ...TYPOGRAPHY.labelData, color: T.text.primary, fontSize: 8.5, fontWeight: '700', textAlign: 'center' },

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
      backgroundColor: cardBg,
    },
    inTransitBadge: {
      position: 'absolute',
      top: SPACING.stackMd,
      right: SPACING.stackMd,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: T.primary + '8C',
      borderWidth: 1,
      borderColor: T.primary + '8C',
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
      backgroundColor: T.background.containerHighest + '8C',
      borderWidth: 1,
      borderColor: T.border.variant + '8C',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadIdText: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },
    loadSubtext: { ...TYPOGRAPHY.labelData, color: T.text.secondary, marginTop: 2 },

    // Route visualization
    routeVisualization: { flexDirection: 'row', gap: 10 },
    routeStop: { alignItems: 'center', paddingTop: 2 },
    routeStopDot: { fontSize: 18 },
    routeDash: { width: 1, flex: 1, borderStyle: 'dashed', borderWidth: 0.5, borderColor: T.border.variant + '8C', marginVertical: 4 },
    routeInfo: { flex: 1, gap: SPACING.stackLg },
    routeStopLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10 },
    routeCity: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },
    routeDate: { ...TYPOGRAPHY.bodyMd, color: T.text.secondary, fontSize: 12, marginTop: 2 },

    // Load metrics
    loadMetrics: {
      flexDirection: 'row',
      backgroundColor: T.background.dark + '8C',
      borderRadius: 4,
    },
    metricCol: { flex: 1, padding: SPACING.stackMd, alignItems: 'center' },
    metricBorderRight: { borderRightWidth: 1, borderRightColor: T.border.variant + '8C' },
    metricLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10 },
    metricValue: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, marginTop: 2 },

    routeInfoSeparator: {
      height: 1,
      backgroundColor: 'rgba(171, 137, 135, 0.55)',
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
      backgroundColor: BRAND.crimsonRed + '8C',
      borderWidth: 1,
      borderColor: BRAND.crimsonRedLight + '8C',
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
  });
});

// Skeuomorphic 3D Mechanical Button Component matching referenced image
function SkeuomorphicButton({ id, label, isDark, onPress }) {
  const baseColor = isDark ? '#8A121B' : '#E0E0E0';
  const highlightColor = isDark ? '#D92A36' : '#FFFFFF';
  const shadowColor = isDark ? '#54080D' : '#A0A0A0';
  const innerCircleBg = isDark ? '#0A0303' : '#F5F5F7';
  const innerCircleBorder = isDark ? '#4A0C10' : '#D0D0D5';
  const textColor = isDark ? '#FFFFFF' : '#333333';

  const renderIcon = () => {
    switch (id) {
      case 'calc': // Abacus
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
      default:
        return null;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        {
          width: '100%',
          aspectRatio: 1.0,
          borderRadius: 24,
          backgroundColor: baseColor,
          borderWidth: 2.5,
          borderColor: shadowColor,
          borderTopColor: highlightColor,
          borderLeftColor: highlightColor,
          padding: 5,
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: isDark ? 0.6 : 0.25,
          shadowRadius: 6,
          elevation: 8,
        },
        pressed && {
          transform: [{ translateY: 2 }],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
        }
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={{ fontSize: 7.2, fontWeight: '900', color: textColor, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center', width: '100%', paddingHorizontal: 2 }}>
        {label}
      </Text>
      <View style={{
        width: '74%',
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
        marginVertical: 1,
      }}>
        {renderIcon()}
      </View>
      <Text style={{ fontSize: 7.2, fontWeight: '900', color: textColor, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center', width: '100%', paddingHorizontal: 2 }}>
        {label}
      </Text>
    </Pressable>
  );
}
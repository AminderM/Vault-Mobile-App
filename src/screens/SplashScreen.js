import React from 'react';
import { View, StyleSheet, Text, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, TYPOGRAPHY, SPACING, createThemedStyleSheet } from '../lib/theme';

export default function SplashScreen({ onGetStarted }) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.safe}>
      {/* Decorative High-Performance Accent Light at the top */}
      <View style={styles.topAccent} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header / Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            alt="Integra Vault Emblem"
            style={styles.logo}
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHO7TcQSU_Ob3z0EiELw_n9eSB9PnbnzKcIFqplzG2Qm-17cQ9IKTfhPzUSaqn7kmiFlRbuH9VTZs9qurt-2iC1zNMJPP6V-wcvlpFv92QdwIYWtTht9A72-z_SOah4l2uj7U_l2uNBlV6LlDJ93bT7XFrwvQoFC0geSm8XZIbgrfAlzCjalqAPONJ44By4pJ8VG6x8sZ8CU8qck6PK0Uy2GYjZj7imiOWWtAzWBqX9SRU0YryAqzQtnGl-3jaKkQUv-K1XrL0-2Sq',
            }}
            resizeMode="contain"
          />
        </View>

        {/* Slogan Content Area */}
        <View style={styles.contentArea}>
          {/* Decorative Red Slash */}
          <View style={styles.redSlash} />

          <View style={styles.sloganContainer}>
            <Text style={styles.sloganTextWhite}>DRIVE.</Text>
            <Text style={styles.sloganTextRed}>GET PAID.</Text>
            <Text style={styles.sloganTextWhite}>REPEAT.</Text>
          </View>

          <View style={styles.subtextContainer}>
            <Text style={styles.subtextMuted}>
              TOOLS BUILT FOR DRIVERS,
            </Text>
            <Text style={styles.subtextWhite}>
              NOT SUITS
            </Text>
          </View>
        </View>

        {/* Action Footer */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={onGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.primaryBtnText}>GET STARTED  ➔</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={onGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.secondaryBtnText}>SIGN IN</Text>
          </Pressable>

          {/* Compliance Footer */}
          <View style={styles.complianceRow}>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>🛡️</Text>
              <Text style={styles.complianceText}>SECURE VAULT</Text>
            </View>
            <View style={styles.dot} />
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>⚡</Text>
              <Text style={styles.complianceText}>FAST PAY</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyleSheet((T) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.background.base,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: BRAND.crimsonRed,
    shadowColor: BRAND.crimsonRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.stackLg,
  },
  logoContainer: {
    width: '100%',
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logo: {
    width: '90%',
    height: '90%',
  },
  contentArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 30,
    paddingVertical: 20,
    overflow: 'hidden',
  },
  redSlash: {
    position: 'absolute',
    height: 4,
    width: '120%',
    backgroundColor: BRAND.crimsonRed,
    top: '42%',
    transform: [{ rotate: '-8deg' }],
    shadowColor: BRAND.crimsonRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  sloganContainer: {
    zIndex: 10,
    alignItems: 'center',
    gap: 4,
  },
  sloganTextWhite: {
    ...TYPOGRAPHY.displayMetricsMobile,
    color: T.text.primary,
    fontStyle: 'italic',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sloganTextRed: {
    ...TYPOGRAPHY.displayMetricsMobile,
    color: T.primary,
    fontStyle: 'italic',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  subtextContainer: {
    marginTop: SPACING.stackLg,
    alignItems: 'center',
  },
  subtextMuted: {
    ...TYPOGRAPHY.labelData,
    color: T.text.muted,
    letterSpacing: 2,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtextWhite: {
    ...TYPOGRAPHY.labelData,
    color: T.text.primary,
    letterSpacing: 2,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    width: '100%',
    gap: SPACING.stackMd,
    paddingBottom: 20,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: BRAND.crimsonRed,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryBtnText: {
    ...TYPOGRAPHY.headlineSm,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 2,
  },
  secondaryBtn: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: T.border.default,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...TYPOGRAPHY.headlineSm,
    color: T.text.primary,
    fontWeight: '600',
    letterSpacing: 2,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: SPACING.stackSm,
    opacity: 0.5,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  complianceIcon: {
    fontSize: 12,
  },
  complianceText: {
    ...TYPOGRAPHY.labelData,
    fontSize: 9,
    color: T.text.muted,
    letterSpacing: 1,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: T.border.variant,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
}));

import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Vault Mobile App</ThemedText>
      <ThemedText style={styles.subtitle}>Testing Phase 1 Features</ThemedText>

      <View style={styles.content}>
        <ThemedText>✅ App is loading on web!</ThemedText>
        <ThemedText style={styles.instruction}>
          Use Expo Go on your iPhone to test the full app with navigation
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 20,
  },
  content: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  instruction: {
    marginTop: 10,
    fontSize: 14,
  },
});

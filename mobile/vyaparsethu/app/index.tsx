import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS } from '../src/constants/theme';

// No shipped logo asset exists yet for the mobile app (the web app's
// public/vyapar-logo.jpeg referenced in earlier specs doesn't exist either —
// only public/apple-touch-icon.png does). Using a styled monogram placeholder
// instead of an <Image> that would silently fail to load.
export default function OnboardingScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </SafeAreaView>
    );
  }

  if (user) {
    // Redirect effect above will navigate away; render nothing in the meantime.
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>VS</Text>
        </View>
        <Text style={styles.title}>VyaparSethu</Text>
        <Text style={styles.tagline}>Commerce Connections Globally</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push({ pathname: '/auth/register', params: { role: 'buyer' } })}
        >
          <Text style={styles.primaryButtonText}>I'm a Buyer</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push({ pathname: '/auth/register', params: { role: 'supplier' } })}
        >
          <Text style={styles.secondaryButtonText}>I'm a Supplier</Text>
        </Pressable>
        <Pressable style={styles.skip} onPress={() => router.push('/auth/login')}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, justifyContent: 'space-between', padding: 24 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: { fontSize: 32, fontWeight: '700', color: COLORS.navy },
  title: { fontSize: 32, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  tagline: { fontSize: 16, color: COLORS.gold, textAlign: 'center' },
  actions: { gap: 12, paddingBottom: 24 },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButton: { backgroundColor: COLORS.gold },
  primaryButtonText: { color: COLORS.navy, fontSize: 16, fontWeight: '700' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.white },
  secondaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  skip: { alignItems: 'center', paddingVertical: 12 },
  skipText: { color: COLORS.teal, fontSize: 14, fontWeight: '600' },
});

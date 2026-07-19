import { useEffect } from 'react';
import { View, ActivityIndicator, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useViewMode } from '../../src/contexts/ViewModeContext';
import { COLORS } from '../../src/constants/theme';
import BuyerDashboard from '../dashboard/buyer';
import SupplierDashboard from '../dashboard/supplier';

export default function HomeTab() {
  const { user, loading } = useAuth();
  const { viewMode, setViewMode, ready } = useViewMode();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !ready || !user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.ivory }}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.toggleBar}>
        <Pressable
          style={[styles.toggleButton, viewMode === 'buyer' && styles.toggleButtonActive]}
          onPress={() => setViewMode('buyer')}
        >
          <Text style={[styles.toggleText, viewMode === 'buyer' && styles.toggleTextActive]}>Buyer View</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, viewMode === 'supplier' && styles.toggleButtonActive]}
          onPress={() => setViewMode('supplier')}
        >
          <Text style={[styles.toggleText, viewMode === 'supplier' && styles.toggleTextActive]}>Supplier View</Text>
        </Pressable>
      </View>
      {viewMode === 'supplier' ? <SupplierDashboard /> : <BuyerDashboard />}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: COLORS.navy },
  toggleText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  toggleTextActive: { color: COLORS.white },
});

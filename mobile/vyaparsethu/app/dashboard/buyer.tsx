import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/constants/theme';

interface DashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  totalQuotesReceived: number;
}

interface RfqSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  quotesCount: number;
}

export default function BuyerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rfqs, setRfqs] = useState<RfqSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [statsRes, rfqsRes] = await Promise.all([
        apiFetch<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats'),
        apiFetch<{ success: boolean; rfqs: RfqSummary[] }>('/api/dashboard/rfqs'),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (rfqsRes.success) setRfqs(rfqsRes.rfqs.slice(0, 5));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <Text style={styles.welcome}>Welcome back{user?.name ? `, ${user.name}` : ''}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.statsRow}>
          <StatCard label="Total RFQs" value={stats?.totalRFQs ?? '—'} />
          <StatCard label="Active RFQs" value={stats?.activeRFQs ?? '—'} />
          <StatCard label="Quotes Received" value={stats?.totalQuotesReceived ?? '—'} />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction icon="🎤" label="Voice RFQ" onPress={() => router.push('/rfq/voice')} />
          <QuickAction icon="📹" label="Video RFQ" onPress={() => router.push('/rfq/video')} />
          <QuickAction icon="📝" label="Text RFQ" onPress={() => router.push('/rfq/text')} />
        </View>

        <Text style={styles.sectionTitle}>Latest Requirements</Text>
        {rfqs.length === 0 ? (
          <Text style={styles.emptyText}>No requirements posted yet.</Text>
        ) : (
          rfqs.map((rfq) => (
            <Pressable key={rfq.id} style={styles.rfqCard} onPress={() => router.push(`/rfq/${rfq.id}`)}>
              <Text style={styles.rfqTitle}>{rfq.title}</Text>
              <View style={styles.rfqMetaRow}>
                <Text style={styles.rfqMeta}>{rfq.category}</Text>
                <Text style={styles.rfqStatus}>{rfq.status}</Text>
              </View>
              <Text style={styles.rfqQuotes}>
                {rfq.quotesCount} quote{rfq.quotesCount === 1 ? '' : 's'}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  loadingContainer: { flex: 1, backgroundColor: COLORS.ivory, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  welcome: { fontSize: 22, fontWeight: '700', color: COLORS.navy, marginBottom: 16 },
  error: { color: COLORS.danger, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  statLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 12, marginTop: 8 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickAction: { flex: 1, backgroundColor: COLORS.navy, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  quickActionIcon: { fontSize: 24, marginBottom: 6 },
  quickActionLabel: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  rfqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rfqTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 6 },
  rfqMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rfqMeta: { fontSize: 12, color: COLORS.textMuted },
  rfqStatus: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', color: COLORS.teal },
  rfqQuotes: { fontSize: 12, color: COLORS.teal, fontWeight: '600' },
});

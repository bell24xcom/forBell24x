import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/constants/theme';

interface DashboardStats {
  totalEarned: number;
}

interface MarketplaceRfq {
  id: string;
  title: string;
  category: string;
  budget: number;
  location: string | null;
  quotesCount: number;
}

export default function SupplierDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [openQuotesCount, setOpenQuotesCount] = useState<number | null>(null);
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [rfqs, setRfqs] = useState<MarketplaceRfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [statsRes, marketplaceRes, quotesRes] = await Promise.all([
        apiFetch<{ success: boolean; stats: DashboardStats }>('/api/dashboard/stats'),
        apiFetch<{ success: boolean; rfqs: MarketplaceRfq[]; pagination: { total: number } }>(
          '/api/marketplace/rfqs?limit=5',
        ),
        apiFetch<{ success: boolean; quotes: Array<{ status: string }> }>('/api/supplier/quotes'),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (marketplaceRes.success) {
        setRfqs(marketplaceRes.rfqs);
        setAvailableCount(marketplaceRes.pagination.total);
      }
      if (quotesRes.success) {
        setOpenQuotesCount(quotesRes.quotes.filter((q) => q.status === 'PENDING').length);
      }
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

        <View style={styles.gaugeCard}>
          <Text style={styles.gaugeLabel}>Trust Score</Text>
          <Text style={styles.gaugeNotAvailable}>Not yet available on mobile</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="New RFQs Available" value={availableCount ?? '—'} />
          <StatCard label="Open Quotes" value={openQuotesCount ?? '—'} />
          <StatCard label="Revenue" value={stats ? `₹${stats.totalEarned.toLocaleString('en-IN')}` : '—'} />
        </View>

        <Pressable style={styles.browseButton} onPress={() => router.push('/rfq/browse')}>
          <Text style={styles.browseButtonText}>Browse New RFQs</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Latest Requirements to Quote On</Text>
        {rfqs.length === 0 ? (
          <Text style={styles.emptyText}>No open requirements right now.</Text>
        ) : (
          rfqs.map((rfq) => (
            <Pressable key={rfq.id} style={styles.rfqCard} onPress={() => router.push(`/rfq/${rfq.id}`)}>
              <Text style={styles.rfqTitle}>{rfq.title}</Text>
              <View style={styles.rfqMetaRow}>
                <Text style={styles.rfqMeta}>{rfq.category}</Text>
                <Text style={styles.rfqMeta}>{rfq.location || 'Location flexible'}</Text>
              </View>
              <Text style={styles.rfqBudget}>{rfq.budget ? `₹${rfq.budget.toLocaleString('en-IN')}` : 'Negotiable'}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  loadingContainer: { flex: 1, backgroundColor: COLORS.ivory, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  welcome: { fontSize: 22, fontWeight: '700', color: COLORS.navy, marginBottom: 16 },
  error: { color: COLORS.danger, marginBottom: 12 },
  gaugeCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  gaugeLabel: { color: COLORS.gold, fontSize: 13, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  gaugeNotAvailable: { color: COLORS.white, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  statLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
  browseButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  browseButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
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
  rfqBudget: { fontSize: 13, color: COLORS.teal, fontWeight: '700' },
});

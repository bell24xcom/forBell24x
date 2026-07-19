import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { COLORS } from '../../src/constants/theme';

interface MarketplaceRfq {
  id: string;
  title: string;
  category: string;
  location: string | null;
  budget: number;
  quotesCount: number;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function BrowseRfqsScreen() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<MarketplaceRfq[]>([]);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (location) params.set('location', location);
      const res = await apiFetch<{ success: boolean; rfqs: MarketplaceRfq[] }>(
        `/api/marketplace/rfqs?${params.toString()}`,
      );
      if (res.success) setRfqs(res.rfqs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  }, [category, location]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.filterInput}
          placeholder="Category"
          placeholderTextColor={COLORS.textMuted}
          value={category}
          onChangeText={setCategory}
          onSubmitEditing={load}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Location"
          placeholderTextColor={COLORS.textMuted}
          value={location}
          onChangeText={setLocation}
          onSubmitEditing={load}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.navy} />
      ) : (
        <FlatList
          data={rfqs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.emptyText}>No open requirements match these filters.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/rfq/${item.id}`)}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{item.category}</Text>
                <Text style={styles.meta}>{item.location || 'Location flexible'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.budget}>{item.budget ? `₹${item.budget.toLocaleString('en-IN')}` : 'Negotiable'}</Text>
                <Text style={styles.timeAgo}>{timeAgo(item.createdAt)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  filters: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    fontSize: 14,
    color: COLORS.textDark,
  },
  error: { color: COLORS.danger, paddingHorizontal: 16, marginBottom: 8 },
  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingTop: 8 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  meta: { fontSize: 12, color: COLORS.textMuted },
  budget: { fontSize: 13, color: COLORS.teal, fontWeight: '700' },
  timeAgo: { fontSize: 12, color: COLORS.textMuted },
});

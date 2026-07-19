import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { COLORS } from '../../src/constants/theme';

interface ReceivedQuote {
  id: string;
  rfqTitle: string;
  supplierName: string;
  supplierCompany: string | null;
  price: number;
  status: string;
  createdAt: string;
}

interface SubmittedQuote {
  id: string;
  price: number;
  status: string;
  createdAt: string;
  rfq: { title: string; category: string } | null;
}

type Mode = 'received' | 'submitted';

export default function QuotesTab() {
  const [mode, setMode] = useState<Mode>('received');
  const [received, setReceived] = useState<ReceivedQuote[]>([]);
  const [submitted, setSubmitted] = useState<SubmittedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'received') {
        const res = await apiFetch<{ success: boolean; quotes: ReceivedQuote[] }>('/api/dashboard/quotes');
        if (res.success) setReceived(res.quotes);
      } else {
        const res = await apiFetch<{ success: boolean; quotes: SubmittedQuote[] }>('/api/supplier/quotes');
        if (res.success) setSubmitted(res.quotes);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Quotes</Text>

      <View style={styles.toggleBar}>
        <Pressable
          style={[styles.toggleButton, mode === 'received' && styles.toggleButtonActive]}
          onPress={() => setMode('received')}
        >
          <Text style={[styles.toggleText, mode === 'received' && styles.toggleTextActive]}>Received</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, mode === 'submitted' && styles.toggleButtonActive]}
          onPress={() => setMode('submitted')}
        >
          <Text style={[styles.toggleText, mode === 'submitted' && styles.toggleTextActive]}>Submitted</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={COLORS.navy} />
      ) : mode === 'received' ? (
        <FlatList
          data={received}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.emptyText}>No quotes received yet on your requirements.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.rfqTitle}</Text>
              <Text style={styles.meta}>{item.supplierCompany || item.supplierName}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={submitted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={load}
          refreshing={loading}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't submitted any quotes yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.rfq?.title || 'Requirement'}</Text>
              <Text style={styles.meta}>{item.rfq?.category}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  header: { fontSize: 20, fontWeight: '700', color: COLORS.navy, padding: 16, paddingBottom: 8 },
  toggleBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  toggleButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  toggleButtonActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  toggleText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  toggleTextActive: { color: COLORS.white },
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
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 4 },
  meta: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.teal },
  status: { fontSize: 12, fontWeight: '700', color: COLORS.navy, textTransform: 'uppercase' },
});

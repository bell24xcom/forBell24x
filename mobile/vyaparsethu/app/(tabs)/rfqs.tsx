import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { useViewMode } from '../../src/contexts/ViewModeContext';
import { COLORS } from '../../src/constants/theme';
import BrowseRfqsScreen from '../rfq/browse';

interface MyRfq {
  id: string;
  title: string;
  category: string;
  status: string;
  quotesCount: number;
}

function MyRfqsList() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<MyRfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; rfqs: MyRfq[] }>('/api/dashboard/rfqs');
      if (res.success) setRfqs(res.rfqs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Requirements</Text>
        <View style={styles.postButtons}>
          <Pressable style={styles.postButton} onPress={() => router.push('/rfq/voice')}>
            <Text style={styles.postButtonText}>🎤 Voice</Text>
          </Pressable>
          <Pressable style={styles.postButton} onPress={() => router.push('/rfq/video')}>
            <Text style={styles.postButtonText}>📹 Video</Text>
          </Pressable>
          <Pressable style={styles.postButton} onPress={() => router.push('/rfq/text')}>
            <Text style={styles.postButtonText}>📝 Text</Text>
          </Pressable>
        </View>
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
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't posted any requirements yet.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/rfq/${item.id}`)}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{item.category}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Text style={styles.quotesCount}>
                {item.quotesCount} quote{item.quotesCount === 1 ? '' : 's'}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

export default function RfqsTab() {
  const { viewMode } = useViewMode();
  return viewMode === 'supplier' ? <BrowseRfqsScreen /> : <MyRfqsList />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginBottom: 10 },
  postButtons: { flexDirection: 'row', gap: 8 },
  postButton: { flex: 1, backgroundColor: COLORS.navy, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  postButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
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
  status: { fontSize: 12, fontWeight: '700', color: COLORS.teal, textTransform: 'uppercase' },
  quotesCount: { fontSize: 12, color: COLORS.teal, fontWeight: '600' },
});

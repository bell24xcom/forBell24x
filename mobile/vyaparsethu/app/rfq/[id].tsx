import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { COLORS } from '../../src/constants/theme';

interface RfqDetail {
  id: string;
  title: string;
  category: string;
  description: string | null;
  quantity: string;
  unit: string;
  maxBudget: number | null;
  timeline: string | null;
  urgency: string;
  location: string | null;
  createdAt: string;
  status: string;
  user: { name: string; company: string; location: string | null } | null;
}

export default function RfqDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [price, setPrice] = useState('');
  const [quoteQuantity, setQuoteQuantity] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; rfq: RfqDetail; error?: string }>(`/api/rfq/${id}`, {
        auth: false,
      });
      if (!res.success) throw new Error(res.error || 'Requirement not found');
      setRfq(res.rfq);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load requirement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmitQuote = async () => {
    setQuoteError(null);
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) {
      setQuoteError('Enter a valid price');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ success: boolean; error?: string }>('/api/rfq/quotes', {
        method: 'POST',
        body: {
          rfqId: id,
          price: priceNum,
          quantity: quoteQuantity || undefined,
          deliveryDays: deliveryDays ? parseInt(deliveryDays, 10) : undefined,
          notes: notes || undefined,
        },
      });
      if (!res.success) throw new Error((res as { error?: string }).error || 'Failed to submit quote');
      Alert.alert('Quote submitted', 'The buyer will be notified of your quote.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      setQuoteError(e instanceof Error ? e.message : 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </SafeAreaView>
    );
  }

  if (error || !rfq) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error || 'Requirement not found'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{rfq.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{rfq.category}</Text>
          <Text style={styles.metaStatus}>{rfq.status}</Text>
        </View>

        {rfq.description && <Text style={styles.description}>{rfq.description}</Text>}

        <View style={styles.detailsCard}>
          <DetailRow label="Quantity" value={`${rfq.quantity} ${rfq.unit}`} />
          <DetailRow label="Budget" value={rfq.maxBudget ? `₹${rfq.maxBudget.toLocaleString('en-IN')}` : 'Negotiable'} />
          <DetailRow label="Location" value={rfq.location || 'Flexible'} />
          <DetailRow label="Timeline" value={rfq.timeline || rfq.urgency} />
          {rfq.user && <DetailRow label="Posted by" value={rfq.user.company || rfq.user.name} />}
        </View>

        {!showQuoteForm ? (
          <Pressable style={styles.quoteButton} onPress={() => setShowQuoteForm(true)}>
            <Text style={styles.quoteButtonText}>Submit Quote</Text>
          </Pressable>
        ) : (
          <View style={styles.quoteForm}>
            <Text style={styles.quoteFormTitle}>Your Quote</Text>
            <Field label="Price (₹)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 65000" />
            <Field label="Quantity you can supply" value={quoteQuantity} onChangeText={setQuoteQuantity} placeholder={`${rfq.quantity} ${rfq.unit}`} />
            <Field label="Delivery (days)" value={deliveryDays} onChangeText={setDeliveryDays} keyboardType="numeric" placeholder="e.g. 7" />
            <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Terms, specs, etc." />

            {quoteError && <Text style={styles.error}>{quoteError}</Text>}

            <Pressable style={styles.quoteButton} onPress={handleSubmitQuote} disabled={submitting}>
              {submitting ? <ActivityIndicator color={COLORS.navy} /> : <Text style={styles.quoteButtonText}>Submit Quote</Text>}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'numeric' | 'default';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.ivory },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  meta: { fontSize: 13, color: COLORS.textMuted },
  metaStatus: { fontSize: 13, fontWeight: '700', color: COLORS.teal, textTransform: 'uppercase' },
  description: { fontSize: 14, color: COLORS.textDark, marginBottom: 20, lineHeight: 20 },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  detailLabel: { fontSize: 13, color: COLORS.textMuted },
  detailValue: { fontSize: 13, color: COLORS.textDark, fontWeight: '600' },
  quoteButton: { backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  quoteButtonText: { color: COLORS.navy, fontSize: 16, fontWeight: '700' },
  quoteForm: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  quoteFormTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 14 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.navy, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textDark,
  },
  error: { color: COLORS.danger, marginBottom: 12 },
});

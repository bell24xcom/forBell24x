import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { COLORS } from '../../src/constants/theme';

const URGENCY_OPTIONS = [
  { value: 'LOW', label: 'Flexible' },
  { value: 'NORMAL', label: 'Within a month' },
  { value: 'HIGH', label: 'Within 2 weeks' },
  { value: 'URGENT', label: 'Urgent' },
] as const;

// The category dropdown mirrors the list the transcribe/extraction pipeline
// uses server-side (src/app/api/voice-rfq/transcribe/route.ts), so text and
// voice requirements land in the same category taxonomy.
const CATEGORIES = [
  'Apparel & Clothing',
  'Textiles & Garments',
  'Metals & Alloys',
  'Electronics & Electricals',
  'Machinery & Equipment',
  'Chemicals & Petrochemicals',
  'Construction & Real Estate',
  'Food & Beverages',
  'Pharmaceuticals & Healthcare',
  'Automotive & Transport',
  'Plastics & Rubber',
  'Paper & Printing',
  'Agriculture & Farming',
  'IT & Telecom',
  'Furniture & Wood',
  'Safety & Security',
  'Other',
];

export default function TextRfqScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('units');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<(typeof URGENCY_OPTIONS)[number]['value']>('NORMAL');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    if (!quantity.trim()) {
      setError('Please enter a quantity');
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; error?: string }>('/api/rfq/create', {
        method: 'POST',
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          quantity: quantity.trim(),
          unit: unit.trim() || 'units',
          minBudget: minBudget ? parseFloat(minBudget) : undefined,
          maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
          location: location.trim() || undefined,
          urgency,
        },
      });
      if (!res.success) throw new Error(res.error || 'Failed to post requirement');
      Alert.alert('Posted', 'Your Text Requirement has been posted.', [
        { text: 'OK', onPress: () => router.replace('/dashboard/buyer') },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post requirement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Text Requirement</Text>

        <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Cotton T-Shirts – 500 units" />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <Pressable style={styles.dropdown} onPress={() => setShowCategoryPicker((v) => !v)}>
            <Text style={category ? styles.dropdownValue : styles.dropdownPlaceholder}>
              {category || 'Select a category'}
            </Text>
          </Pressable>
          {showCategoryPicker && (
            <View style={styles.dropdownList}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(c);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex2]}>
            <Text style={styles.fieldLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="500"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.fieldLabel}>Unit</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="units"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.fieldLabel}>Min Budget (₹)</Text>
            <TextInput
              style={styles.input}
              value={minBudget}
              onChangeText={setMinBudget}
              placeholder="Optional"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.fieldLabel}>Max Budget (₹)</Text>
            <TextInput
              style={styles.input}
              value={maxBudget}
              onChangeText={setMaxBudget}
              placeholder="Optional"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Bhiwandi, Maharashtra" />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Specifications, quality requirements, delivery terms…"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Timeline</Text>
          <View style={styles.urgencyRow}>
            {URGENCY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.urgencyChip, urgency === opt.value && styles.urgencyChipActive]}
                onPress={() => setUrgency(opt.value)}
              >
                <Text style={[styles.urgencyChipText, urgency === opt.value && styles.urgencyChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.navy} /> : <Text style={styles.submitButtonText}>Post RFQ</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginBottom: 20 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.navy, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  dropdownValue: { fontSize: 15, color: COLORS.textDark },
  dropdownPlaceholder: { fontSize: 15, color: COLORS.textMuted },
  dropdownList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginTop: 6,
    backgroundColor: COLORS.white,
    maxHeight: 220,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText: { fontSize: 14, color: COLORS.textDark },
  urgencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  urgencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  urgencyChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  urgencyChipText: { fontSize: 13, color: COLORS.textDark },
  urgencyChipTextActive: { color: COLORS.white, fontWeight: '600' },
  error: { color: COLORS.danger, marginBottom: 12 },
  submitButton: { backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: COLORS.navy, fontSize: 16, fontWeight: '700' },
});

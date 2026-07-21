import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { apiFetch, apiUpload } from '../../src/lib/api';
import { COLORS } from '../../src/constants/theme';

interface ExtractedData {
  product: string | null;
  quantity: number | null;
  unit: string | null;
  location: string | null;
  urgency: string;
  category: string | null;
  specifications: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
}

type Stage = 'idle' | 'recording' | 'transcribing' | 'review';

export default function VoiceRfqScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [stage, setStage] = useState<Stage>('idle');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable fields, seeded from the extracted data but user-correctable
  // before saving — Whisper/LLM extraction is best-effort, not authoritative.
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      setPermissionDenied(!granted);
      if (granted) {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      }
    })();
  }, []);

  const startRecording = async () => {
    setError(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStage('recording');
  };

  const stopRecording = async () => {
    await recorder.stop();
    setStage('transcribing');

    try {
      const uri = recorder.uri;
      if (!uri) throw new Error('No recording captured');

      const formData = new FormData();
      // Global fetch is Expo's WinterCG fetch, not React Native's classic
      // fetch — its FormData serializer only accepts strings, real Blobs, or
      // objects exposing `.bytes()`. The old { uri, name, type } RN pseudo-blob
      // shape satisfies none of those and throws "Unsupported FormDataPart
      // implementation". expo-file-system's File class implements `.bytes()`.
      formData.append('audio', new File(uri));

      const res = await apiUpload<{
        success: boolean;
        transcription: string;
        extractedData: ExtractedData;
        error?: string;
      }>('/api/voice-rfq/transcribe', formData);

      if (!res.success) throw new Error(res.error || 'Transcription failed');

      setTranscript(res.transcription);
      setExtracted(res.extractedData);
      setTitle(res.extractedData.product || '');
      setCategory(res.extractedData.category || '');
      setQuantity(
        res.extractedData.quantity
          ? `${res.extractedData.quantity} ${res.extractedData.unit || 'units'}`
          : '',
      );
      setLocation(res.extractedData.location || '');
      setBudget(
        res.extractedData.budgetMin && res.extractedData.budgetMax
          ? `₹${res.extractedData.budgetMin} - ₹${res.extractedData.budgetMax}`
          : res.extractedData.budgetMin
          ? `₹${res.extractedData.budgetMin}+`
          : '',
      );
      setStage('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process recording');
      setStage('idle');
    }
  };

  const handleDiscard = () => {
    Alert.alert('Discard requirement?', 'This recording and its extracted details will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setStage('idle');
          setTranscript('');
          setExtracted(null);
          setTitle('');
          setCategory('');
          setQuantity('');
          setLocation('');
          setBudget('');
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title before saving');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; error?: string }>('/api/voice-rfq/save', {
        method: 'POST',
        body: {
          title: title.trim(),
          description: transcript,
          category: category || 'Other',
          quantity: quantity || '1 units',
          location: location || null,
          budget,
          timeline: extracted?.urgency || 'flexible',
        },
      });
      if (!res.success) throw new Error(res.error || 'Failed to save requirement');
      Alert.alert('Saved', 'Your Voice Requirement has been posted.', [
        { text: 'OK', onPress: () => router.replace('/dashboard/buyer') },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save requirement');
    } finally {
      setSaving(false);
    }
  };

  if (permissionDenied) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permissionText}>
          Microphone access is required to record a Voice Requirement. Please enable it in your device settings.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Speak Requirement</Text>

        {stage !== 'review' && (
          <View style={styles.recorderArea}>
            <Pressable
              style={[styles.micButton, recorderState.isRecording && styles.micButtonRecording]}
              onPress={stage === 'recording' ? stopRecording : startRecording}
              disabled={stage === 'transcribing'}
            >
              {stage === 'transcribing' ? (
                <ActivityIndicator color={COLORS.white} size="large" />
              ) : (
                <Text style={styles.micIcon}>🎤</Text>
              )}
            </Pressable>
            <Text style={styles.hint}>
              {stage === 'idle' && 'Tap to start speaking your requirement'}
              {stage === 'recording' &&
                `Recording… ${Math.round(recorderState.durationMillis / 1000)}s — tap to stop`}
              {stage === 'transcribing' && 'Transcribing your recording…'}
            </Text>
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {stage === 'review' && (
          <View style={styles.reviewCard}>
            <Text style={styles.transcriptLabel}>What we heard</Text>
            <Text style={styles.transcript}>{transcript}</Text>

            <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Cotton T-Shirts" />
            <Field label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Apparel & Clothing" />
            <Field label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="e.g. 500 units" />
            <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Bhiwandi" />
            <Field label="Budget" value={budget} onChangeText={setBudget} placeholder="e.g. ₹50,000 - ₹75,000" />

            <View style={styles.reviewActions}>
              <Pressable style={styles.discardButton} onPress={handleDiscard}>
                <Text style={styles.discardButtonText}>Discard</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={COLORS.navy} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Requirement</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
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
        style={styles.fieldInput}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.ivory },
  permissionText: { textAlign: 'center', color: COLORS.textDark, fontSize: 15 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginBottom: 24 },
  recorderArea: { alignItems: 'center', paddingVertical: 40 },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  micButtonRecording: { backgroundColor: COLORS.danger },
  micIcon: { fontSize: 48 },
  hint: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  error: { color: COLORS.danger, marginBottom: 12, textAlign: 'center' },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  transcriptLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 6 },
  transcript: { fontSize: 14, color: COLORS.textDark, marginBottom: 20, fontStyle: 'italic' },
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
  reviewActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  discardButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  discardButtonText: { color: COLORS.danger, fontWeight: '700' },
  saveButton: { flex: 2, backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { color: COLORS.navy, fontWeight: '700' },
});

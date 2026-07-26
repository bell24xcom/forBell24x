import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import { File, UploadType } from 'expo-file-system';
import { apiFetch } from '../../src/lib/api';
import { COLORS } from '../../src/constants/theme';

const MAX_DURATION_SECONDS = 60;

// Mirrors the taxonomy used server-side in the extraction prompt
// (src/app/api/video-rfq/route.ts) so recorded and manually-picked
// categories land in the same set.
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

type Stage = 'camera' | 'recorded' | 'processing' | 'review';

interface ExtractedInfo {
  title: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  budget: number;
  location: string;
}

export default function VideoRfqScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [stage, setStage] = useState<Stage>('camera');
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string | null>(null);

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
  });

  // Editable fields, seeded from AI extraction but user-correctable before
  // saving — extraction is best-effort, not authoritative.
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('units');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!micPermission?.granted) requestMicPermission();
  }, []);

  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev + 1 >= MAX_DURATION_SECONDS) {
          stopRecording();
          return MAX_DURATION_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [recording]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setError(null);
    setSeconds(0);
    setRecording(true);
    try {
      const result = await cameraRef.current.recordAsync({ maxDuration: MAX_DURATION_SECONDS });
      if (result?.uri) {
        setVideoUri(result.uri);
        setStage('recorded');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recording failed');
    } finally {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  const resetToCamera = () => {
    setStage('camera');
    setVideoUri(null);
    setSeconds(0);
    setError(null);
  };

  const processVideo = async () => {
    if (!videoUri) return;
    setStage('processing');
    setError(null);
    setUploadPercent(0);
    try {
      // Direct-to-Cloudinary upload: the recorded video never passes through
      // our own API — that was the root cause of both the 413 (Vercel's
      // 4.5MB request-body cap) and the OutOfMemoryError (loading the whole
      // file into JS memory to send it). expo-file-system's File.upload()
      // is a native, streamed multipart upload from the file URI, so the
      // bytes never enter JS memory either.
      const sig = await apiFetch<{
        success: boolean;
        signature: string;
        timestamp: number;
        apiKey: string;
        uploadPreset: string;
        folder: string;
        uploadUrl: string;
        error?: string;
      }>('/api/cloudinary/upload-signature', { method: 'POST', body: {} });

      if (!sig.success) throw new Error(sig.error || 'Could not prepare upload');

      const file = new File(videoUri);
      const uploadResult = await file.upload(sig.uploadUrl, {
        uploadType: UploadType.MULTIPART,
        fieldName: 'file',
        // Must match exactly what the server signed — no more, no fewer
        // fields, or Cloudinary rejects with "Invalid Signature".
        parameters: {
          api_key: sig.apiKey,
          timestamp: String(sig.timestamp),
          signature: sig.signature,
          upload_preset: sig.uploadPreset,
          folder: sig.folder,
        },
        onProgress: (data) => {
          if (data.totalBytes > 0) {
            setUploadPercent(Math.round((data.bytesSent / data.totalBytes) * 100));
          }
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(`Video upload failed (${uploadResult.status})`);
      }
      const cloudinaryResult = JSON.parse(uploadResult.body);
      const videoUrl: string = cloudinaryResult.secure_url;
      const publicId: string | undefined = cloudinaryResult.public_id;
      if (!videoUrl) throw new Error('Upload succeeded but no video URL was returned');
      // Carried into handleSave()'s /api/rfq/create call below — without this,
      // the uploaded video is transcribed but never attached to the saved RFQ.
      setCloudinaryUrl(videoUrl);
      // Cloudinary's transform/delete/watermark/analytics APIs key on this,
      // not the URL — same upload response, so free to capture alongside it.
      if (publicId) setCloudinaryPublicId(publicId);

      // Extraction only — the mobile flow lets the user correct fields
      // before saving, so it opts out of the route's default auto-save
      // and finalizes via /api/rfq/create once fields are confirmed.
      const res = await apiFetch<{
        success: boolean;
        transcription: string;
        extractedInfo: ExtractedInfo;
        error?: string;
      }>('/api/video-rfq', { method: 'POST', body: { videoUrl, save: false } });

      if (!res.success) throw new Error(res.error || 'Video processing failed');

      setTitle(res.extractedInfo.title || '');
      setCategory(res.extractedInfo.category || '');
      setQuantity(res.extractedInfo.quantity ? String(res.extractedInfo.quantity) : '');
      setUnit(res.extractedInfo.unit || 'units');
      setLocation(res.extractedInfo.location !== 'Not specified' ? res.extractedInfo.location : '');
      setBudget(res.extractedInfo.budget ? String(res.extractedInfo.budget) : '');
      setStage('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI analysis failed. You can still fill in the details manually.');
      setStage('review');
    }
  };

  const handleSave = async () => {
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
          category,
          quantity: quantity.trim(),
          unit: unit.trim() || 'units',
          maxBudget: budget ? parseFloat(budget) : undefined,
          location: location.trim() || undefined,
          urgency: 'NORMAL',
          videoUrl: cloudinaryUrl || undefined,
          videoPublicId: cloudinaryPublicId || undefined,
        },
      });
      if (!res.success) throw new Error(res.error || 'Failed to save requirement');
      Alert.alert('Saved', 'Your Video Requirement has been posted.', [
        { text: 'OK', onPress: () => router.replace('/dashboard/buyer') },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save requirement');
    } finally {
      setSaving(false);
    }
  };

  if (!cameraPermission || !micPermission) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={COLORS.navy} />
      </SafeAreaView>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permissionText}>
          Camera and microphone access are required to record a Video Requirement. Please enable them in your device
          settings.
        </Text>
      </SafeAreaView>
    );
  }

  if (stage === 'camera' || stage === 'recorded') {
    return (
      <View style={styles.fullScreen}>
        {stage === 'camera' ? (
          <CameraView ref={cameraRef} style={styles.fullScreen} mode="video" facing={facing} />
        ) : (
          <VideoView
            style={styles.fullScreen}
            player={player}
            nativeControls
            contentFit="contain"
          />
        )}

        {stage === 'camera' && recording && (
          <View style={styles.timerBadge}>
            <View style={styles.recDot} />
            <Text style={styles.timerText}>REC {formatTime(seconds)}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {stage === 'camera' && !recording && (
          <SafeAreaView style={styles.flipButtonContainer} edges={['top']}>
            <Pressable
              style={styles.flipButton}
              onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
            >
              <Text style={styles.flipButtonIcon}>🔄</Text>
            </Pressable>
          </SafeAreaView>
        )}

        <SafeAreaView style={styles.controlsOverlay} edges={['bottom']}>
          {stage === 'camera' ? (
            <Pressable
              style={[styles.recordButton, recording && styles.recordButtonActive]}
              onPress={recording ? stopRecording : startRecording}
            >
              <View style={recording ? styles.recordSquare : styles.recordCircle} />
            </Pressable>
          ) : (
            <View style={styles.recordedActions}>
              <Pressable style={styles.secondaryButton} onPress={resetToCamera}>
                <Text style={styles.secondaryButtonText}>Record Again</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={processVideo}>
                <Text style={styles.primaryButtonText}>Process Video Requirement</Text>
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }

  if (stage === 'processing') {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.navy} />
        <Text style={styles.processingText}>
          {uploadPercent > 0 && uploadPercent < 100 ? `Uploading video… ${uploadPercent}%` : 'AI is analysing your video…'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Video Requirement</Text>

        {error && <Text style={styles.error}>{error}</Text>}

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

        <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Bhiwandi, Maharashtra" />
        <Field label="Budget (₹)" value={budget} onChangeText={setBudget} placeholder="Optional" />

        <View style={styles.reviewActions}>
          <Pressable style={styles.discardButton} onPress={resetToCamera} disabled={saving}>
            <Text style={styles.discardButtonText}>Record Again</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.navy} /> : <Text style={styles.saveButtonText}>Save Requirement</Text>}
          </Pressable>
        </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.ivory },
  permissionText: { textAlign: 'center', color: COLORS.textDark, fontSize: 15 },
  processingText: { marginTop: 16, color: COLORS.textDark, fontSize: 15 },
  fullScreen: { flex: 1, backgroundColor: '#000' },
  timerBadge: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
  timerText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  errorBanner: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.75)', padding: 10, borderRadius: 10 },
  errorBannerText: { color: COLORS.white, fontSize: 13, textAlign: 'center' },
  flipButtonContainer: { position: 'absolute', top: 0, right: 0 },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginRight: 20,
  },
  flipButtonIcon: { fontSize: 20 },
  controlsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 24, alignItems: 'center' },
  recordButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: { borderColor: COLORS.danger },
  recordCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.danger },
  recordSquare: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.danger },
  recordedActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, width: '100%' },
  secondaryButton: { flex: 1, borderWidth: 1.5, borderColor: COLORS.white, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: COLORS.white, fontWeight: '700' },
  primaryButton: { flex: 1.4, backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: COLORS.navy, fontWeight: '700' },
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
  error: { color: COLORS.danger, marginBottom: 12 },
  reviewActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  discardButton: { flex: 1, borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  discardButtonText: { color: COLORS.danger, fontWeight: '700' },
  saveButton: { flex: 2, backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { color: COLORS.navy, fontWeight: '700' },
});

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useViewMode } from '../../src/contexts/ViewModeContext';
import { COLORS } from '../../src/constants/theme';

// Registration and login are the same OTP flow on the backend — POST
// /api/auth/otp/verify creates the account on first verify (mirrors the web
// app's /register -> /login redirect). The `role` param only decides which
// dashboard to land on after verifying; it isn't sent to the server, since
// every VyaparSethu account is simultaneously buyer + supplier by design.
export default function LoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { sendOtp, verifyOtp } = useAuth();
  const { setViewMode } = useViewMode();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(digits)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(digits);
      if (res.success) {
        setStage('otp');
        setDevOtp(res.devOtp ?? null);
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, '').slice(-10);
      const res = await verifyOtp(digits, otp);
      if (res.success) {
        setViewMode(role === 'supplier' ? 'supplier' : 'buyer');
        router.replace('/(tabs)');
      } else {
        setError(res.message || 'Invalid OTP');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{stage === 'phone' ? 'Enter your phone number' : 'Enter OTP'}</Text>
        <Text style={styles.subtitle}>
          {stage === 'phone'
            ? "We'll send a 6-digit code to verify your number"
            : `Sent to +91 ${phone.replace(/\D/g, '').slice(-10)}`}
        </Text>

        {stage === 'phone' ? (
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="98765 43210"
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        ) : (
          <TextInput
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="••••••"
            placeholderTextColor={COLORS.textMuted}
            value={otp}
            onChangeText={setOtp}
          />
        )}

        {devOtp && stage === 'otp' && <Text style={styles.devHint}>Pilot mode — OTP: {devOtp}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={styles.button}
          disabled={loading}
          onPress={stage === 'phone' ? handleSendOtp : handleVerifyOtp}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.navy} />
          ) : (
            <Text style={styles.buttonText}>{stage === 'phone' ? 'Send OTP' : 'Verify & Continue'}</Text>
          )}
        </Pressable>

        {stage === 'otp' && (
          <Pressable onPress={() => setStage('phone')} style={styles.changeNumber}>
            <Text style={styles.changeNumberText}>Change phone number</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  prefix: { paddingHorizontal: 16, fontSize: 16, color: COLORS.textDark, fontWeight: '600' },
  input: { flex: 1, paddingVertical: 14, paddingRight: 16, fontSize: 16, color: COLORS.textDark },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: 14,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.textDark,
  },
  devHint: { color: COLORS.teal, fontSize: 13, marginBottom: 12 },
  error: { color: COLORS.danger, fontSize: 13, marginBottom: 12 },
  button: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: COLORS.navy, fontSize: 16, fontWeight: '700' },
  changeNumber: { alignItems: 'center', marginTop: 16 },
  changeNumberText: { color: COLORS.teal, fontSize: 14, fontWeight: '600' },
});

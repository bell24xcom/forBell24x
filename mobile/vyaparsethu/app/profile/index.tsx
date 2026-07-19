import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../../src/lib/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/constants/theme';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  gstNumber: string | null;
  location: string | null;
  role: string;
  isVerified: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [location, setLocation] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; user: ProfileData }>('/api/profile');
      if (res.success) {
        setProfile(res.user);
        setName(res.user.name || '');
        setCompany(res.user.company || '');
        setGstNumber(res.user.gstNumber || '');
        setLocation(res.user.location || '');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; user: ProfileData; error?: string }>('/api/profile', {
        method: 'PUT',
        body: { name, company, gstNumber, location },
      });
      if (!res.success) throw new Error(res.error || 'Failed to update profile');
      setProfile(res.user);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Profile</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.card}>
          {editing ? (
            <>
              <Field label="Name" value={name} onChangeText={setName} />
              <Field label="Company" value={company} onChangeText={setCompany} />
              <Field label="GST Number" value={gstNumber} onChangeText={setGstNumber} />
              <Field label="Location" value={location} onChangeText={setLocation} />
              <View style={styles.editActions}>
                <Pressable style={styles.cancelButton} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color={COLORS.navy} /> : <Text style={styles.saveButtonText}>Save</Text>}
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <InfoRow label="Name" value={profile?.name || '—'} />
              <InfoRow label="Company" value={profile?.company || 'Not set'} />
              <InfoRow label="GST Number" value={profile?.gstNumber || 'Not set'} />
              <InfoRow label="Location" value={profile?.location || 'Not set'} />
              <InfoRow label="Phone" value={profile?.phone || '—'} />
              <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trust Score</Text>
          <Text style={styles.trustScoreNotice}>
            Trust Score breakdown isn't available on mobile yet — view it on the VyaparSethu web dashboard.
          </Text>
        </View>

        <View style={styles.linksCard}>
          <Pressable onPress={() => Linking.openURL('https://vyaparsethu.com/terms')}>
            <Text style={styles.link}>Terms of Service</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://vyaparsethu.com/privacy')}>
            <Text style={styles.link}>Privacy Policy</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.fieldInput} value={value} onChangeText={onChangeText} placeholderTextColor={COLORS.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ivory },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.ivory },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: '700', color: COLORS.navy, marginBottom: 20 },
  error: { color: COLORS.danger, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  trustScoreNotice: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 13, color: COLORS.textMuted },
  infoValue: { fontSize: 13, color: COLORS.textDark, fontWeight: '600' },
  editButton: { marginTop: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.navy, borderRadius: 10 },
  editButtonText: { color: COLORS.navy, fontWeight: '700' },
  field: { marginBottom: 12 },
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
  editActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelButton: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelButtonText: { color: COLORS.textMuted, fontWeight: '600' },
  saveButton: { flex: 1, backgroundColor: COLORS.gold, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  saveButtonText: { color: COLORS.navy, fontWeight: '700' },
  linksCard: { marginBottom: 20, gap: 10 },
  link: { color: COLORS.teal, fontSize: 14, fontWeight: '600', paddingVertical: 4 },
  logoutButton: { borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logoutButtonText: { color: COLORS.danger, fontWeight: '700' },
});

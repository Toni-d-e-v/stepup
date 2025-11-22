import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'professor',
    school: '',
    class: '',
    generation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        school: formData.school.trim() || undefined,
        class: formData.class.trim() || undefined,
        generation: formData.generation.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join StepUp and start your journey</Text>

            <View style={styles.form}>
              <SegmentedButtons
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as 'student' | 'professor' })
                }
                buttons={[
                  { value: 'student', label: 'Student' },
                  { value: 'professor', label: 'Professor' },
                ]}
                style={styles.segmented}
                theme={{ colors: { secondaryContainer: '#fff' } }}
              />

              <TextInput
                label="First Name *"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#fff"
                activeOutlineColor="#fff"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#fff' } }}
              />

              <TextInput
                label="Last Name *"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#fff"
                activeOutlineColor="#fff"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#fff' } }}
              />

              <TextInput
                label="Email *"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                outlineColor="#fff"
                activeOutlineColor="#fff"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#fff' } }}
              />

              <TextInput
                label="School"
                value={formData.school}
                onChangeText={(text) => setFormData({ ...formData, school: text })}
                mode="outlined"
                style={styles.input}
                outlineColor="#fff"
                activeOutlineColor="#fff"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#fff' } }}
              />

              {formData.role === 'student' && (
                <>
                  <TextInput
                    label="Class"
                    value={formData.class}
                    onChangeText={(text) => setFormData({ ...formData, class: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor="#fff"
                    activeOutlineColor="#fff"
                    textColor="#fff"
                    theme={{ colors: { onSurfaceVariant: '#fff' } }}
                  />

                  <TextInput
                    label="Generation"
                    value={formData.generation}
                    onChangeText={(text) => setFormData({ ...formData, generation: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor="#fff"
                    activeOutlineColor="#fff"
                    textColor="#fff"
                    theme={{ colors: { onSurfaceVariant: '#fff' } }}
                  />
                </>
              )}

              <TextInput
                label="Password *"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
                outlineColor="#fff"
                activeOutlineColor="#fff"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#fff' } }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#fff"
                  />
                }
              />

              <TextInput
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
                outlineColor="#fff"
                activeOutlineColor="#fff"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#fff' } }}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#fff"
                textColor={COLORS.primary}
              >
                Create Account
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                textColor="#fff"
                style={styles.linkButton}
              >
                Already have an account? Login
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
    opacity: 0.9,
  },
  form: {
    width: '100%',
  },
  segmented: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },
});

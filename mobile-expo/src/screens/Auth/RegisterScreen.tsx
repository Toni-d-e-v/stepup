import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { schoolsService } from '../../services/schools';
import { School } from '../../types';
import { COLORS } from '../../utils/constants';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    school: '',
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolMenuVisible, setSchoolMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const schoolsList = await schoolsService.getSchools();
      setSchools(schoolsList);
    } catch (err) {
      console.error('Error loading schools:', err);
      setError('Could not load schools. Please try again.');
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setFormData({ ...formData, school: school._id });
    setSchoolMenuVisible(false);
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.school) {
      setError('Please select a school');
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
        school: formData.school,
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
            <Text style={styles.logo}>👟</Text>
            <Text style={styles.title}>Join StepUp</Text>
            <Text style={styles.subtitle}>Start tracking your steps today</Text>

            <View style={styles.form}>
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
                autoComplete="email"
                style={styles.input}
                outlineColor="#fff"
                activeOutlineColor="#fff"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#fff' } }}
              />

              <Menu
                visible={schoolMenuVisible}
                onDismiss={() => setSchoolMenuVisible(false)}
                anchor={
                  <TextInput
                    label="School *"
                    value={selectedSchool?.name || ''}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                    outlineColor="#fff"
                    activeOutlineColor="#fff"
                    textColor="#fff"
                    theme={{ colors: { onSurfaceVariant: '#fff' } }}
                    right={
                      <TextInput.Icon
                        icon="chevron-down"
                        onPress={() => setSchoolMenuVisible(true)}
                        color="#fff"
                      />
                    }
                    onPressIn={() => setSchoolMenuVisible(true)}
                  />
                }
                contentStyle={styles.menu}
              >
                {loadingSchools ? (
                  <Menu.Item title="Loading schools..." disabled />
                ) : schools.length === 0 ? (
                  <Menu.Item title="No schools available" disabled />
                ) : (
                  schools.map((school) => (
                    <Menu.Item
                      key={school._id}
                      onPress={() => handleSchoolSelect(school)}
                      title={school.name}
                    />
                  ))
                )}
              </Menu>

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
                disabled={loading || loadingSchools}
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
    justifyContent: 'center',
  },
  logo: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  menu: {
    maxHeight: 300,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 16,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },
});

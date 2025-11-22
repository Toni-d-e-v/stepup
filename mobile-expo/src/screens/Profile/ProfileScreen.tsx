import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, Divider, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { stepsService } from '../../services/steps';
import { COLORS } from '../../utils/constants';
import { StepStats } from '../../types';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<StepStats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    dailyAverage: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await stepsService.getStepStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'student':
        return '🎓 Student';
      case 'professor':
        return '👨‍🏫 Professor';
      case 'admin':
        return '👑 Admin';
      default:
        return 'User';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={COLORS.gradient} style={styles.header}>
        <Avatar.Text size={80} label={initials} style={styles.avatar} />
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.role}>{getRoleBadge()}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <Card style={styles.statsCard} elevation={2}>
        <Card.Content>
          <Text style={styles.cardTitle}>📊 Your Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Steps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.dailyAverage).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Daily Average</Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.week.toLocaleString()}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.month.toLocaleString()}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard} elevation={2}>
        <Card.Content>
          <Text style={styles.cardTitle}>👤 Personal Information</Text>
          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Role"
            description={user?.role}
            left={(props) => <List.Icon {...props} icon="account" />}
          />
          {user?.school && (
            <>
              <Divider />
              <List.Item
                title="School"
                description={user.school}
                left={(props) => <List.Icon {...props} icon="school" />}
              />
            </>
          )}
          {user?.class && (
            <>
              <Divider />
              <List.Item
                title="Class"
                description={user.class}
                left={(props) => <List.Icon {...props} icon="google-classroom" />}
              />
            </>
          )}
          {user?.generation && (
            <>
              <Divider />
              <List.Item
                title="Generation"
                description={user.generation}
                left={(props) => <List.Icon {...props} icon="calendar" />}
              />
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.achievementsCard} elevation={2}>
        <Card.Content>
          <Text style={styles.cardTitle}>🏆 Achievements</Text>
          <View style={styles.achievementsGrid}>
            {stats.total >= 10000 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementIcon}>🥉</Text>
                <Text style={styles.achievementText}>10K Steps</Text>
              </View>
            )}
            {stats.total >= 50000 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementIcon}>🥈</Text>
                <Text style={styles.achievementText}>50K Steps</Text>
              </View>
            )}
            {stats.total >= 100000 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementIcon}>🥇</Text>
                <Text style={styles.achievementText}>100K Steps</Text>
              </View>
            )}
            {stats.dailyAverage >= 10000 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementIcon}>⭐</Text>
                <Text style={styles.achievementText}>Daily Goal Master</Text>
              </View>
            )}
            {stats.total === 0 && (
              <Text style={styles.noAchievements}>
                Start walking to unlock achievements!
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor={COLORS.error}
        icon="logout"
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    paddingTop: 48,
  },
  avatar: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
    opacity: 0.9,
  },
  email: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  statsCard: {
    margin: 16,
    marginTop: -24,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    marginVertical: 16,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  achievementsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievement: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: 100,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  noAchievements: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    padding: 16,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 6,
  },
});

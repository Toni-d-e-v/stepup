import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { StepCard } from '../../components/StepCard';
import { useAuth } from '../../context/AuthContext';
import { stepsService } from '../../services/steps';
import pedometer from '../../services/pedometer';
import { COLORS, STEP_GOALS } from '../../utils/constants';
import { StepStats } from '../../types';
import { format } from 'date-fns';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<StepStats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    dailyAverage: 0,
  });

  useEffect(() => {
    initializePedometer();
    loadStats();

    // Update steps every 10 seconds
    const interval = setInterval(() => {
      updateSteps();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const initializePedometer = async () => {
    const initialized = await pedometer.initialize();
    if (initialized) {
      updateSteps();
    }
  };

  const updateSteps = async () => {
    const steps = await pedometer.getTodaySteps();
    setTodaySteps(steps);
  };

  const loadStats = async () => {
    try {
      const statsData = await stepsService.getStepStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([updateSteps(), loadStats()]);
    setRefreshing(false);
  }, []);

  const handleSyncSteps = async () => {
    try {
      await pedometer.forceSync();
      await loadStats();
      setMessage('✅ Steps synced successfully!');
    } catch (error) {
      console.error('Error syncing steps:', error);
      setMessage('❌ Failed to sync steps');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.firstName}! 👋
        </Text>
        <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</Text>
      </View>

      <StepCard
        steps={todaySteps}
        goal={STEP_GOALS.daily}
        label="Today's Steps"
      />

      <View style={styles.statsGrid}>
        <Card style={styles.statCard} elevation={2}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>{stats.week.toLocaleString()}</Text>
            <Text style={styles.statSubtext}>
              {Math.round((stats.week / STEP_GOALS.weekly) * 100)}% of goal
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} elevation={2}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>{stats.month.toLocaleString()}</Text>
            <Text style={styles.statSubtext}>
              {Math.round((stats.month / STEP_GOALS.monthly) * 100)}% of goal
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard} elevation={2}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statLabel}>Daily Average</Text>
            <Text style={styles.statValue}>{Math.round(stats.dailyAverage).toLocaleString()}</Text>
            <Text style={styles.statSubtext}>steps/day</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} elevation={2}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statLabel}>Total Steps</Text>
            <Text style={styles.statValue}>{stats.total.toLocaleString()}</Text>
            <Text style={styles.statSubtext}>all time</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.infoCard} elevation={2}>
        <Card.Content>
          <Text style={styles.infoTitle}>📱 Automatic Step Tracking</Text>
          <Text style={styles.infoText}>
            Your steps are being tracked automatically using your device's pedometer!
            Steps sync to the server every 100 steps or when you tap sync below.
          </Text>
          <Button
            mode="contained"
            onPress={handleSyncSteps}
            style={styles.syncButton}
            buttonColor={COLORS.primary}
          >
            Sync Now
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.tipsCard} elevation={2}>
        <Card.Content>
          <Text style={styles.tipsTitle}>💡 Tips to Reach Your Goal</Text>
          <Text style={styles.tipText}>• Take the stairs instead of the elevator</Text>
          <Text style={styles.tipText}>• Walk during phone calls</Text>
          <Text style={styles.tipText}>• Park further away from your destination</Text>
          <Text style={styles.tipText}>• Take a 10-minute walk after meals</Text>
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage('')}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setMessage(''),
        }}
      >
        {message}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  infoCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  syncButton: {
    marginTop: 8,
  },
  tipsCard: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#fff3e0',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});

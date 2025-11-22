import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, SegmentedButtons, ActivityIndicator, Card } from 'react-native-paper';
import { LeaderboardItem } from '../../components/LeaderboardItem';
import { useAuth } from '../../context/AuthContext';
import { leaderboardService } from '../../services/leaderboard';
import { LeaderboardEntry } from '../../types';
import { COLORS } from '../../utils/constants';

type Period = 'daily' | 'weekly' | 'monthly';

export const LeaderboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('daily');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      let data: LeaderboardEntry[] = [];

      switch (period) {
        case 'daily':
          data = await leaderboardService.getDailyLeaderboard();
          break;
        case 'weekly':
          data = await leaderboardService.getWeeklyLeaderboard();
          break;
        case 'monthly':
          data = await leaderboardService.getMonthlyLeaderboard();
          break;
      }

      setLeaderboard(data);

      // Find user's rank
      const userEntry = data.find((entry) => entry.userId._id === user?._id);
      setUserRank(userEntry || null);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [period]);

  const getPeriodTitle = () => {
    switch (period) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <SegmentedButtons
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
          buttons={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          style={styles.segmented}
        />
      </View>

      {userRank && (
        <Card style={styles.userRankCard} elevation={3}>
          <Card.Content>
            <Text style={styles.userRankTitle}>Your Rank</Text>
            <View style={styles.userRankContent}>
              <View>
                <Text style={styles.userRankPosition}>#{userRank.rank}</Text>
                <Text style={styles.userRankPeriod}>{getPeriodTitle()}</Text>
              </View>
              <View style={styles.userRankSteps}>
                <Text style={styles.userRankStepsValue}>
                  {userRank.totalSteps.toLocaleString()}
                </Text>
                <Text style={styles.userRankStepsLabel}>steps</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {leaderboard.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No data available yet</Text>
              <Text style={styles.emptySubtext}>Start walking to appear on the leaderboard!</Text>
            </View>
          ) : (
            leaderboard.map((entry) => (
              <LeaderboardItem
                key={entry.userId._id}
                entry={entry}
                isCurrentUser={entry.userId._id === user?._id}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  segmented: {
    marginBottom: 8,
  },
  userRankCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  userRankTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankPosition: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRankPeriod: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  userRankSteps: {
    alignItems: 'flex-end',
  },
  userRankStepsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRankStepsLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  list: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

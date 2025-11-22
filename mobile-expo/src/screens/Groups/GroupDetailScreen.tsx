import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { LeaderboardItem } from '../../components/LeaderboardItem';
import { groupsService } from '../../services/groups';
import { Group, LeaderboardEntry } from '../../types';
import { COLORS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export const GroupDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { user } = useAuth();
  const { groupId } = route.params;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const [groupData, leaderboardData] = await Promise.all([
        groupsService.getGroup(groupId),
        groupsService.getGroupLeaderboard(groupId),
      ]);

      setGroup(groupData);
      setLeaderboard(leaderboardData);
      setIsMember(groupData.members?.some((member) => member._id === user?._id) || false);
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      setJoining(true);
      await groupsService.joinGroup(groupId);
      await loadGroupDetails();
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setJoining(true);
      await groupsService.leaveGroup(groupId);
      await loadGroupDetails();
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      setJoining(false);
    }
  };

  if (loading || !group) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard} elevation={2}>
        <Card.Content>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.description && (
            <Text style={styles.description}>{group.description}</Text>
          )}
          <Chip
            style={styles.typeChip}
            textStyle={styles.typeChipText}
          >
            {group.type.toUpperCase()}
          </Chip>
          <View style={styles.stats}>
            <Text style={styles.statText}>👥 {group.members?.length || 0} members</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          {isMember ? (
            <Button
              mode="outlined"
              onPress={handleLeaveGroup}
              loading={joining}
              disabled={joining}
              textColor={COLORS.error}
            >
              Leave Group
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleJoinGroup}
              loading={joining}
              disabled={joining}
              buttonColor={COLORS.primary}
            >
              Join Group
            </Button>
          )}
        </Card.Actions>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Leaderboard</Text>
        <Divider style={styles.divider} />
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activity yet</Text>
            <Text style={styles.emptySubtext}>Be the first to start walking!</Text>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    borderRadius: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: COLORS.primary,
  },
  typeChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stats: {
    marginTop: 8,
  },
  statText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 16,
    paddingBottom: 8,
  },
  divider: {
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

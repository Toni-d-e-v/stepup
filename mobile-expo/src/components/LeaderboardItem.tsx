import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, Avatar } from 'react-native-paper';
import { LeaderboardEntry } from '../types';
import { COLORS } from '../utils/constants';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ entry, isCurrentUser }) => {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return COLORS.textSecondary;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return '🏆';
    }
    return `#${rank}`;
  };

  const initials = `${entry.userId.firstName[0]}${entry.userId.lastName[0]}`.toUpperCase();

  return (
    <List.Item
      title={`${entry.userId.firstName} ${entry.userId.lastName}`}
      description={`${entry.totalSteps.toLocaleString()} steps`}
      left={() => (
        <View style={styles.leftContainer}>
          <Text
            style={[
              styles.rank,
              { color: getMedalColor(entry.rank) },
              entry.rank <= 3 && styles.medalRank,
            ]}
          >
            {getRankIcon(entry.rank)}
          </Text>
          <Avatar.Text
            size={40}
            label={initials}
            style={[
              styles.avatar,
              isCurrentUser && styles.currentUserAvatar,
            ]}
          />
        </View>
      )}
      style={[styles.item, isCurrentUser && styles.currentUserItem]}
      titleStyle={[styles.title, isCurrentUser && styles.currentUserTitle]}
      descriptionStyle={styles.description}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currentUserItem: {
    backgroundColor: '#f0e6ff',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  medalRank: {
    fontSize: 24,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  currentUserAvatar: {
    backgroundColor: COLORS.secondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentUserTitle: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

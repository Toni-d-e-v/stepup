import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { Group } from '../types';
import { COLORS } from '../utils/constants';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  isMember?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress, isMember }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return '#2196F3';
      case 'school':
        return '#4CAF50';
      case 'generation':
        return '#FF9800';
      default:
        return COLORS.primary;
    }
  };

  return (
    <Card style={styles.card} onPress={onPress} elevation={2}>
      <Card.Content>
        <Text style={styles.name}>{group.name}</Text>
        {group.description && (
          <Text style={styles.description} numberOfLines={2}>
            {group.description}
          </Text>
        )}
        <Chip
          style={[styles.chip, { backgroundColor: getTypeColor(group.type) }]}
          textStyle={styles.chipText}
        >
          {group.type.toUpperCase()}
        </Chip>
        <Text style={styles.members}>
          👥 {group.members?.length || 0} members
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button
          mode={isMember ? 'outlined' : 'contained'}
          onPress={onPress}
          buttonColor={isMember ? undefined : COLORS.primary}
        >
          {isMember ? 'View Details' : 'Join Group'}
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  members: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

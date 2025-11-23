import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Searchbar, ActivityIndicator, Chip } from 'react-native-paper';
import { GroupCard } from '../../components/GroupCard';
import { groupsService } from '../../services/groups';
import { Group } from '../../types';
import { COLORS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

export const GroupsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, selectedType, groups]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsService.getGroups();
      setGroups(data);
      setFilteredGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = [...groups];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter((group) => group.type === selectedType);
    }

    setFilteredGroups(filtered);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  }, []);

  const isUserMember = (group: Group) => {
    return group.members?.some((member) => member._id === user?._id);
  };

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupDetail', { groupId: group._id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <Searchbar
          placeholder="Search groups..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          <Chip
            selected={selectedType === null}
            onPress={() => setSelectedType(null)}
            style={styles.chip}
          >
            All
          </Chip>
          <Chip
            selected={selectedType === 'class'}
            onPress={() => setSelectedType('class')}
            style={styles.chip}
          >
            Class
          </Chip>
          <Chip
            selected={selectedType === 'school'}
            onPress={() => setSelectedType('school')}
            style={styles.chip}
          >
            School
          </Chip>
          <Chip
            selected={selectedType === 'generation'}
            onPress={() => setSelectedType('generation')}
            style={styles.chip}
          >
            Generation
          </Chip>
          <Chip
            selected={selectedType === 'custom'}
            onPress={() => setSelectedType('custom')}
            style={styles.chip}
          >
            Custom
          </Chip>
        </ScrollView>
      </View>

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
          {filteredGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>
                {groups.length === 0 && !searchQuery && !selectedType
                  ? 'Waiting for Groups'
                  : 'No groups found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {groups.length === 0 && !searchQuery && !selectedType
                  ? 'Your school admin will add you to groups soon. You\'ll be notified when you\'re added!'
                  : searchQuery || selectedType
                  ? 'Try adjusting your filters'
                  : 'Groups will appear here when created'}
              </Text>
            </View>
          ) : (
            filteredGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                onPress={() => handleGroupPress(group)}
                isMember={isUserMember(group)}
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
  searchbar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
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

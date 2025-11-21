import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/group_model.dart';
import '../../models/leaderboard_model.dart';
import '../../services/group_service.dart';

class GroupDetailScreen extends StatefulWidget {
  final String groupId;

  const GroupDetailScreen({super.key, required this.groupId});

  @override
  State<GroupDetailScreen> createState() => _GroupDetailScreenState();
}

class _GroupDetailScreenState extends State<GroupDetailScreen> {
  final _groupService = GroupService();
  Group? _group;
  List<LeaderboardEntry> _leaderboard = [];
  bool _isLoading = true;
  bool _isMember = false;

  @override
  void initState() {
    super.initState();
    _loadGroupData();
  }

  Future<void> _loadGroupData() async {
    setState(() => _isLoading = true);

    try {
      final group = await _groupService.getGroup(widget.groupId);
      final leaderboard = await _groupService.getGroupLeaderboard(widget.groupId);

      setState(() {
        _group = group;
        _leaderboard = leaderboard;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading group: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleJoinLeave() async {
    if (_group == null) return;

    try {
      if (_isMember) {
        await _groupService.leaveGroup(widget.groupId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Left group successfully')),
          );
        }
      } else {
        await _groupService.joinGroup(widget.groupId);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Joined group successfully')),
          );
        }
      }
      _loadGroupData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_group?.name ?? 'Group Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadGroupData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadGroupData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Group Info Card
                    _buildGroupInfoCard(),

                    // Leaderboard
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        'Group Leaderboard',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    _buildLeaderboard(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildGroupInfoCard() {
    if (_group == null) return const SizedBox();

    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Chip(label: Text(_group!.typeDisplay)),
                const Spacer(),
                Text(
                  '${_group!.memberCount} Members',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ),
            if (_group!.description.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(_group!.description),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.directions_walk, size: 20),
                const SizedBox(width: 8),
                Text(
                  '${NumberFormat('#,###').format(_group!.totalSteps)} total steps',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _handleJoinLeave,
                child: Text(_isMember ? 'Leave Group' : 'Join Group'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLeaderboard() {
    if (_leaderboard.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text('No members yet'),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _leaderboard.length,
      itemBuilder: (context, index) {
        final entry = _leaderboard[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              child: Text('#${entry.rank}'),
            ),
            title: Text(entry.fullName),
            subtitle: Text(entry.role == 'student' ? 'Student' : 'Professor'),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  NumberFormat('#,###').format(entry.totalSteps ?? 0),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text('steps', style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
        );
      },
    );
  }
}

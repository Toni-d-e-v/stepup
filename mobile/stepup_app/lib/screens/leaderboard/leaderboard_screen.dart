import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/leaderboard_model.dart';
import '../../services/leaderboard_service.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _leaderboardService = LeaderboardService();

  List<LeaderboardEntry> _dailyLeaderboard = [];
  List<LeaderboardEntry> _weeklyLeaderboard = [];
  List<LeaderboardEntry> _monthlyLeaderboard = [];

  bool _isLoading = true;
  String? _roleFilter;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: 1);
    _loadLeaderboards();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadLeaderboards() async {
    setState(() => _isLoading = true);

    try {
      final results = await Future.wait([
        _leaderboardService.getDailyLeaderboard(role: _roleFilter),
        _leaderboardService.getWeeklyLeaderboard(role: _roleFilter),
        _leaderboardService.getMonthlyLeaderboard(role: _roleFilter),
      ]);

      setState(() {
        _dailyLeaderboard = results[0];
        _weeklyLeaderboard = results[1];
        _monthlyLeaderboard = results[2];
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading leaderboards: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter by Role'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String?>(
              title: const Text('All'),
              value: null,
              groupValue: _roleFilter,
              onChanged: (value) {
                Navigator.pop(context);
                setState(() => _roleFilter = value);
                _loadLeaderboards();
              },
            ),
            RadioListTile<String?>(
              title: const Text('Students Only'),
              value: 'student',
              groupValue: _roleFilter,
              onChanged: (value) {
                Navigator.pop(context);
                setState(() => _roleFilter = value);
                _loadLeaderboards();
              },
            ),
            RadioListTile<String?>(
              title: const Text('Professors Only'),
              value: 'professor',
              groupValue: _roleFilter,
              onChanged: (value) {
                Navigator.pop(context);
                setState(() => _roleFilter = value);
                _loadLeaderboards();
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leaderboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadLeaderboards,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Daily'),
            Tab(text: 'Weekly'),
            Tab(text: 'Monthly'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildLeaderboardList(_dailyLeaderboard, isDailyView: true),
                _buildLeaderboardList(_weeklyLeaderboard),
                _buildLeaderboardList(_monthlyLeaderboard),
              ],
            ),
    );
  }

  Widget _buildLeaderboardList(List<LeaderboardEntry> entries, {bool isDailyView = false}) {
    if (entries.isEmpty) {
      return const Center(
        child: Text('No data available'),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadLeaderboards,
      child: ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: entries.length,
        itemBuilder: (context, index) {
          final entry = entries[index];
          return _buildLeaderboardItem(entry, isDailyView);
        },
      ),
    );
  }

  Widget _buildLeaderboardItem(LeaderboardEntry entry, bool isDailyView) {
    Color? rankColor;
    IconData? medalIcon;

    if (entry.rank == 1) {
      rankColor = Colors.amber;
      medalIcon = Icons.emoji_events;
    } else if (entry.rank == 2) {
      rankColor = Colors.grey[400];
      medalIcon = Icons.emoji_events;
    } else if (entry.rank == 3) {
      rankColor = Colors.brown[300];
      medalIcon = Icons.emoji_events;
    }

    final steps = isDailyView ? entry.steps : (entry.totalSteps ?? 0);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      elevation: entry.rank <= 3 ? 4 : 1,
      child: ListTile(
        leading: SizedBox(
          width: 50,
          child: Row(
            children: [
              if (medalIcon != null)
                Icon(medalIcon, color: rankColor, size: 24)
              else
                Text(
                  '#${entry.rank}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
        ),
        title: Text(
          entry.fullName,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        subtitle: Row(
          children: [
            Icon(
              entry.role == 'student' ? Icons.school : Icons.person,
              size: 14,
              color: Colors.grey[600],
            ),
            const SizedBox(width: 4),
            Text(entry.role == 'student' ? 'Student' : 'Professor'),
            if (!isDailyView && entry.daysActive != null) ...[
              const SizedBox(width: 12),
              Text('${entry.daysActive} days active'),
            ],
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              NumberFormat('#,###').format(steps),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: rankColor ?? Theme.of(context).primaryColor,
              ),
            ),
            const Text(
              'steps',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

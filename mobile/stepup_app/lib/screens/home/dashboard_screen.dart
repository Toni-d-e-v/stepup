import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/step_model.dart';
import '../../models/user_model.dart';
import '../../services/auth_service.dart';
import '../../services/step_service.dart';
import '../../services/leaderboard_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _authService = AuthService();
  final _stepService = StepService();
  final _leaderboardService = LeaderboardService();

  User? _user;
  Statistics? _statistics;
  int _todaySteps = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      _user = _authService.currentUser;

      final stats = await _stepService.getStatistics();
      setState(() {
        _statistics = stats;
        _todaySteps = stats.today.steps;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading data: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _showAddStepsDialog() async {
    final stepsController = TextEditingController();

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Steps'),
        content: TextField(
          controller: stepsController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Number of steps',
            hintText: 'e.g., 10000',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final steps = int.tryParse(stepsController.text);
              if (steps != null && steps > 0) {
                Navigator.pop(context);
                await _addSteps(steps);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  Future<void> _addSteps(int steps) async {
    try {
      await _stepService.addSteps(
        date: DateTime.now(),
        steps: steps,
        source: 'manual',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Steps added successfully!')),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error adding steps: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hello, ${_user?.firstName ?? ""}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Today's Steps Card
                    _buildTodayStepsCard(),
                    const SizedBox(height: 16),

                    // Quick Stats Row
                    Row(
                      children: [
                        Expanded(child: _buildStatCard(
                          'Weekly',
                          _statistics?.weekly.totalSteps ?? 0,
                          Icons.calendar_view_week,
                          Colors.blue,
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _buildStatCard(
                          'Monthly',
                          _statistics?.monthly.totalSteps ?? 0,
                          Icons.calendar_month,
                          Colors.green,
                        )),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Best Day Card
                    if (_statistics?.bestDay != null)
                      _buildBestDayCard(),
                    const SizedBox(height: 16),

                    // Weekly Progress
                    _buildWeeklyProgress(),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddStepsDialog,
        icon: const Icon(Icons.add),
        label: const Text('Add Steps'),
      ),
    );
  }

  Widget _buildTodayStepsCard() {
    final goal = _user?.dailyStepGoal ?? 10000;
    final progress = (_todaySteps / goal).clamp(0.0, 1.0);
    final percentage = (progress * 100).toInt();

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              "Today's Steps",
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  height: 150,
                  width: 150,
                  child: CircularProgressIndicator(
                    value: progress,
                    strokeWidth: 12,
                    backgroundColor: Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation(
                      progress >= 1.0 ? Colors.green : Theme.of(context).primaryColor,
                    ),
                  ),
                ),
                Column(
                  children: [
                    Text(
                      NumberFormat('#,###').format(_todaySteps),
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '$percentage%',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            Text(
              'Goal: ${NumberFormat('#,###').format(goal)} steps',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            if (_statistics?.today.goalAchieved == true)
              Container(
                margin: const EdgeInsets.only(top: 12),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.green[100],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.check_circle, color: Colors.green, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Goal Achieved!',
                      style: TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, int value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              NumberFormat('#,###').format(value),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBestDayCard() {
    final bestDay = _statistics!.bestDay!;
    return Card(
      color: Colors.amber[50],
      child: ListTile(
        leading: const Icon(Icons.emoji_events, color: Colors.amber, size: 40),
        title: const Text('Best Day'),
        subtitle: Text(DateFormat('MMM dd, yyyy').format(bestDay.date)),
        trailing: Text(
          NumberFormat('#,###').format(bestDay.steps),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.amber,
          ),
        ),
      ),
    );
  }

  Widget _buildWeeklyProgress() {
    if (_statistics == null) return const SizedBox();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Weekly Summary',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            _buildProgressRow('Days Active', _statistics!.weekly.daysActive, 7),
            const SizedBox(height: 12),
            _buildProgressRow('Goals Achieved', _statistics!.weekly.goalsAchieved, 7),
            const SizedBox(height: 12),
            _buildInfoRow('Avg Steps/Day', NumberFormat('#,###').format(_statistics!.weekly.avgSteps.toInt())),
            const SizedBox(height: 12),
            _buildInfoRow('Total Points', _statistics!.weekly.totalPoints.toString()),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressRow(String label, int value, int max) {
    final progress = (value / max).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label),
            Text('$value/$max'),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: Colors.grey[200],
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

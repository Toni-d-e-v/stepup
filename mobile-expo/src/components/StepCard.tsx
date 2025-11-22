import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, STEP_GOALS } from '../utils/constants';

interface StepCardProps {
  steps: number;
  goal?: number;
  label: string;
}

export const StepCard: React.FC<StepCardProps> = ({ steps, goal = STEP_GOALS.daily, label }) => {
  const progress = Math.min(steps / goal, 1);
  const percentage = Math.round(progress * 100);

  return (
    <Card style={styles.card} elevation={3}>
      <LinearGradient
        colors={COLORS.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.steps}>{steps.toLocaleString()}</Text>
          <Text style={styles.goalText}>
            Goal: {goal.toLocaleString()} steps
          </Text>
          <ProgressBar
            progress={progress}
            color="#fff"
            style={styles.progressBar}
          />
          <Text style={styles.percentage}>{percentage}% Complete</Text>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
    opacity: 0.9,
  },
  steps: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  goalText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    opacity: 0.8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

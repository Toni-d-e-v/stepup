import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { stepsService } from './steps';

class PedometerService {
  private subscription: any = null;
  private lastStepCount: number = 0;
  private todaySteps: number = 0;
  private lastSyncDate: string = '';

  async initialize() {
    // Check if pedometer is available
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Pedometer is not available on this device');
      return false;
    }

    // Load today's steps from storage
    await this.loadTodaySteps();

    // Start listening to step updates
    this.startTracking();

    return true;
  }

  private async loadTodaySteps() {
    const today = new Date().toISOString().split('T')[0];
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS);

    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        this.todaySteps = data.steps;
        this.lastSyncDate = today;
      } else {
        // New day, reset steps
        this.todaySteps = 0;
        this.lastSyncDate = today;
        await this.saveTodaySteps();
      }
    }
  }

  private async saveTodaySteps() {
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_STEPS,
      JSON.stringify({
        date: today,
        steps: this.todaySteps,
      })
    );
  }

  startTracking() {
    if (this.subscription) {
      return; // Already tracking
    }

    // Get steps from midnight to now
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    this.subscription = Pedometer.watchStepCount((result) => {
      const newSteps = result.steps;

      // If this is the first reading, just store it
      if (this.lastStepCount === 0) {
        this.lastStepCount = newSteps;
        return;
      }

      // Calculate step difference
      const stepDiff = newSteps - this.lastStepCount;

      if (stepDiff > 0) {
        this.todaySteps += stepDiff;
        this.lastStepCount = newSteps;
        this.saveTodaySteps();

        // Auto-sync to backend every 100 steps
        if (this.todaySteps % 100 === 0) {
          this.syncToBackend();
        }
      }
    });
  }

  stopTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  async getTodaySteps(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastSyncDate !== today) {
      await this.loadTodaySteps();
    }
    return this.todaySteps;
  }

  async getPastSteps(days: number = 7): Promise<{ date: string; steps: number }[]> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return [{ date: new Date().toISOString(), steps: result.steps }];
    } catch (error) {
      console.error('Error getting past steps:', error);
      return [];
    }
  }

  async syncToBackend(): Promise<void> {
    try {
      if (this.todaySteps > 0) {
        await stepsService.addSteps(this.todaySteps, 'auto');
        console.log(`Synced ${this.todaySteps} steps to backend`);
      }
    } catch (error) {
      console.error('Error syncing steps to backend:', error);
    }
  }

  // Force sync (called manually or on app background)
  async forceSync(): Promise<void> {
    await this.saveTodaySteps();
    await this.syncToBackend();
  }
}

export default new PedometerService();

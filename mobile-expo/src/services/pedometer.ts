import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { stepsService } from './steps';

class PedometerService {
  private subscription: any = null;
  private todaySteps: number = 0;
  private lastSyncDate: string = '';
  private lastSyncedSteps: number = 0;

  async initialize() {
    // Check if pedometer is available
    const isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Pedometer is not available on this device');
      return false;
    }

    // Load today's steps from storage
    await this.loadTodaySteps();

    // Get steps from today and start tracking
    await this.startTracking();

    return true;
  }

  private async loadTodaySteps() {
    const today = new Date().toISOString().split('T')[0];
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS);

    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        this.todaySteps = data.steps;
        this.lastSyncedSteps = data.steps;
        this.lastSyncDate = today;
      } else {
        // New day, reset steps
        this.todaySteps = 0;
        this.lastSyncedSteps = 0;
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

  async startTracking() {
    if (this.subscription) {
      return; // Already tracking
    }

    // Get steps from midnight to now
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    try {
      // Get initial step count for today
      const pastSteps = await Pedometer.getStepCountAsync(start, end);
      this.todaySteps = pastSteps.steps;
      await this.saveTodaySteps();

      // Start watching for step updates
      this.subscription = Pedometer.watchStepCount((result) => {
        // watchStepCount returns incremental steps since subscription started
        // Add them to our initial count
        this.todaySteps = pastSteps.steps + result.steps;
        this.saveTodaySteps();

        // Auto-sync every 100 steps
        if (this.todaySteps - this.lastSyncedSteps >= 100) {
          this.syncToBackend();
        }
      });
    } catch (error) {
      console.error('Error starting step tracking:', error);
    }
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

  async syncToBackend(): Promise<void> {
    try {
      if (this.todaySteps > 0) {
        await stepsService.addSteps(this.todaySteps, 'auto');
        this.lastSyncedSteps = this.todaySteps;
        console.log(`Synced ${this.todaySteps} steps to backend`);
      }
    } catch (error) {
      console.error('Error syncing steps to backend:', error);
    }
  }

  // Force sync (called manually)
  async forceSync(): Promise<void> {
    await this.saveTodaySteps();
    await this.syncToBackend();
  }
}

export default new PedometerService();

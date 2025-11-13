import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  constructor(private authService: AuthService) {}

  async requestPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  async scheduleWorkoutReminders(enabled: boolean): Promise<void> {
    try {
      // Cancel existing workout notifications
      await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }] });

      if (!enabled) return;

      // Get workout frequency from localStorage
      const workoutFrequency = localStorage.getItem('workoutFrequency') || '3';
      const frequency = parseInt(workoutFrequency);

      // Schedule notifications based on frequency
      const notifications = [];
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0); // 8 AM

      for (let i = 0; i < frequency; i++) {
        const notificationTime = new Date(startOfDay.getTime() + (i * (16 * 60 * 60 * 1000) / frequency)); // Distribute throughout the day

        notifications.push({
          id: i + 1,
          title: 'Workout Reminder',
          body: 'Time for your workout session!',
          schedule: {
            at: notificationTime,
            repeats: true,
            every: 'day' as const
          },
          actionTypeId: 'workout',
          extra: { type: 'workout' }
        });
      }

      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error('Error scheduling workout reminders:', error);
    }
  }

  async scheduleWaterReminders(enabled: boolean): Promise<void> {
    try {
      // Cancel existing water notifications
      await LocalNotifications.cancel({ notifications: [{ id: 100 }, { id: 101 }, { id: 102 }, { id: 103 }, { id: 104 }, { id: 105 }, { id: 106 }, { id: 107 }] });

      if (!enabled) return;

      // Schedule water reminders every 2 hours from 8 AM to 8 PM
      const notifications = [];
      const now = new Date();

      for (let i = 0; i < 6; i++) {
        const notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8 + (i * 2), 0, 0);

        notifications.push({
          id: 100 + i,
          title: 'Stay Hydrated',
          body: 'Time to drink some water!',
          schedule: {
            at: notificationTime,
            repeats: true,
            every: 'day' as const
          },
          actionTypeId: 'water',
          extra: { type: 'water' }
        });
      }

      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error('Error scheduling water reminders:', error);
    }
  }

  async updateReminders(): Promise<void> {
    try {
      // Get reminder preferences from localStorage
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const reminders = userData.reminders || {};

        await this.scheduleWorkoutReminders(reminders.workoutReminder ?? true);
        await this.scheduleWaterReminders(reminders.waterReminder ?? false);
      }
    } catch (error) {
      console.error('Error updating reminders:', error);
    }
  }

  async cancelAllReminders(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [] }); // Cancel all notifications
    } catch (error) {
      console.error('Error canceling reminders:', error);
    }
  }
}

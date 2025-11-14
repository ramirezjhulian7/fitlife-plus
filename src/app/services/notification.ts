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

  async scheduleMealReminders(enabled: boolean): Promise<void> {
    try {
      // Cancel existing meal notifications
      await LocalNotifications.cancel({ notifications: [{ id: 200 }, { id: 201 }, { id: 202 }] });

      if (!enabled) return;

      // Schedule meal reminders at breakfast, lunch, and dinner times
      const notifications = [
        {
          id: 200,
          title: 'Breakfast Time',
          body: 'Time for a healthy breakfast!',
          schedule: {
            at: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 8, 0, 0),
            repeats: true,
            every: 'day' as const
          },
          actionTypeId: 'meal',
          extra: { type: 'meal', mealType: 'breakfast' }
        },
        {
          id: 201,
          title: 'Lunch Time',
          body: 'Time for a nutritious lunch!',
          schedule: {
            at: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 13, 0, 0),
            repeats: true,
            every: 'day' as const
          },
          actionTypeId: 'meal',
          extra: { type: 'meal', mealType: 'lunch' }
        },
        {
          id: 202,
          title: 'Dinner Time',
          body: 'Time for a balanced dinner!',
          schedule: {
            at: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 19, 0, 0),
            repeats: true,
            every: 'day' as const
          },
          actionTypeId: 'meal',
          extra: { type: 'meal', mealType: 'dinner' }
        }
      ];

      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error('Error scheduling meal reminders:', error);
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
      // Get reminder preferences from localStorage (user-specific)
      const userId = this.authService.currentUser?.id;
      const userDataKey = userId ? `userData_${userId}` : 'userData';
      const userDataString = localStorage.getItem(userDataKey);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const reminders = userData.reminders || {};

        await this.scheduleWorkoutReminders(reminders.workoutReminder ?? true);
        await this.scheduleMealReminders(reminders.mealReminder ?? true);
        await this.scheduleWaterReminders(reminders.waterReminder ?? false);
      } else {
        // Default reminders if no user data
        await this.scheduleWorkoutReminders(true);
        await this.scheduleMealReminders(true);
        await this.scheduleWaterReminders(false);
      }
    } catch (error) {
      console.error('Error updating reminders:', error);
    }
  }

  async sendTestNotification(type: 'workout' | 'meal' | 'water'): Promise<void> {
    try {
      let title: string;
      let body: string;

      switch (type) {
        case 'workout':
          title = '¡Prueba de Notificación!';
          body = 'Esta es una notificación de prueba para recordatorios de entrenamiento.';
          break;
        case 'meal':
          title = '¡Prueba de Notificación!';
          body = 'Esta es una notificación de prueba para recordatorios de comidas.';
          break;
        case 'water':
          title = '¡Prueba de Notificación!';
          body = 'Esta es una notificación de prueba para recordatorios de hidratación.';
          break;
      }

      // Use smaller IDs to avoid issues on Android
      const testIds: { [key: string]: number } = { workout: 9001, meal: 9002, water: 9003 };
      
      await LocalNotifications.schedule({
        notifications: [{
          id: testIds[type],
          title,
          body,
          schedule: { at: new Date() }, // Show immediately
          actionTypeId: type,
          extra: { type: 'test' }
        }]
      });
    } catch (error) {
      console.error(`Error sending test ${type} notification:`, error);
      throw error;
    }
  }

  async sendDelayedTestNotification(seconds: number = 5): Promise<void> {
    try {
      const notificationTime = new Date(Date.now() + (seconds * 1000)); // Add seconds to current time
      // Use a smaller ID to avoid issues on Android
      const testNotificationId = 9999;

      await LocalNotifications.schedule({
        notifications: [{
          id: testNotificationId,
          title: '¡Notificación Retardada!',
          body: `Esta notificación se programó para aparecer en ${seconds} segundos.`,
          schedule: { at: notificationTime },
          actionTypeId: 'test',
          extra: { type: 'delayed_test' }
        }]
      });
    } catch (error) {
      console.error('Error sending delayed test notification:', error);
      throw error;
    }
  }
}

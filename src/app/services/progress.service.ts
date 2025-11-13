import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';

export interface WeightEntry {
  date: string;
  weight: number;
  notes?: string;
}

export interface WorkoutEntry {
  date: string;
  completed: boolean;
  type: string;
  duration?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  target: number;
}

export interface ProgressStats {
  currentWeight: number;
  startingWeight: number;
  weightLost: number;
  lastWeightChange: number;
  bmi: number;
  bmiCategory: string;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  streakDays: number;
  totalWorkouts: number;
  achievementsUnlocked: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  // Señales para datos reactivos
  private weightHistory = signal<WeightEntry[]>([]);
  private workoutHistory = signal<WorkoutEntry[]>([]);
  private achievements = signal<Achievement[]>([]);

  constructor(private authService: AuthService, private databaseService: DatabaseService) {
    this.initializeData();
  }

  private initializeData() {
    // Cargar datos desde localStorage o inicializar vacíos
    this.loadWeightHistory();
    this.loadWorkoutHistory();
    this.initializeAchievements();
  }

  // Gestión del historial de peso
  private loadWeightHistory() {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      this.weightHistory.set([]);
      return;
    }

    const stored = localStorage.getItem(`weightHistory_${userId}`);
    if (stored) {
      try {
        const history = JSON.parse(stored);
        this.weightHistory.set(history);
      } catch (e) {
        console.error('Error loading weight history:', e);
        this.weightHistory.set([]);
      }
    } else {
      this.weightHistory.set([]);
    }
  }

  private saveWeightHistory() {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    localStorage.setItem(`weightHistory_${userId}`, JSON.stringify(this.weightHistory()));
  }

  getWeightHistory(): WeightEntry[] {
    return this.weightHistory();
  }

  addWeightEntry(weight: number, notes?: string) {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = {
      date: today,
      weight: weight,
      notes: notes
    };

    // Reemplazar entrada del día si existe, o añadir nueva
    const currentHistory = this.weightHistory();
    const existingIndex = currentHistory.findIndex(entry => entry.date === today);

    if (existingIndex >= 0) {
      currentHistory[existingIndex] = newEntry;
    } else {
      currentHistory.push(newEntry);
      currentHistory.sort((a, b) => a.date.localeCompare(b.date));
    }

    this.weightHistory.set([...currentHistory]);
    this.saveWeightHistory();
    this.updateAchievements();

    // Guardar progreso en la base de datos
    this.saveProgressToDatabase();
  }

  // Gestión del historial de entrenamientos
  private loadWorkoutHistory() {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      this.workoutHistory.set([]);
      return;
    }

    const stored = localStorage.getItem(`workoutHistory_${userId}`);
    if (stored) {
      try {
        const history = JSON.parse(stored);
        this.workoutHistory.set(history);
      } catch (e) {
        console.error('Error loading workout history:', e);
        this.workoutHistory.set([]);
      }
    } else {
      this.workoutHistory.set([]);
    }
  }

  private saveWorkoutHistory() {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    localStorage.setItem(`workoutHistory_${userId}`, JSON.stringify(this.workoutHistory()));
  }

  getWorkoutHistory(): WorkoutEntry[] {
    return this.workoutHistory();
  }

  addWorkoutEntry(completed: boolean, type: string, duration?: number) {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WorkoutEntry = {
      date: today,
      completed: completed,
      type: type,
      duration: duration
    };

    // Reemplazar entrada del día si existe, o añadir nueva
    const currentHistory = this.workoutHistory();
    const existingIndex = currentHistory.findIndex(entry => entry.date === today);

    if (existingIndex >= 0) {
      currentHistory[existingIndex] = newEntry;
    } else {
      currentHistory.push(newEntry);
      currentHistory.sort((a, b) => a.date.localeCompare(b.date));
    }

    this.workoutHistory.set([...currentHistory]);
    this.saveWorkoutHistory();
    this.updateAchievements();

    // Guardar progreso en la base de datos
    this.saveProgressToDatabase();
  }

  // Gestión de logros
  private initializeAchievements() {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_workout',
        title: 'Primer Entrenamiento',
        description: 'Completa tu primer entrenamiento',
        icon: 'fitness',
        unlocked: false,
        progress: 0,
        target: 1
      },
      {
        id: 'week_streak',
        title: 'Semana Completa',
        description: 'Entrena 7 días seguidos',
        icon: 'flame',
        unlocked: false,
        progress: 0,
        target: 7
      },
      {
        id: 'weight_loss_1kg',
        title: 'Primera Victoria',
        description: 'Pierde 1kg',
        icon: 'trophy',
        unlocked: false,
        progress: 0,
        target: 1
      },
      {
        id: 'weight_loss_5kg',
        title: 'Campeón',
        description: 'Pierde 5kg',
        icon: 'medal',
        unlocked: false,
        progress: 0,
        target: 5
      },
      {
        id: 'month_consistent',
        title: 'Mes de Consistencia',
        description: 'Entrena al menos 20 días en un mes',
        icon: 'calendar',
        unlocked: false,
        progress: 0,
        target: 20
      },
      {
        id: 'workout_variety',
        title: 'Todo Terreno',
        description: 'Prueba 5 tipos diferentes de entrenamiento',
        icon: 'body',
        unlocked: false,
        progress: 0,
        target: 5
      },
      {
        id: 'energy_week',
        title: 'Semana de Energía',
        description: 'Entrena 5 de los últimos 7 días',
        icon: 'flame',
        unlocked: false,
        progress: 0,
        target: 5
      }
    ];

    // Cargar progreso guardado o inicializar
    const userId = this.authService.currentUser?.id;
    const stored = userId ? localStorage.getItem(`achievements_${userId}`) : null;
    if (stored) {
      try {
        const savedAchievements = JSON.parse(stored);
        // Combinar con defaults para asegurar que todos los logros existan
        const merged = defaultAchievements.map(defaultAch => {
          const saved = savedAchievements.find((a: Achievement) => a.id === defaultAch.id);
          return saved || defaultAch;
        });
        this.achievements.set(merged);
      } catch (e) {
        console.error('Error loading achievements:', e);
        this.achievements.set(defaultAchievements);
      }
    } else {
      this.achievements.set(defaultAchievements);
    }

    this.updateAchievements();
  }

  private updateAchievements() {
    const weightHistory = this.weightHistory();
    const workoutHistory = this.workoutHistory();
    const currentAchievements = this.achievements();

    // Calcular progreso de logros basado en datos REALES
    const completedWorkouts = workoutHistory.filter(w => w.completed).length;
    const currentStreak = this.calculateCurrentStreak();
    const weightLost = weightHistory.length >= 2 ? Math.max(0, weightHistory[0].weight - weightHistory[weightHistory.length - 1].weight) : 0;
    const monthlyWorkouts = this.getWorkoutsThisMonth();
    const uniqueWorkoutTypes = new Set(workoutHistory.filter(w => w.completed).map(w => w.type)).size;
    
    // Calcular días consecutivos de energía máxima (últimas 7 días con máximo 1 entrenamiento por día)
    const recentDays = 7;
    let recentWorkouts = 0;
    const today = new Date();
    for (let i = 0; i < recentDays; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (workoutHistory.find(w => w.date === dateStr && w.completed)) {
        recentWorkouts++;
      }
    }

    // Actualizar progreso de cada logro
    currentAchievements.forEach(achievement => {
      switch (achievement.id) {
        case 'first_workout':
          achievement.progress = Math.min(completedWorkouts, 1);
          if (completedWorkouts >= 1) {
            achievement.unlocked = true;
          }
          break;
          
        case 'week_streak':
          achievement.progress = Math.min(currentStreak, 7);
          if (currentStreak >= 7) {
            achievement.unlocked = true;
          }
          break;
          
        case 'weight_loss_1kg':
          achievement.progress = Math.min(Math.round(weightLost * 10) / 10, 1);
          if (weightLost >= 1) {
            achievement.unlocked = true;
          }
          break;
          
        case 'weight_loss_5kg':
          achievement.progress = Math.min(Math.round(weightLost * 10) / 10, 5);
          if (weightLost >= 5) {
            achievement.unlocked = true;
          }
          break;
          
        case 'month_consistent':
          achievement.progress = Math.min(monthlyWorkouts, 20);
          if (monthlyWorkouts >= 20) {
            achievement.unlocked = true;
          }
          break;
          
        case 'workout_variety':
          achievement.progress = Math.min(uniqueWorkoutTypes, 5);
          if (uniqueWorkoutTypes >= 5) {
            achievement.unlocked = true;
          }
          break;
          
        case 'energy_week':
          achievement.progress = Math.min(recentWorkouts, 5);
          if (recentWorkouts >= 5) {
            achievement.unlocked = true;
          }
          break;
      }

      // Registrar fecha de desbloqueo
      if (achievement.unlocked && !achievement.unlockedDate) {
        achievement.unlockedDate = new Date().toISOString();
      }
    });

    this.achievements.set([...currentAchievements]);
    this.saveAchievements();
  }

  private saveAchievements() {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    localStorage.setItem(`achievements_${userId}`, JSON.stringify(this.achievements()));
  }

  getAchievements(): Achievement[] {
    return this.achievements();
  }

  // Métodos de cálculo de estadísticas
  async getProgressStats(): Promise<ProgressStats> {
    const weightHistory = this.weightHistory();
    const workoutHistory = this.workoutHistory();

    const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0;
    const startingWeight = weightHistory.length > 0 ? weightHistory[0].weight : 0;
    const weightLost = Math.max(0, startingWeight - currentWeight);
    const lastWeightChange = this.calculateLastWeightChange();
    const bmiData = await this.calculateBMI();

    const workoutsThisWeek = this.getWorkoutsThisWeek();
    const workoutsThisMonth = this.getWorkoutsThisMonth();
    const streakDays = this.calculateCurrentStreak();
    const totalWorkouts = workoutHistory.filter(w => w.completed).length;
    const achievementsUnlocked = this.achievements().filter(a => a.unlocked).length;

    return {
      currentWeight,
      startingWeight,
      weightLost,
      lastWeightChange,
      bmi: bmiData.bmi,
      bmiCategory: bmiData.category,
      workoutsThisWeek,
      workoutsThisMonth,
      streakDays,
      totalWorkouts,
      achievementsUnlocked
    };
  }

  private getWorkoutsThisWeek(): number {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    return this.workoutHistory().filter(entry =>
      entry.completed &&
      new Date(entry.date) >= weekAgo &&
      new Date(entry.date) <= today
    ).length;
  }

  private getWorkoutsThisMonth(): number {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return this.workoutHistory().filter(entry =>
      entry.completed &&
      new Date(entry.date) >= monthStart &&
      new Date(entry.date) <= today
    ).length;
  }

  private calculateCurrentStreak(): number {
    const workoutHistory = this.workoutHistory();
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const dateStr = checkDate.toISOString().split('T')[0];
      const workoutOnDate = workoutHistory.find(w => w.date === dateStr && w.completed);

      if (workoutOnDate) {
        streak++;
      } else if (i > 0) { // No romper racha por días futuros
        break;
      }
    }

    return streak;
  }

  private async calculateBMI(): Promise<{ bmi: number; category: string }> {
    const userId = this.authService.currentUser?.id;
    const weightHistory = this.weightHistory();

    if (!userId || weightHistory.length === 0) {
      return { bmi: 0, category: 'Sin datos' };
    }

    try {
      // Obtener el perfil del usuario desde la base de datos
      const userProfile = await this.databaseService.getUserProfile(userId);
      const height = userProfile?.height; // en cm
      const currentWeight = weightHistory[weightHistory.length - 1].weight; // en kg

      if (!height || !currentWeight || height <= 0 || currentWeight <= 0) {
        return { bmi: 0, category: 'Sin datos' };
      }

      // Convertir altura a metros
      const heightInMeters = height / 100;
      const bmi = currentWeight / (heightInMeters * heightInMeters);

      let category = '';
      if (bmi < 18.5) {
        category = 'Bajo peso';
      } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal';
      } else if (bmi >= 25 && bmi < 30) {
        category = 'Sobrepeso';
      } else if (bmi >= 30 && bmi < 35) {
        category = 'Obesidad grado I';
      } else if (bmi >= 35 && bmi < 40) {
        category = 'Obesidad grado II';
      } else {
        category = 'Obesidad grado III';
      }

      return { bmi: Math.round(bmi * 10) / 10, category };
    } catch (error) {
      console.error('Error calculating BMI:', error);
      return { bmi: 0, category: 'Error' };
    }
  }

  private calculateLastWeightChange(): number {
    const weightHistory = this.weightHistory();
    if (weightHistory.length < 2) return 0;

    const current = weightHistory[weightHistory.length - 1].weight;
    const previous = weightHistory[weightHistory.length - 2].weight;

    return current - previous;
  }

  // Datos para gráficos
  getWeightChartData() {
    const history = this.weightHistory();
    const last30Days = history.slice(-30);

    return {
      labels: last30Days.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Peso (kg)',
        data: last30Days.map(entry => entry.weight),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  getWorkoutConsistencyData() {
    const history = this.workoutHistory();
    const last30Days = history.slice(-30);

    return {
      labels: last30Days.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Entrenamientos Completados',
        data: last30Days.map(entry => entry.completed ? 1 : 0),
        backgroundColor: last30Days.map(entry =>
          entry.completed ? '#16a34a' : '#e5e7eb'
        ),
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    };
  }

  // Método para guardar progreso en la base de datos del usuario
  async saveProgressToDatabase(): Promise<void> {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    try {
      const progressStats = await this.getProgressStats();

      // Actualizar el perfil del usuario con datos de progreso
      await this.databaseService.updateUserProfile(userId, {
        // Aquí podríamos agregar campos específicos para progreso si se añaden a la interfaz UserProfile
        // Por ahora, los datos ya se guardan en localStorage específico del usuario
      });

      console.log('Progress data saved to database for user:', userId);
    } catch (error) {
      console.error('Error saving progress to database:', error);
    }
  }
}
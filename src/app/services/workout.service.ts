import { Injectable, signal } from '@angular/core';

export interface Workout {
  id: number;
  title: string;
  duration: string;
  level: string;
  type: string;
  description: string;
  exercises: number;
  image: string;
}

export interface ActiveWorkout {
  workout: Workout;
  startTime: Date;
  duration: number; // in minutes
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly ACTIVE_WORKOUT_KEY = 'active-workout';

  // Signal para el entrenamiento activo
  private activeWorkoutSignal = signal<ActiveWorkout | null>(null);

  constructor() {
    this.loadActiveWorkout();
  }

  // Obtener el entrenamiento activo
  getActiveWorkout() {
    return this.activeWorkoutSignal();
  }

  // Iniciar un entrenamiento
  startWorkout(workout: Workout): void {
    const duration = this.parseDuration(workout.duration);
    const activeWorkout: ActiveWorkout = {
      workout,
      startTime: new Date(),
      duration,
      isActive: true
    };

    this.activeWorkoutSignal.set(activeWorkout);
    this.saveActiveWorkout(activeWorkout);
  }

  // Detener el entrenamiento activo
  stopWorkout(): void {
    this.activeWorkoutSignal.set(null);
    localStorage.removeItem(this.ACTIVE_WORKOUT_KEY);
  }

  // Obtener el progreso del entrenamiento (0-1)
  getWorkoutProgress(): number {
    const active = this.activeWorkoutSignal();
    if (!active || !active.isActive) return 0;

    const elapsed = (Date.now() - active.startTime.getTime()) / 1000 / 60; // minutos
    const progress = Math.min(elapsed / active.duration, 1);

    // Si se completó, detener automáticamente
    if (progress >= 1) {
      this.stopWorkout();
      return 1;
    }

    return progress;
  }

  // Obtener tiempo restante en minutos
  getTimeRemaining(): number {
    const active = this.activeWorkoutSignal();
    if (!active || !active.isActive) return 0;

    const elapsed = (Date.now() - active.startTime.getTime()) / 1000 / 60; // minutos
    return Math.max(active.duration - elapsed, 0);
  }

  // Verificar si hay un entrenamiento activo
  hasActiveWorkout(): boolean {
    return this.activeWorkoutSignal() !== null;
  }

  // Parsear duración del string (ej: "30 min" -> 30)
  private parseDuration(durationStr: string): number {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 30; // default 30 min
  }

  // Guardar en localStorage
  private saveActiveWorkout(workout: ActiveWorkout): void {
    try {
      localStorage.setItem(this.ACTIVE_WORKOUT_KEY, JSON.stringify({
        ...workout,
        startTime: workout.startTime.toISOString()
      }));
    } catch (error) {
      console.error('Error saving active workout:', error);
    }
  }

  // Cargar desde localStorage
  private loadActiveWorkout(): void {
    try {
      const saved = localStorage.getItem(this.ACTIVE_WORKOUT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const activeWorkout: ActiveWorkout = {
          ...parsed,
          startTime: new Date(parsed.startTime)
        };

        // Verificar si no ha expirado
        const elapsed = (Date.now() - activeWorkout.startTime.getTime()) / 1000 / 60;
        if (elapsed < activeWorkout.duration) {
          this.activeWorkoutSignal.set(activeWorkout);
        } else {
          // Si expiró, limpiar
          this.stopWorkout();
        }
      }
    } catch (error) {
      console.error('Error loading active workout:', error);
      this.stopWorkout();
    }
  }

  // Obtener datos de ejemplo de entrenamientos
  getWorkouts(): Workout[] {
    return [
      {
        id: 1,
        title: 'HIIT Quema Grasa',
        duration: '30 min',
        level: 'Intermedio',
        type: 'HIIT',
        description: 'Entrenamiento de alta intensidad para quemar calorías rápidamente',
        exercises: 12,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center'
      },
      {
        id: 2,
        title: 'Yoga para Principiantes',
        duration: '20 min',
        level: 'Principiante',
        type: 'Yoga',
        description: 'Secuencias suaves para mejorar flexibilidad y reducir estrés',
        exercises: 8,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop&crop=center'
      },
      {
        id: 3,
        title: 'Fuerza Tren Superior',
        duration: '45 min',
        level: 'Avanzado',
        type: 'Fuerza',
        description: 'Desarrolla músculos de pecho, espalda, hombros y brazos',
        exercises: 15,
        image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=200&fit=crop&crop=center'
      },
      {
        id: 4,
        title: 'Cardio Principiante',
        duration: '25 min',
        level: 'Principiante',
        type: 'Cardio',
        description: 'Mejora tu resistencia cardiovascular paso a paso',
        exercises: 10,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center'
      },
    ];
  }
}
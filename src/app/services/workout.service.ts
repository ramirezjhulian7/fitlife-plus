import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ProgressService } from './progress.service';

export interface Workout {
  id: number;
  title: string;
  duration: string;
  level: string;
  type: string;
  description: string;
  exercises: number;
  image: string;
  videoUrl?: string;
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

  constructor(private authService: AuthService, private progressService: ProgressService) {
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

  // Completar un entrenamiento y registrarlo en el progreso
  private completeWorkout(activeWorkout: ActiveWorkout): void {
    // Registrar el entrenamiento como completado en el ProgressService
    this.progressService.addWorkoutEntry(true, activeWorkout.workout.type, activeWorkout.duration);

    // Detener el entrenamiento
    this.stopWorkout();

    console.log(`Workout "${activeWorkout.workout.title}" completed successfully!`);
  }

  // Marcar manualmente un entrenamiento como completado
  completeActiveWorkout(): void {
    const active = this.activeWorkoutSignal();
    if (active && active.isActive) {
      this.completeWorkout(active);
    }
  }

  // Detener el entrenamiento activo (sin completarlo)
  stopWorkout(): void {
    this.activeWorkoutSignal.set(null);
    const userId = this.authService.currentUser?.id;
    if (userId) {
      localStorage.removeItem(`${this.ACTIVE_WORKOUT_KEY}_${userId}`);
    }
  }

  // Obtener el progreso del entrenamiento (0-1)
  getWorkoutProgress(): number {
    const active = this.activeWorkoutSignal();
    if (!active || !active.isActive) return 0;

    const elapsed = (Date.now() - active.startTime.getTime()) / 1000 / 60; // minutos
    const progress = Math.min(elapsed / active.duration, 1);

    // Si se completó, registrar como completado y detener automáticamente
    if (progress >= 1 && active.isActive) {
      this.completeWorkout(active);
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
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    try {
      localStorage.setItem(`${this.ACTIVE_WORKOUT_KEY}_${userId}`, JSON.stringify({
        ...workout,
        startTime: workout.startTime.toISOString()
      }));
    } catch (error) {
      console.error('Error saving active workout:', error);
    }
  }

  // Cargar desde localStorage
  private loadActiveWorkout(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    try {
      const saved = localStorage.getItem(`${this.ACTIVE_WORKOUT_KEY}_${userId}`);
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
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center',
        videoUrl: 'https://www.youtube.com/embed/bwJY3uYbm78'
      },
      {
        id: 2,
        title: 'Yoga para Principiantes',
        duration: '20 min',
        level: 'Principiante',
        type: 'Yoga',
        description: 'Secuencias suaves para mejorar flexibilidad y reducir estrés',
        exercises: 8,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop&crop=center',
        videoUrl: 'https://www.youtube.com/embed/1J8CRcoFekE'
      },
      {
        id: 3,
        title: 'Fuerza Tren Superior',
        duration: '45 min',
        level: 'Avanzado',
        type: 'Fuerza',
        description: 'Desarrolla músculos de pecho, espalda, hombros y brazos',
        exercises: 15,
        image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=200&fit=crop&crop=center',
        videoUrl: 'https://www.youtube.com/embed/vfmTvsLCy7Q'
      },
      {
        id: 4,
        title: 'Cardio Principiante',
        duration: '25 min',
        level: 'Principiante',
        type: 'Cardio',
        description: 'Mejora tu resistencia cardiovascular paso a paso',
        exercises: 10,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center',
        videoUrl: 'https://www.youtube.com/embed/Gx908-caSyI'
      },
    ];
  }
}
import { Component, inject, signal, ViewChild } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { add, cafe, sunny, moon, nutrition, water, trash } from 'ionicons/icons';
import { NutritionService, MealItem } from '../../services/nutrition.service';
import { AddFoodModalComponent } from '../../components/add-food-modal/add-food-modal.component';

interface Meal {
  id: number;
  icon: string;
  name: string;
  time: string;
  items: MealItem[];
  pending?: boolean;
}

@Component({
  selector: 'app-tab3',
  template: `
    <ion-content [fullscreen]="false" class="nutrition-bg">
      <div class="nutrition-container">
        <!-- Header con gradiente -->
        <div class="header-gradient">
          <h2 class="header-title">Nutrición</h2>

          <ion-card class="calories-card">
            <ion-card-content>
              <div class="calories-header">
                <p class="calories-label">Calorías de hoy</p>
                <p class="calories-value">
                  <span class="calories-number">{{ getDailyTotals().calories.toFixed(0) }}</span> / {{ targetCalories }}
                </p>
              </div>
              <ion-progress-bar
                [value]="getCaloriesProgress()"
                class="calories-progress">
              </ion-progress-bar>
              <div class="macros-grid">
                <div class="macro-item">
                  <p class="macro-label">Proteínas</p>
                  <p class="macro-value">{{ getDailyTotals().protein.toFixed(1) }}g</p>
                </div>
                <div class="macro-item">
                  <p class="macro-label">Carbos</p>
                  <p class="macro-value">{{ getDailyTotals().carbs.toFixed(1) }}g</p>
                </div>
                <div class="macro-item">
                  <p class="macro-label">Grasas</p>
                  <p class="macro-value">{{ getDailyTotals().fat.toFixed(1) }}g</p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Contenido principal -->
        <div class="content-grid">
          <!-- Columna izquierda - Registro de comidas -->
          <div class="meals-column">
            <div class="meals-header">
              <h3 class="meals-title">Registro de comidas</h3>
              <ion-button fill="solid" color="success" size="small" class="add-button">
                <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                Añadir
              </ion-button>
            </div>

            <div class="meals-list">
              <ion-card *ngFor="let meal of meals; let i = index" class="meal-card">
                <ion-card-content>
                  <div class="meal-content">
                    <div class="meal-icon">
                      <ion-icon [icon]="getMealIcon(meal.icon)" size="large"></ion-icon>
                    </div>
                    <div class="meal-info">
                      <div class="meal-header">
                        <p class="meal-name">{{ meal.name }}</p>
                        <span class="meal-time">{{ meal.time }}</span>
                      </div>
                      <ng-container *ngIf="meal.items.length === 0 && meal.pending; else mealItems">
                        <ion-button
                          fill="outline"
                          color="success"
                          size="small"
                          class="add-food-button"
                          (click)="openAddFoodModal(meal.id)">
                          <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                          Añadir alimentos
                        </ion-button>
                      </ng-container>
                      <ng-template #mealItems>
                        <div class="meal-items-list">
                          <div *ngFor="let item of meal.items; let itemIndex = index" class="meal-item-row">
                            <div class="meal-item-info">
                              <span class="meal-item-name">{{ item.food.name }}</span>
                              <span class="meal-item-quantity">{{ item.quantity }}g</span>
                            </div>
                            <div class="meal-item-actions">
                              <span class="meal-item-calories">{{ item.calculatedCalories.toFixed(0) }} kcal</span>
                              <ion-button
                                fill="clear"
                                color="danger"
                                size="small"
                                (click)="removeFoodFromMeal(meal.id, itemIndex)">
                                <ion-icon [icon]="trashIcon"></ion-icon>
                              </ion-button>
                            </div>
                          </div>
                        </div>
                        <div class="meal-totals">
                          <p class="meal-calories">{{ getMealTotals(meal.id).calories.toFixed(0) }} kcal</p>
                          <ion-button
                            fill="outline"
                            color="success"
                            size="small"
                            (click)="openAddFoodModal(meal.id)">
                            <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                            Añadir más
                          </ion-button>
                        </div>
                      </ng-template>
                    </div>
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </div>

          <!-- Columna derecha - Hidratación y recetas -->
          <div class="right-column">
            <!-- Hidratación -->
            <ion-card class="hydration-card">
              <ion-card-content>
                <div class="hydration-header">
                  <div class="hydration-icon">
                    <ion-icon [icon]="waterIcon" size="large"></ion-icon>
                  </div>
                  <div class="hydration-info">
                    <h4 class="hydration-title">Hidratación</h4>
                    <p class="hydration-amount">
                      {{ waterGlasses() * 250 }}ml / 2000ml
                    </p>
                  </div>
                </div>
                <div class="water-glasses">
                  <button
                    *ngFor="let glass of waterGlassesArray; let i = index"
                    class="water-glass"
                    [class.filled]="i < waterGlasses()"
                    (click)="setWaterGlasses(i + 1)">
                  </button>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Recetas recomendadas -->
            <ion-card class="recipes-card">
              <ion-card-header>
                <ion-card-title class="recipes-title">Recetas recomendadas</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="recipes-list">
                  <div *ngFor="let recipe of recipes" class="recipe-item">
                    <div class="recipe-image">
                      <ion-icon [icon]="nutritionIcon"></ion-icon>
                    </div>
                    <div class="recipe-info">
                      <p class="recipe-name">{{ recipe.name }}</p>
                      <p class="recipe-details">{{ recipe.details }}</p>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>

      <!-- Modal para añadir alimentos -->
      <app-add-food-modal
        [isOpen]="showAddFoodModal"
        [mealType]="currentMealType"
        (foodAdded)="onFoodAdded()"
        (closeModal)="closeAddFoodModal()">
      </app-add-food-modal>
    </ion-content>
  `,
  styles: [`
    .nutrition-bg {
      --background: #f8fafc;
    }

    .nutrition-container {
      padding: 24px 24px 100px 24px; /* Extra padding bottom for tabs */
    }

    .header-gradient {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 24px;
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 24px 0;
    }

    .calories-card {
      --background: rgba(255, 255, 255, 0.1);
      --color: white;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      margin: 0;
    }

    .calories-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .calories-label {
      font-size: 16px;
      margin: 0;
    }

    .calories-value {
      font-size: 14px;
      margin: 0;
    }

    .calories-number {
      font-size: 24px;
      font-weight: 700;
    }

    .calories-progress {
      --background: rgba(255, 255, 255, 0.2);
      margin-bottom: 16px;
    }

    .macros-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .macro-item {
      text-align: center;
    }

    .macro-label {
      font-size: 12px;
      opacity: 0.8;
      margin: 0 0 4px 0;
    }

    .macro-value {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .meals-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .meals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meals-title {
      color: #16a34a;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .add-button {
      --border-radius: 8px;
    }

    .meals-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meal-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 0;
    }

    .meal-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .meal-icon {
      width: 48px;
      height: 48px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .meal-icon ion-icon {
      color: #16a34a;
    }

    .meal-info {
      flex: 1;
    }

    .meal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .meal-name {
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      margin: 0;
    }

    .meal-time {
      font-size: 14px;
      color: #6b7280;
    }

    .meal-items-list {
      margin-bottom: 12px;
    }

    .meal-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .meal-item-row:last-child {
      border-bottom: none;
    }

    .meal-item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meal-item-name {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .meal-item-quantity {
      font-size: 12px;
      color: #6b7280;
    }

    .meal-item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meal-item-calories {
      font-size: 12px;
      color: #16a34a;
      font-weight: 500;
    }

    .meal-totals {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .meal-calories {
      font-size: 14px;
      color: #16a34a;
      font-weight: 500;
      margin: 0;
    }

    .add-food-button {
      --border-radius: 6px;
      margin-top: 8px;
    }

    .right-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hydration-card {
      --background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
    }

    .hydration-header {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }

    .hydration-icon {
      width: 48px;
      height: 48px;
      background: #2563eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .hydration-icon ion-icon {
      color: white;
    }

    .hydration-info {
      flex: 1;
    }

    .hydration-title {
      color: #2563eb;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .hydration-amount {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .water-glasses {
      display: flex;
      gap: 8px;
    }

    .water-glass {
      flex: 1;
      height: 48px;
      border-radius: 8px;
      border: none;
      background: #e5e7eb;
      transition: background-color 0.2s ease;
      cursor: pointer;
    }

    .water-glass.filled {
      background: #2563eb;
    }

    .water-glass:hover {
      opacity: 0.8;
    }

    .recipes-card {
      --background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .recipes-title {
      color: #16a34a;
      font-size: 18px;
    }

    .recipes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recipe-item {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .recipe-image {
      width: 64px;
      height: 64px;
      background: #e5e7eb;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .recipe-image ion-icon {
      color: #9ca3af;
    }

    .recipe-info {
      flex: 1;
    }

    .recipe-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .recipe-details {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }

    /* Desktop responsive */
    @media (min-width: 768px) {
      .nutrition-container {
        padding: 24px;
      }

      .content-grid {
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
    }
  `],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonProgressBar, CommonModule, AddFoodModalComponent]
})
export class Tab3Page {
  // Servicios
  private nutritionService = inject(NutritionService);

  // Estado del modal
  showAddFoodModal = false;
  currentMealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' = 'breakfast';

  // Estado
  waterGlasses = signal(6);
  targetCalories = 2000;

  // Iconos
  addIcon = add;
  cafeIcon = cafe;
  sunnyIcon = sunny;
  moonIcon = moon;
  nutritionIcon = nutrition;
  waterIcon = water;
  trashIcon = trash;

  // Array para los vasos de agua (8 vasos)
  waterGlassesArray = Array(8).fill(0);

  // Datos de comidas
  meals: Meal[] = [
    {
      id: 1,
      icon: 'cafe',
      name: "Desayuno",
      time: "7:00 AM",
      items: [],
      pending: true,
    },
    {
      id: 2,
      icon: 'sunny',
      name: "Almuerzo",
      time: "1:00 PM",
      items: [],
      pending: true,
    },
    {
      id: 3,
      icon: 'nutrition',
      name: "Snack",
      time: "4:00 PM",
      items: [],
      pending: true,
    },
    {
      id: 4,
      icon: 'moon',
      name: "Cena",
      time: "8:00 PM",
      items: [],
      pending: true,
    },
  ];

  // Recetas recomendadas
  recipes = [
    { name: "Bowl proteico de quinoa", details: "30 min • 420 kcal" },
    { name: "Wrap de pollo y vegetales", details: "25 min • 380 kcal" }
  ];

  ngOnInit() {
    this.updateMealsData();
  }

  // Actualizar datos de comidas desde el servicio
  private updateMealsData() {
    const mealsData = this.nutritionService.getMeals();
    this.meals.forEach(meal => {
      switch (meal.id) {
        case 1:
          meal.items = mealsData().breakfast;
          meal.pending = meal.items.length === 0;
          break;
        case 2:
          meal.items = mealsData().lunch;
          meal.pending = meal.items.length === 0;
          break;
        case 3:
          meal.items = mealsData().snack;
          meal.pending = meal.items.length === 0;
          break;
        case 4:
          meal.items = mealsData().dinner;
          meal.pending = meal.items.length === 0;
          break;
      }
    });
  }

  // Métodos para cálculos
  getDailyTotals() {
    return this.nutritionService.getDailyTotals();
  }

  getCaloriesProgress(): number {
    return this.getDailyTotals().calories / this.targetCalories;
  }

  getMealTotals(mealId: number) {
    const mealType = this.getMealTypeFromId(mealId);
    return this.nutritionService.getMealTotals(mealType);
  }

  private getMealTypeFromId(mealId: number): 'breakfast' | 'lunch' | 'snack' | 'dinner' {
    switch (mealId) {
      case 1: return 'breakfast';
      case 2: return 'lunch';
      case 3: return 'snack';
      case 4: return 'dinner';
      default: return 'breakfast';
    }
  }

  // Métodos para iconos
  getMealIcon(iconName: string): string {
    switch (iconName) {
      case 'cafe': return this.cafeIcon;
      case 'sunny': return this.sunnyIcon;
      case 'moon': return this.moonIcon;
      case 'nutrition': return this.nutritionIcon;
      default: return this.nutritionIcon;
    }
  }

  // Métodos para el modal
  openAddFoodModal(mealId: number) {
    this.currentMealType = this.getMealTypeFromId(mealId);
    this.showAddFoodModal = true;
    console.log('Opening modal for meal:', this.currentMealType);
  }

  closeAddFoodModal() {
    this.showAddFoodModal = false;
  }

  onFoodAdded() {
    console.log('Food added, updating meals data');
    this.updateMealsData();
    this.closeAddFoodModal();
  }

  // Métodos para gestión de alimentos
  removeFoodFromMeal(mealId: number, itemIndex: number) {
    const mealType = this.getMealTypeFromId(mealId);
    this.nutritionService.removeFoodFromMeal(mealType, itemIndex);
    this.updateMealsData();
  }

  // Método para vasos de agua
  setWaterGlasses(glasses: number) {
    this.waterGlasses.set(glasses);
  }
}
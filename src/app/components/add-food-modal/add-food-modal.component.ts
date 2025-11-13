import { Component, inject, signal, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonChip, IonInput, IonModal, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { close, add, remove } from 'ionicons/icons';
import { NutritionService, Food, MealItem } from '../../services/nutrition.service';

@Component({
    selector: 'app-add-food-modal',
    template: `
    <ion-modal
      [isOpen]="isOpen"
      (willDismiss)="close()"
      [breakpoints]="[0, 0.5, 1]"
      [initialBreakpoint]="1"
      [keepContentsMounted]="true"
    >
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Añadir alimento</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="close()">
                <ion-icon [icon]="closeIcon"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content [fullscreen]="false" class="modal-content-wrapper">
          <!-- Debug info -->
          <div style="padding: 10px; background: #f0f0f0; margin: 10px; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px;">
              Alimentos: {{ filteredFoods().length }} | Categorías: {{ categories.length }}
            </p>
          </div>

          <!-- Barra de búsqueda -->
          <ion-searchbar
            [(ngModel)]="searchQuery"
            (ionInput)="onSearchChange($event)"
            placeholder="Buscar alimentos..."
            class="search-bar">
          </ion-searchbar>

          <!-- Categorías -->
          <div class="categories">
            <ion-chip
              *ngFor="let category of categories"
              [color]="selectedCategory() === category ? 'primary' : 'medium'"
              (click)="selectCategory(category)"
              class="category-chip">
              <ion-label>{{ category }}</ion-label>
            </ion-chip>
          </div>

          <!-- Lista de alimentos -->
          <div class="foods-list-wrapper">
            <ion-list *ngIf="filteredFoods().length > 0; else noFoods" class="foods-list">
              <ion-item
                *ngFor="let food of filteredFoods()"
                button
                (click)="selectFood(food)"
                class="food-item"
                detail="false">
                <ion-label>
                  <h3 style="margin: 0 0 4px 0;">{{ food.name }}</h3>
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">
                    {{ food.protein }}g prot • {{ food.carbs }}g carb • {{ food.fat }}g gra • {{ food.calories }} kcal
                  </p>
                </ion-label>
              </ion-item>
            </ion-list>

            <ng-template #noFoods>
              <div style="padding: 20px; text-align: center; color: #6b7280;">
                <p>No hay alimentos disponibles</p>
              </div>
            </ng-template>
          </div>

          <!-- Alimento seleccionado -->
          <div *ngIf="selectedFood()" class="selected-food">
            <ion-card>
              <ion-card-content>
                <h3 class="selected-food-title">{{ selectedFood()!.name }}</h3>
                <p class="selected-food-category">{{ selectedFood()!.category }}</p>

                <div class="quantity-input">
                  <ion-label>Cantidad (gramos):</ion-label>
                  <ion-input
                    type="number"
                    [(ngModel)]="quantity"
                    min="1"
                    max="1000"
                    placeholder="100">
                  </ion-input>
                </div>

                <div class="nutrients-preview">
                  <div class="nutrient-item">
                    <span class="nutrient-label">Proteína:</span>
                    <span class="nutrient-value">{{ getCalculatedNutrient('protein') }}g</span>
                  </div>
                  <div class="nutrient-item">
                    <span class="nutrient-label">Carbohidratos:</span>
                    <span class="nutrient-value">{{ getCalculatedNutrient('carbs') }}g</span>
                  </div>
                  <div class="nutrient-item">
                    <span class="nutrient-label">Grasas:</span>
                    <span class="nutrient-value">{{ getCalculatedNutrient('fat') }}g</span>
                  </div>
                  <div class="nutrient-item">
                    <span class="nutrient-label">Calorías:</span>
                    <span class="nutrient-value">{{ getCalculatedNutrient('calories') }}</span>
                  </div>
                </div>

                <ion-button
                  expand="block"
                  color="success"
                  (click)="addFoodToMeal()"
                  class="add-button">
                  <ion-icon slot="start" [icon]="addIcon"></ion-icon>
                  Añadir a {{ getMealName(mealType) }}
                </ion-button>
              </ion-card-content>
            </ion-card>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>

  `,
    styles: [`
    .modal-content-wrapper {
      --background: #ffffff;
      --padding-top: 0;
      --padding-bottom: 80px;
      --padding-start: 0;
      --padding-end: 0;
    }

    .search-bar {
      --background: #f8fafc;
      --border-radius: 12px;
      margin: 12px;
    }

    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0 12px 12px 12px;
    }

    .category-chip {
      --background: #f8fafc;
      --color: #6b7280;
      cursor: pointer;
    }

    .foods-list-wrapper {
      padding: 0 12px;
    }

    .foods-list {
      --background: transparent;
      --ion-item-background: transparent;
      padding: 0;
    }

    .food-item {
      --background: #f8fafc;
      --border-radius: 8px;
      --padding-start: 12px;
      --padding-end: 12px;
      --inner-border-bottom: 0;
      margin-bottom: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .food-item:active,
    .food-item:hover {
      --background: #e5e7eb;
    }

    .food-item h3 {
      margin: 8px 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }

    .selected-food {
      margin: 12px;
      margin-bottom: 80px;
    }

    .selected-food ion-card {
      margin: 0;
    }

    .selected-food-title {
      color: #16a34a;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .selected-food-category {
      color: #6b7280;
      font-size: 14px;
      margin: 0 0 16px 0;
    }

    .quantity-input {
      margin-bottom: 16px;
    }

    .quantity-input ion-label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: #374151;
    }

    .quantity-input ion-input {
      --background: #f8fafc;
      --border-radius: 8px;
      --padding-start: 12px;
      --padding-end: 12px;
    }

    .nutrients-preview {
      background: #f8fafc;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }

    .nutrient-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .nutrient-item:last-child {
      margin-bottom: 0;
    }

    .nutrient-label {
      font-size: 14px;
      color: #6b7280;
    }

    .nutrient-value {
      font-size: 14px;
      font-weight: 600;
      color: #16a34a;
    }

    .add-button {
      --border-radius: 8px;
    }
  `],
    standalone: true,
    imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonSearchbar, IonList, IonItem, IonLabel, IonChip, IonInput, IonModal, IonCard, IonCardContent, CommonModule, FormsModule]
})
export class AddFoodModalComponent {
    // Inputs
    @Input() set isOpen(value: boolean) {
        console.log('isOpen set to:', value);
        this._isOpen = value;
        if (value) {
            this.resetState();
        }
    }
    get isOpen(): boolean {
        return this._isOpen;
    }
    private _isOpen = false;

    @Input() mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' = 'breakfast';

    // Outputs
    @Output() foodAdded = new EventEmitter<void>();
    @Output() closeModal = new EventEmitter<void>();

    // Servicios
    private nutritionService = inject(NutritionService);

    // Estado
    searchQuery = '';
    selectedCategory = signal<string>('');
    selectedFood = signal<Food | null>(null);
    quantity = 100;

    // Iconos
    closeIcon = close;
    addIcon = add;

    // Datos
    allFoods = this.nutritionService.getFoods();
    categories = this.nutritionService.getCategories();

    constructor() {
        console.log('AddFoodModalComponent constructor - allFoods length:', this.allFoods.length);
        console.log('Categories:', this.categories);
    }

    // Computed
    filteredFoods = signal<Food[]>(this.allFoods);

    // Métodos
    open(mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner') {
        console.log('Opening modal for meal:', mealType);
        this.mealType = mealType;
        this._isOpen = true;
        this.resetState();
    }

    close() {
        this._isOpen = false;
        this.closeModal.emit();
    }

    private resetState() {
        console.log('Resetting state, allFoods length:', this.allFoods.length);
        this.searchQuery = '';
        this.selectedCategory.set('');
        this.selectedFood.set(null);
        this.quantity = 100;
        // Crear una copia del array para forzar la detección de cambios
        const foodsToSet = [...this.allFoods];
        console.log('Setting filteredFoods to:', foodsToSet.length, 'foods');
        this.filteredFoods.set(foodsToSet);
        console.log('filteredFoods after set:', this.filteredFoods().length, 'foods');
        console.log('Modal is now open, isOpen:', this.isOpen);
    }

    onSearchChange(event: any) {
        this.searchQuery = event.detail.value || '';
        this.filterFoods();
    }

    selectCategory(category: string) {
        if (this.selectedCategory() === category) {
            this.selectedCategory.set('');
        } else {
            this.selectedCategory.set(category);
        }
        this.filterFoods();
    }

    private filterFoods() {
        let filtered = this.allFoods;

        // Filtrar por búsqueda
        if (this.searchQuery.trim()) {
            filtered = this.nutritionService.searchFoods(this.searchQuery);
        }

        // Filtrar por categoría
        if (this.selectedCategory()) {
            filtered = filtered.filter(food => food.category === this.selectedCategory());
        }

        this.filteredFoods.set(filtered);
    }

    selectFood(food: Food) {
        console.log('Food selected:', food.name);
        this.selectedFood.set(food);
    }

    getCalculatedNutrient(nutrient: 'protein' | 'carbs' | 'fat' | 'calories'): number {
        if (!this.selectedFood()) return 0;

        const food = this.selectedFood()!;
        const factor = this.quantity / 100;

        switch (nutrient) {
            case 'protein': return Math.round(food.protein * factor * 10) / 10;
            case 'carbs': return Math.round(food.carbs * factor * 10) / 10;
            case 'fat': return Math.round(food.fat * factor * 10) / 10;
            case 'calories': return Math.round(food.calories * factor);
            default: return 0;
        }
    }

    addFoodToMeal() {
        if (!this.selectedFood()) return;

        console.log('Adding food to meal:', this.selectedFood()!.name, 'quantity:', this.quantity, 'mealType:', this.mealType);
        this.nutritionService.addFoodToMeal(this.mealType, this.selectedFood()!, this.quantity);
        this.foodAdded.emit();
        this.close();
    }

    getMealName(mealType: string): string {
        switch (mealType) {
            case 'breakfast': return 'Desayuno';
            case 'lunch': return 'Almuerzo';
            case 'snack': return 'Snack';
            case 'dinner': return 'Cena';
            default: return '';
        }
    }
}
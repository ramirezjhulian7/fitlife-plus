import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Food {
  id: number;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  category: string;
}

export interface MealItem {
  food: Food;
  quantity: number; // gramos
  calculatedProtein: number;
  calculatedCarbs: number;
  calculatedFat: number;
  calculatedCalories: number;
}

export interface RecipeIngredient {
  food: Food;
  quantity: number;
}

export interface Recipe {
  id: number;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string;
  time: string;
  image: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  // Base de datos de alimentos
  private foods: Food[] = [
    // FRUTAS
    { id: 1, name: "Manzana", protein: 0.5, carbs: 25.1, fat: 0.3, calories: 95, category: "Frutas" },
    { id: 2, name: "Plátano", protein: 1.3, carbs: 27.0, fat: 0.4, calories: 105, category: "Frutas" },
    { id: 3, name: "Naranja", protein: 1.3, carbs: 12.5, fat: 0.2, calories: 62, category: "Frutas" },
    { id: 4, name: "Pera", protein: 0.4, carbs: 15.2, fat: 0.1, calories: 57, category: "Frutas" },
    { id: 5, name: "Fresa", protein: 0.8, carbs: 7.7, fat: 0.4, calories: 32, category: "Frutas" },
    { id: 6, name: "Kiwi", protein: 1.1, carbs: 12.2, fat: 0.5, calories: 61, category: "Frutas" },
    { id: 7, name: "Piña", protein: 0.5, carbs: 13.1, fat: 0.1, calories: 50, category: "Frutas" },
    { id: 8, name: "Uva", protein: 0.6, carbs: 18.1, fat: 0.2, calories: 69, category: "Frutas" },
    { id: 9, name: "Mango", protein: 0.8, carbs: 15.0, fat: 0.4, calories: 60, category: "Frutas" },
    { id: 10, name: "Melón", protein: 0.8, carbs: 8.2, fat: 0.2, calories: 34, category: "Frutas" },

    // VERDURAS
    { id: 11, name: "Lechuga", protein: 1.4, carbs: 2.9, fat: 0.2, calories: 15, category: "Verduras" },
    { id: 12, name: "Tomate", protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18, category: "Verduras" },
    { id: 13, name: "Zanahoria", protein: 0.9, carbs: 9.6, fat: 0.2, calories: 41, category: "Verduras" },
    { id: 14, name: "Cebolla", protein: 1.1, carbs: 9.3, fat: 0.1, calories: 40, category: "Verduras" },
    { id: 15, name: "Pimiento", protein: 0.9, carbs: 4.6, fat: 0.3, calories: 24, category: "Verduras" },
    { id: 16, name: "Brócoli", protein: 2.8, carbs: 7.2, fat: 0.4, calories: 34, category: "Verduras" },
    { id: 17, name: "Espinaca", protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23, category: "Verduras" },
    { id: 18, name: "Calabaza", protein: 1.0, carbs: 6.6, fat: 0.1, calories: 26, category: "Verduras" },
    { id: 19, name: "Berenjena", protein: 1.0, carbs: 5.9, fat: 0.2, calories: 25, category: "Verduras" },
    { id: 20, name: "Pepino", protein: 0.7, carbs: 3.6, fat: 0.1, calories: 16, category: "Verduras" },

    // CEREALES Y GRANOS
    { id: 21, name: "Arroz blanco cocido", protein: 2.7, carbs: 25.0, fat: 0.3, calories: 130, category: "Cereales" },
    { id: 22, name: "Arroz integral cocido", protein: 2.6, carbs: 23.0, fat: 0.9, calories: 111, category: "Cereales" },
    { id: 23, name: "Quinoa cocida", protein: 4.4, carbs: 21.3, fat: 1.9, calories: 120, category: "Cereales" },
    { id: 24, name: "Avena cocida", protein: 2.5, carbs: 11.7, fat: 1.1, calories: 68, category: "Cereales" },
    { id: 25, name: "Pan integral", protein: 9.0, carbs: 41.0, fat: 3.5, calories: 247, category: "Cereales" },
    { id: 26, name: "Pasta cocida", protein: 5.8, carbs: 30.9, fat: 0.9, calories: 157, category: "Cereales" },
    { id: 27, name: "Couscous cocido", protein: 3.8, carbs: 23.2, fat: 0.2, calories: 112, category: "Cereales" },
    { id: 28, name: "Maíz dulce", protein: 3.3, carbs: 19.0, fat: 1.2, calories: 86, category: "Cereales" },
    { id: 29, name: "Cebada cocida", protein: 2.3, carbs: 22.4, fat: 0.4, calories: 123, category: "Cereales" },
    { id: 30, name: "Trigo sarraceno cocido", protein: 3.4, carbs: 20.0, fat: 0.6, calories: 92, category: "Cereales" },

    // PROTEÍNAS ANIMALES
    { id: 31, name: "Pollo a la plancha (pechuga)", protein: 31.0, carbs: 0.0, fat: 3.6, calories: 165, category: "Proteínas" },
    { id: 32, name: "Pavo (pechuga)", protein: 30.0, carbs: 0.0, fat: 1.0, calories: 135, category: "Proteínas" },
    { id: 33, name: "Carne de res magra", protein: 26.0, carbs: 0.0, fat: 7.0, calories: 179, category: "Proteínas" },
    { id: 34, name: "Pescado (salmón)", protein: 25.4, carbs: 0.0, fat: 13.4, calories: 208, category: "Proteínas" },
    { id: 35, name: "Atún en agua", protein: 29.0, carbs: 0.0, fat: 1.0, calories: 128, category: "Proteínas" },
    { id: 36, name: "Huevos", protein: 6.3, carbs: 0.6, fat: 5.0, calories: 70, category: "Proteínas" },
    { id: 37, name: "Queso cottage bajo en grasa", protein: 12.4, carbs: 3.4, fat: 1.0, calories: 72, category: "Proteínas" },
    { id: 38, name: "Jamón de pavo", protein: 19.0, carbs: 1.0, fat: 2.0, calories: 102, category: "Proteínas" },
    { id: 39, name: "Pechuga de pollo con piel", protein: 29.8, carbs: 0.0, fat: 7.4, calories: 197, category: "Proteínas" },
    { id: 40, name: "Cerdo magro", protein: 25.0, carbs: 0.0, fat: 5.0, calories: 143, category: "Proteínas" },

    // LÁCTEOS
    { id: 41, name: "Leche desnatada", protein: 3.4, carbs: 5.0, fat: 0.1, calories: 34, category: "Lácteos" },
    { id: 42, name: "Yogur natural bajo en grasa", protein: 3.8, carbs: 4.7, fat: 0.4, calories: 43, category: "Lácteos" },
    { id: 43, name: "Queso cheddar", protein: 7.0, carbs: 0.4, fat: 9.0, calories: 113, category: "Lácteos" },
    { id: 44, name: "Queso mozzarella", protein: 9.0, carbs: 1.0, fat: 6.0, calories: 89, category: "Lácteos" },
    { id: 45, name: "Requesón", protein: 11.0, carbs: 3.4, fat: 4.3, calories: 98, category: "Lácteos" },
    { id: 46, name: "Leche entera", protein: 3.3, carbs: 4.8, fat: 3.3, calories: 61, category: "Lácteos" },
    { id: 47, name: "Yogur griego", protein: 10.0, carbs: 3.6, fat: 0.4, calories: 59, category: "Lácteos" },
    { id: 48, name: "Queso parmesano", protein: 35.8, carbs: 3.2, fat: 25.0, calories: 392, category: "Lácteos" },
    { id: 49, name: "Leche de almendras", protein: 0.4, carbs: 1.0, fat: 1.1, calories: 15, category: "Lácteos" },
    { id: 50, name: "Queso feta", protein: 4.1, carbs: 1.2, fat: 4.2, calories: 60, category: "Lácteos" },

    // LEGUMBRES
    { id: 51, name: "Lentejas cocidas", protein: 9.0, carbs: 20.1, fat: 0.4, calories: 116, category: "Legumbres" },
    { id: 52, name: "Garbanzos cocidos", protein: 7.6, carbs: 27.4, fat: 2.6, calories: 164, category: "Legumbres" },
    { id: 53, name: "Frijoles negros cocidos", protein: 8.9, carbs: 24.0, fat: 0.5, calories: 132, category: "Legumbres" },
    { id: 54, name: "Frijoles rojos cocidos", protein: 7.5, carbs: 20.0, fat: 0.4, calories: 127, category: "Legumbres" },
    { id: 55, name: "Guisantes cocidos", protein: 5.4, carbs: 14.5, fat: 0.4, calories: 81, category: "Legumbres" },
    { id: 56, name: "Soja cocida", protein: 16.6, carbs: 9.9, fat: 9.0, calories: 173, category: "Legumbres" },
    { id: 57, name: "Habas cocidas", protein: 7.9, carbs: 21.0, fat: 0.6, calories: 110, category: "Legumbres" },
    { id: 58, name: "Alubias blancas cocidas", protein: 7.0, carbs: 19.1, fat: 0.3, calories: 102, category: "Legumbres" },
    { id: 59, name: "Lupinos cocidos", protein: 15.6, carbs: 9.3, fat: 2.4, calories: 119, category: "Legumbres" },
    { id: 60, name: "Judías verdes cocidas", protein: 1.8, carbs: 7.0, fat: 0.2, calories: 31, category: "Legumbres" },

    // FRUTOS SECOS Y SEMILLAS
    { id: 61, name: "Almendras", protein: 21.2, carbs: 19.7, fat: 49.9, calories: 579, category: "Frutos secos" },
    { id: 62, name: "Nueces", protein: 15.2, carbs: 13.7, fat: 65.2, calories: 654, category: "Frutos secos" },
    { id: 63, name: "Avellanas", protein: 15.0, carbs: 16.7, fat: 60.8, calories: 628, category: "Frutos secos" },
    { id: 64, name: "Pistachos", protein: 20.3, carbs: 27.2, fat: 45.3, calories: 562, category: "Frutos secos" },
    { id: 65, name: "Semillas de chía", protein: 16.5, carbs: 42.1, fat: 30.7, calories: 486, category: "Frutos secos" },
    { id: 66, name: "Semillas de girasol", protein: 20.8, carbs: 20.0, fat: 51.5, calories: 584, category: "Frutos secos" },
    { id: 67, name: "Semillas de calabaza", protein: 18.6, carbs: 15.2, fat: 45.9, calories: 574, category: "Frutos secos" },
    { id: 68, name: "Cacahuetes", protein: 25.8, carbs: 16.3, fat: 49.2, calories: 567, category: "Frutos secos" },
    { id: 69, name: "Semillas de sésamo", protein: 17.7, carbs: 23.4, fat: 49.7, calories: 573, category: "Frutos secos" },
    { id: 70, name: "Anacardos", protein: 18.2, carbs: 30.2, fat: 43.8, calories: 553, category: "Frutos secos" },

    // ACEITES Y GRASAS
    { id: 71, name: "Aceite de oliva", protein: 0.0, carbs: 0.0, fat: 100.0, calories: 884, category: "Aceites" },
    { id: 72, name: "Aceite de coco", protein: 0.0, carbs: 0.0, fat: 100.0, calories: 862, category: "Aceites" },
    { id: 73, name: "Mantequilla", protein: 0.9, carbs: 0.1, fat: 81.1, calories: 717, category: "Aceites" },
    { id: 74, name: "Aguacate", protein: 2.0, carbs: 8.5, fat: 14.7, calories: 160, category: "Aceites" },
    { id: 75, name: "Mantequilla de almendras", protein: 21.2, carbs: 19.7, fat: 49.9, calories: 579, category: "Aceites" },

    // BEBIDAS
    { id: 76, name: "Agua", protein: 0.0, carbs: 0.0, fat: 0.0, calories: 0, category: "Bebidas" },
    { id: 77, name: "Café negro", protein: 0.1, carbs: 0.0, fat: 0.0, calories: 2, category: "Bebidas" },
    { id: 78, name: "Té verde", protein: 0.0, carbs: 0.3, fat: 0.0, calories: 1, category: "Bebidas" },
    { id: 79, name: "Zumo de naranja", protein: 0.7, carbs: 10.4, fat: 0.2, calories: 45, category: "Bebidas" },
    { id: 80, name: "Leche de soja", protein: 3.3, carbs: 2.9, fat: 1.8, calories: 43, category: "Bebidas" },

    // SNACKS Y DULCES
    { id: 81, name: "Chocolate negro 70%", protein: 7.8, carbs: 45.9, fat: 42.6, calories: 598, category: "Snacks" },
    { id: 82, name: "Barra de granola", protein: 7.0, carbs: 60.0, fat: 15.0, calories: 400, category: "Snacks" },
    { id: 83, name: "Yogur con frutas", protein: 3.5, carbs: 18.0, fat: 2.0, calories: 100, category: "Snacks" },
    { id: 84, name: "Galletas integrales", protein: 6.0, carbs: 65.0, fat: 12.0, calories: 400, category: "Snacks" },
    { id: 85, name: "Frutos secos mixtos", protein: 18.0, carbs: 22.0, fat: 48.0, calories: 550, category: "Snacks" },

    // Más alimentos comunes
    { id: 86, name: "Huevo duro", protein: 6.3, carbs: 0.6, fat: 5.0, calories: 70, category: "Proteínas" },
    { id: 87, name: "Tofu firme", protein: 8.1, carbs: 2.8, fat: 4.8, calories: 76, category: "Proteínas" },
    { id: 88, name: "Tempeh", protein: 19.0, carbs: 9.4, fat: 10.8, calories: 193, category: "Proteínas" },
    { id: 89, name: "Seitan", protein: 25.0, carbs: 6.0, fat: 1.0, calories: 120, category: "Proteínas" },
    { id: 90, name: "Espaguetis de calabaza", protein: 1.0, carbs: 6.6, fat: 0.1, calories: 26, category: "Verduras" },
    { id: 91, name: "Col rizada", protein: 4.3, carbs: 8.8, fat: 1.5, calories: 49, category: "Verduras" },
    { id: 92, name: "Remolacha cocida", protein: 1.7, carbs: 9.6, fat: 0.2, calories: 44, category: "Verduras" },
    { id: 93, name: "Patatas cocidas", protein: 2.0, carbs: 17.0, fat: 0.1, calories: 77, category: "Verduras" },
    { id: 94, name: "Batata cocida", protein: 1.6, carbs: 20.1, fat: 0.1, calories: 86, category: "Verduras" },
    { id: 95, name: "Miel", protein: 0.3, carbs: 82.4, fat: 0.0, calories: 304, category: "Snacks" },
    { id: 96, name: "Mermelada light", protein: 0.4, carbs: 35.0, fat: 0.1, calories: 140, category: "Snacks" },
    { id: 97, name: "Pan de centeno", protein: 8.5, carbs: 48.0, fat: 1.5, calories: 250, category: "Cereales" },
    { id: 98, name: "Tortitas de arroz", protein: 7.0, carbs: 79.0, fat: 2.0, calories: 380, category: "Snacks" },
    { id: 99, name: "Copos de maíz", protein: 6.0, carbs: 84.0, fat: 1.0, calories: 370, category: "Cereales" },
    { id: 100, name: "Sémola de trigo cocida", protein: 3.3, carbs: 20.3, fat: 0.4, calories: 98, category: "Cereales" }
  ];

  // Recetas disponibles
  private recipes: Recipe[] = [
    {
      id: 1,
      name: "Ensalada de Pollo con Quinoa",
      ingredients: [
        { food: this.foods.find(f => f.id === 31)!, quantity: 150 }, // Pollo
        { food: this.foods.find(f => f.id === 23)!, quantity: 100 }, // Quinoa
        { food: this.foods.find(f => f.id === 11)!, quantity: 50 },  // Lechuga
        { food: this.foods.find(f => f.id === 12)!, quantity: 100 }, // Tomate
        { food: this.foods.find(f => f.id === 15)!, quantity: 50 },  // Pimiento
        { food: this.foods.find(f => f.id === 71)!, quantity: 10 }   // Aceite de oliva
      ],
      instructions: "1. Cocinar la quinoa según las instrucciones del paquete. 2. Cortar el pollo en tiras y cocinarlo a la plancha. 3. Lavar y cortar las verduras. 4. Mezclar todos los ingredientes en un bol grande. 5. Aliñar con aceite de oliva y servir.",
      time: "25 min",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 2,
      name: "Bowl de Salmón con Verduras",
      ingredients: [
        { food: this.foods.find(f => f.id === 34)!, quantity: 150 }, // Salmón
        { food: this.foods.find(f => f.id === 16)!, quantity: 100 }, // Brócoli
        { food: this.foods.find(f => f.id === 13)!, quantity: 80 },  // Zanahoria
        { food: this.foods.find(f => f.id === 22)!, quantity: 100 }, // Arroz integral
        { food: this.foods.find(f => f.id === 71)!, quantity: 5 }    // Aceite de oliva
      ],
      instructions: "1. Cocinar el arroz integral. 2. Asar el salmón al horno o a la plancha. 3. Cocer al vapor el brócoli y las zanahorias. 4. Servir todo en un bol grande con un chorrito de aceite de oliva.",
      time: "30 min",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 3,
      name: "Wrap de Pavo con Verduras",
      ingredients: [
        { food: this.foods.find(f => f.id === 32)!, quantity: 100 }, // Pavo
        { food: this.foods.find(f => f.id === 25)!, quantity: 50 },  // Pan integral
        { food: this.foods.find(f => f.id === 11)!, quantity: 30 },  // Lechuga
        { food: this.foods.find(f => f.id === 12)!, quantity: 50 },  // Tomate
        { food: this.foods.find(f => f.id === 15)!, quantity: 30 },  // Pimiento
        { food: this.foods.find(f => f.id === 42)!, quantity: 50 }   // Yogur natural
      ],
      instructions: "1. Cortar el pavo en tiras finas. 2. Lavar y cortar las verduras. 3. Colocar el pan integral, añadir el pavo y las verduras. 4. Enrollar como un wrap. 5. Servir con yogur natural como salsa.",
      time: "15 min",
      image: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 4,
      name: "Tostadas de Aguacate con Huevo",
      ingredients: [
        { food: this.foods.find(f => f.id === 25)!, quantity: 60 },  // Pan integral
        { food: this.foods.find(f => f.id === 74)!, quantity: 80 },  // Aguacate
        { food: this.foods.find(f => f.id === 36)!, quantity: 50 },  // Huevos
        { food: this.foods.find(f => f.id === 12)!, quantity: 30 },  // Tomate
        { food: this.foods.find(f => f.id === 71)!, quantity: 5 }    // Aceite de oliva
      ],
      instructions: "1. Tostar el pan integral. 2. Cocer los huevos (hervidos o fritos). 3. Machacar el aguacate y untarlo en el pan. 4. Añadir el huevo cocido y rodajas de tomate. 5. Sazonar con un poco de aceite de oliva.",
      time: "20 min",
      image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 5,
      name: "Pasta Integral con Garbanzos",
      ingredients: [
        { food: this.foods.find(f => f.id === 26)!, quantity: 100 }, // Pasta cocida
        { food: this.foods.find(f => f.id === 52)!, quantity: 80 },  // Garbanzos
        { food: this.foods.find(f => f.id === 12)!, quantity: 60 },  // Tomate
        { food: this.foods.find(f => f.id === 14)!, quantity: 30 },  // Cebolla
        { food: this.foods.find(f => f.id === 71)!, quantity: 10 },  // Aceite de oliva
        { food: this.foods.find(f => f.id === 15)!, quantity: 40 }   // Pimiento
      ],
      instructions: "1. Cocinar la pasta según las instrucciones. 2. En una sartén, sofreír la cebolla y el pimiento con aceite de oliva. 3. Añadir los garbanzos y el tomate picado. 4. Mezclar con la pasta cocida. 5. Cocinar 5 minutos más y servir.",
      time: "25 min",
      image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 6,
      name: "Batido Proteico de Plátano",
      ingredients: [
        { food: this.foods.find(f => f.id === 2)!, quantity: 100 },  // Plátano
        { food: this.foods.find(f => f.id === 41)!, quantity: 200 }, // Leche desnatada
        { food: this.foods.find(f => f.id === 47)!, quantity: 50 },  // Yogur griego
        { food: this.foods.find(f => f.id === 65)!, quantity: 15 },  // Semillas de chía
        { food: this.foods.find(f => f.id === 61)!, quantity: 20 }   // Almendras
      ],
      instructions: "1. Pelar el plátano y cortarlo en trozos. 2. En una batidora, añadir todos los ingredientes. 3. Batir hasta obtener una mezcla homogénea. 4. Si queda muy espeso, añadir un poco más de leche. 5. Servir inmediatamente o refrigerar.",
      time: "5 min",
      image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 7,
      name: "Salmón al Horno con Quinoa",
      ingredients: [
        { food: this.foods.find(f => f.id === 34)!, quantity: 180 }, // Salmón
        { food: this.foods.find(f => f.id === 23)!, quantity: 120 }, // Quinoa
        { food: this.foods.find(f => f.id === 17)!, quantity: 60 },  // Espinaca
        { food: this.foods.find(f => f.id === 13)!, quantity: 50 },  // Zanahoria
        { food: this.foods.find(f => f.id === 71)!, quantity: 8 }    // Aceite de oliva
      ],
      instructions: "1. Precalentar el horno a 200°C. 2. Cocinar la quinoa. 3. Colocar el salmón en una bandeja con aceite de oliva y hornear 15-20 minutos. 4. Saltear las verduras. 5. Servir el salmón con la quinoa y las verduras.",
      time: "35 min",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 8,
      name: "Ensalada de Atún con Huevos",
      ingredients: [
        { food: this.foods.find(f => f.id === 35)!, quantity: 100 }, // Atún en agua
        { food: this.foods.find(f => f.id === 36)!, quantity: 60 },  // Huevos
        { food: this.foods.find(f => f.id === 11)!, quantity: 40 },  // Lechuga
        { food: this.foods.find(f => f.id === 12)!, quantity: 70 },  // Tomate
        { food: this.foods.find(f => f.id === 20)!, quantity: 50 },  // Pepino
        { food: this.foods.find(f => f.id === 71)!, quantity: 8 }    // Aceite de oliva
      ],
      instructions: "1. Cocer los huevos y cortarlos en cuartos. 2. Escurrir el atún. 3. Lavar y cortar todas las verduras. 4. Mezclar todos los ingredientes en un bol. 5. Aliñar con aceite de oliva y servir fresca.",
      time: "20 min",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 9,
      name: "Tortilla de Verduras con Queso",
      ingredients: [
        { food: this.foods.find(f => f.id === 36)!, quantity: 120 }, // Huevos (2 huevos)
        { food: this.foods.find(f => f.id === 15)!, quantity: 60 },  // Pimiento
        { food: this.foods.find(f => f.id === 14)!, quantity: 40 },  // Cebolla
        { food: this.foods.find(f => f.id === 12)!, quantity: 50 },  // Tomate
        { food: this.foods.find(f => f.id === 44)!, quantity: 30 },  // Queso mozzarella
        { food: this.foods.find(f => f.id === 71)!, quantity: 5 }    // Aceite de oliva
      ],
      instructions: "1. Batir los huevos en un bol. 2. Picar finamente las verduras y el queso. 3. Calentar aceite en una sartén. 4. Añadir las verduras y cocinar 5 minutos. 5. Verter los huevos batidos, añadir el queso y cocinar hasta que cuaje. 6. Dar la vuelta y terminar de cocinar.",
      time: "25 min",
      image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    },
    {
      id: 10,
      name: "Lentejas con Verduras",
      ingredients: [
        { food: this.foods.find(f => f.id === 51)!, quantity: 120 }, // Lentejas cocidas
        { food: this.foods.find(f => f.id === 13)!, quantity: 60 },  // Zanahoria
        { food: this.foods.find(f => f.id === 14)!, quantity: 40 },  // Cebolla
        { food: this.foods.find(f => f.id === 15)!, quantity: 50 },  // Pimiento
        { food: this.foods.find(f => f.id === 12)!, quantity: 60 },  // Tomate
        { food: this.foods.find(f => f.id === 71)!, quantity: 8 }    // Aceite de oliva
      ],
      instructions: "1. En una olla, calentar aceite de oliva. 2. Sofreír la cebolla, zanahoria y pimiento picados. 3. Añadir el tomate picado y cocinar 5 minutos. 4. Incorporar las lentejas cocidas y un poco de agua si es necesario. 5. Cocinar 10 minutos más y servir caliente.",
      time: "30 min",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
    }
  ];

  // Estado de las comidas del día - ahora dinámico
  private mealsData = signal<Map<string, MealItem[]>>(new Map([
    ['breakfast', []],
    ['lunch', []],
    ['snack', []],
    ['dinner', []]
  ]));

  constructor(private authService: AuthService) {
    this.calculateRecipeTotals();
    this.loadMealsFromStorage();
  }

  // Calcular totales nutricionales para todas las recetas
  private calculateRecipeTotals(): void {
    this.recipes.forEach(recipe => {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      recipe.ingredients.forEach(ingredient => {
        const factor = ingredient.quantity / 100;
        totalCalories += ingredient.food.calories * factor;
        totalProtein += ingredient.food.protein * factor;
        totalCarbs += ingredient.food.carbs * factor;
        totalFat += ingredient.food.fat * factor;
      });

      recipe.totalCalories = Math.round(totalCalories);
      recipe.totalProtein = Math.round(totalProtein * 10) / 10;
      recipe.totalCarbs = Math.round(totalCarbs * 10) / 10;
      recipe.totalFat = Math.round(totalFat * 10) / 10;
    });
  }

  // Obtener 3 recetas aleatorias
  getRandomRecipes(count: number = 3): Recipe[] {
    const shuffled = [...this.recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Obtener receta por ID
  getRecipeById(id: number): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  // Obtener todas las recetas
  getAllRecipes(): Recipe[] {
    return this.recipes;
  }

  // Añadir receta completa a una comida
  addRecipeToMeal(mealType: string, recipe: Recipe): void {
    recipe.ingredients.forEach(ingredient => {
      this.addFoodToMeal(mealType, ingredient.food, ingredient.quantity);
    });
  }

  // Obtener todos los alimentos
  getFoods(): Food[] {
    console.log('NutritionService.getFoods() called, returning', this.foods.length, 'foods');
    return this.foods;
  }

  // Buscar alimentos por nombre
  searchFoods(query: string): Food[] {
    const lowerQuery = query.toLowerCase();
    return this.foods.filter(food =>
      food.name.toLowerCase().includes(lowerQuery) ||
      food.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Obtener alimentos por categoría
  getFoodsByCategory(category: string): Food[] {
    return this.foods.filter(food => food.category === category);
  }

  // Obtener categorías únicas
  getCategories(): string[] {
    return [...new Set(this.foods.map(food => food.category))];
  }

  // Añadir alimento a una comida
  addFoodToMeal(mealType: string, food: Food, quantity: number = 100): void {
    const factor = quantity / 100; // Factor para calcular por 100g

    const mealItem: MealItem = {
      food,
      quantity,
      calculatedProtein: food.protein * factor,
      calculatedCarbs: food.carbs * factor,
      calculatedFat: food.fat * factor,
      calculatedCalories: food.calories * factor
    };

    const currentMeals = new Map(this.mealsData());
    const currentMealItems = currentMeals.get(mealType) || [];
    currentMealItems.push(mealItem);
    currentMeals.set(mealType, currentMealItems);
    this.mealsData.set(currentMeals);
    this.saveMealsToStorage();
  }

  // Remover alimento de una comida
  removeFoodFromMeal(mealType: string, index: number): void {
    const currentMeals = new Map(this.mealsData());
    const currentMealItems = currentMeals.get(mealType) || [];
    currentMealItems.splice(index, 1);
    currentMeals.set(mealType, currentMealItems);
    this.mealsData.set(currentMeals);
    this.saveMealsToStorage();
  }

  // Obtener comidas
  getMeals() {
    return this.mealsData;
  }

  // Calcular totales del día
  getDailyTotals() {
    const allMeals: MealItem[] = [];
    this.mealsData().forEach(mealItems => {
      allMeals.push(...mealItems);
    });

    return {
      calories: allMeals.reduce((sum: number, item: MealItem) => sum + item.calculatedCalories, 0),
      protein: allMeals.reduce((sum: number, item: MealItem) => sum + item.calculatedProtein, 0),
      carbs: allMeals.reduce((sum: number, item: MealItem) => sum + item.calculatedCarbs, 0),
      fat: allMeals.reduce((sum: number, item: MealItem) => sum + item.calculatedFat, 0)
    };
  }

  // Calcular totales por comida
  getMealTotals(mealType: string) {
    const mealItems = this.mealsData().get(mealType) || [];

    return {
      calories: mealItems.reduce((sum: number, item: MealItem) => sum + item.calculatedCalories, 0),
      protein: mealItems.reduce((sum: number, item: MealItem) => sum + item.calculatedProtein, 0),
      carbs: mealItems.reduce((sum: number, item: MealItem) => sum + item.calculatedCarbs, 0),
      fat: mealItems.reduce((sum: number, item: MealItem) => sum + item.calculatedFat, 0)
    };
  }

  // Eliminar una comida extra
  removeExtraMeal(mealId: string): void {
    const currentMeals = new Map(this.mealsData());
    currentMeals.delete(mealId);
    this.mealsData.set(currentMeals);
    this.saveMealsToStorage();
  }

  // Crear una comida extra
  addExtraMeal(): string {
    const currentMeals = new Map(this.mealsData());
    let extraMealNumber = 1;

    // Encontrar el próximo número disponible para "extra-{number}"
    while (currentMeals.has(`extra-${extraMealNumber}`)) {
      extraMealNumber++;
    }

    const mealId = `extra-${extraMealNumber}`;
    currentMeals.set(mealId, []);
    this.mealsData.set(currentMeals);
    this.saveMealsToStorage();

    return mealId;
  }

  // Limpiar todas las comidas (nuevo día)
  clearAllMeals(): void {
    this.mealsData.set(new Map([
      ['breakfast', []],
      ['lunch', []],
      ['snack', []],
      ['dinner', []]
    ]));
    this.saveMealsToStorage();
  }

  // Persistencia en localStorage
  private saveMealsToStorage(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;

    const mealsObject: { [key: string]: MealItem[] } = {};
    this.mealsData().forEach((value, key) => {
      mealsObject[key] = value;
    });
    localStorage.setItem(`nutritionMeals_${userId}`, JSON.stringify(mealsObject));
  }

  private loadMealsFromStorage(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      this.clearAllMeals();
      return;
    }

    const stored = localStorage.getItem(`nutritionMeals_${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mealsMap = new Map<string, MealItem[]>();
        Object.entries(parsed).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            mealsMap.set(key, value as MealItem[]);
          }
        });
        this.mealsData.set(mealsMap);
      } catch (error) {
        console.error('Error loading meals from storage:', error);
        // Fallback to default meals
        this.clearAllMeals();
      }
    } else {
      // Initialize with default meals for new user
      this.clearAllMeals();
    }
  }
}
# FitLife Plus 📱💪

## Una Aplicación Móvil Integral de Fitness y Bienestar

FitLife Plus es una aplicación móvil completa diseñada para ayudar a los usuarios a alcanzar sus objetivos de fitness de manera efectiva y sostenible. Desarrollada por estudiantes del **Politécnico Gran Colombiano**, esta aplicación combina seguimiento nutricional, rutinas de ejercicio personalizadas, recordatorios inteligentes y análisis de progreso en una interfaz intuitiva y moderna.

## 🎓 Sobre el Equipo de Desarrollo

Este proyecto fue desarrollado por estudiantes del **Politécnico Gran Colombiano** como parte de su formación en desarrollo de software móvil. El equipo combina conocimientos en desarrollo frontend, backend, diseño de interfaces y gestión de bases de datos para crear una solución integral de fitness.

## 🚀 Características Principales

### 📊 Seguimiento Nutricional Completo
- **Registro de alimentos**: Base de datos extensa con miles de alimentos
- **Análisis nutricional**: Macronutrientes, micronutrientes y calorías
- **Planes de comidas personalizados**: Adaptados a objetivos específicos
- **Preferencias dietéticas**: Soporte para vegetarianos, veganos, sin gluten, etc.

### 🏋️‍♂️ Rutinas de Ejercicio Personalizadas
- **Planes de entrenamiento adaptativos**: Según frecuencia semanal y objetivos
- **Biblioteca de ejercicios**: Más de 100 ejercicios con instrucciones detalladas
- **Seguimiento de progreso**: Gráficos y estadísticas de rendimiento
- **Recordatorios inteligentes**: Notificaciones programadas para sesiones de ejercicio

### 📱 Interfaz Moderna y Intuitiva
- **Diseño Material Design**: Inspirado en las mejores prácticas de UX/UI
- **Navegación intuitiva**: Tabs organizados por funcionalidad
- **Gráficos interactivos**: Visualización clara del progreso
- **Modo offline**: Funcionalidad completa sin conexión a internet

### 🔔 Sistema de Notificaciones Avanzado
- **Recordatorios de comidas**: Desayuno, almuerzo, cena
- **Recordatorios de hidratación**: Cada 2 horas durante el día
- **Recordatorios de ejercicio**: Según frecuencia personalizada
- **Notificaciones de prueba**: Para verificar funcionamiento

### 💾 Base de Datos Local Robusta
- **Almacenamiento persistente**: Todos los datos se guardan localmente
- **Sincronización automática**: Entre sesiones de la aplicación
- **Gestión de usuarios**: Perfiles individuales con datos personalizados
- **Historial completo**: Seguimiento histórico de progreso y hábitos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 20**: Framework moderno para aplicaciones web
- **Ionic 8**: Framework híbrido para desarrollo móvil nativo
- **TypeScript**: Tipado fuerte para mayor robustez del código
- **SCSS**: Estilos avanzados con variables y mixins

### Capacitor
- **Capacitor 7**: Puente nativo para acceso a funcionalidades del dispositivo
- **Local Notifications**: Sistema de notificaciones push
- **Status Bar**: Control de la barra de estado del dispositivo
- **Haptics**: Retroalimentación táctil

### Librerías Adicionales
- **Chart.js**: Gráficos interactivos para visualización de datos
- **RxJS**: Programación reactiva para manejo de estados
- **Ionicons**: Iconografía consistente y moderna

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── edit-profile-modal/
│   │   ├── workout-preferences-modal/
│   │   ├── nutrition-preferences-modal/
│   │   └── add-food-modal/
│   ├── pages/               # Páginas principales
│   │   ├── home/
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── services/            # Servicios de negocio
│   │   ├── auth.service.ts
│   │   ├── database.service.ts
│   │   ├── notification.service.ts
│   │   ├── nutrition.service.ts
│   │   ├── progress.service.ts
│   │   └── workout.service.ts
│   ├── guards/              # Guards de navegación
│   ├── tabs/                # Navegación por tabs
│   │   ├── tab1/ (Dashboard)
│   │   ├── tab2/ (Nutrición)
│   │   ├── tab3/ (Ejercicio)
│   │   ├── tab4/ (Progreso)
│   │   └── tab5/ (Perfil)
│   └── shared/              # Utilidades compartidas
├── assets/                  # Recursos estáticos
├── environments/            # Configuraciones de entorno
└── theme/                   # Tema global de la aplicación
```

## 📋 Requisitos del Sistema

- **Node.js**: Versión 20.19.0 o superior (recomendado 22.12.0 o superior)
- **npm**: Versión 9.0.0 o superior
- **Android Studio**: Para desarrollo Android (opcional)
- **Xcode**: Para desarrollo iOS (opcional)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/ramirezjhulian7/fitlife-plus.git
cd fitlife-plus
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Capacitor
```bash
# Agregar plataforma Android
npm run cap:add:android

# Sincronizar cambios con plataformas nativas
npx cap sync
```

### 4. Ejecutar en Modo Desarrollo
```bash
# Servidor de desarrollo web
npm start

# Ejecutar en dispositivo Android
npm run cap:open:android
```

## 📱 Uso de la Aplicación

### Primer Uso
1. **Registro/Inicio de Sesión**: Crear cuenta o acceder con credenciales existentes
2. **Onboarding**: Configurar preferencias iniciales (objetivos, frecuencia de ejercicio, etc.)
3. **Perfil**: Completar información personal (edad, altura, peso, objetivos)

### Navegación Principal
- **Dashboard (Tab 1)**: Vista general del progreso diario
- **Nutrición (Tab 2)**: Registro de comidas y análisis nutricional
- **Ejercicio (Tab 3)**: Rutinas de entrenamiento y seguimiento
- **Progreso (Tab 4)**: Gráficos y estadísticas de evolución
- **Perfil (Tab 5)**: Configuración y preferencias personales

### Funcionalidades Clave

#### Seguimiento Nutricional
- Buscar alimentos por nombre
- Agregar comidas a diferentes momentos del día
- Ver resumen nutricional diario
- Configurar preferencias dietéticas

#### Rutinas de Ejercicio
- Seleccionar frecuencia semanal de entrenamiento
- Seguir rutinas guiadas
- Registrar progreso de ejercicios
- Recibir recordatorios automáticos

#### Sistema de Notificaciones
- Configurar recordatorios de comidas
- Activar recordatorios de hidratación
- Programar notificaciones de ejercicio
- Probar notificaciones en tiempo real

## 💾 Base de Datos Local

FitLife Plus utiliza un sistema robusto de base de datos local que garantiza la persistencia de todos los datos del usuario sin depender de conexiones a internet. La arquitectura incluye:

### Estructura de Datos
- **Usuarios**: Información de autenticación y perfiles
- **Perfiles**: Datos personales y preferencias
- **Comidas**: Registro diario de ingesta nutricional
- **Ejercicios**: Historial de rutinas y progreso
- **Preferencias**: Configuraciones personalizadas

### Características de la Base de Datos
- **Persistencia**: Datos se mantienen entre sesiones
- **Sincronización**: Actualización automática de cambios
- **Optimización**: Consultas eficientes para mejor rendimiento
- **Seguridad**: Datos almacenados de forma segura localmente

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Scripts Disponibles
```json
{
  "start": "ng serve",
  "build": "ng build",
  "test": "ng test",
  "lint": "ng lint",
  "cap:add:android": "npx cap add android",
  "cap:open:android": "npx cap open android"
}
```

## 🧪 Pruebas

### Ejecutar Pruebas Unitarias
```bash
npm test
```

### Ejecutar Pruebas E2E
```bash
npm run e2e
```

### Verificación de Calidad de Código
```bash
npm run lint
```

## 📦 Despliegue

### Construcción para Producción
```bash
npm run build
npx cap sync
```

### Generación de APK Android
```bash
npx cap build android
```

### 🚀 CI/CD con GitHub Actions

Este proyecto incluye un pipeline automatizado de GitHub Actions que compila automáticamente los APKs de Android en cada push a la rama principal.

#### ¿Cómo funciona?
1. **Compilación Automática**: Cada push a `master` o `main` activa el workflow
2. **Node.js 22**: Usa la versión más reciente compatible con Angular
3. **Construcción del APK**: Se genera tanto la versión Debug como Release
4. **Artifacts**: Los APKs se suben como artifacts descargables
5. **Releases**: Se crea automáticamente una release de GitHub con los APKs

#### Descargar APK
1. Ve a la pestaña **"Actions"** en el repositorio de GitHub
2. Selecciona el workflow **"Build Android APK"**
3. En la ejecución más reciente, ve a **"Artifacts"**
4. Descarga `fitlife-plus-debug.apk` o `fitlife-plus-release.apk`

#### Releases Automáticas
Cada push a la rama principal también crea una nueva release en la pestaña **"Releases"** con los APKs adjuntos.

#### Configuración de Firma (Opcional)
Para generar APKs firmados para distribución:

1. Crea un keystore de Android
2. Agrega los siguientes secrets en el repositorio de GitHub:
   - `ANDROID_KEYSTORE_PATH`: Ruta al keystore (base64 encoded)
   - `ANDROID_KEYSTORE_PASSWORD`: Contraseña del keystore
   - `ANDROID_KEY_ALIAS`: Alias de la clave
   - `ANDROID_KEY_PASSWORD`: Contraseña de la clave

### Instalación del APK
1. Descarga el APK desde GitHub Actions o Releases
2. En tu dispositivo Android, habilita **"Instalación de fuentes desconocidas"**
3. Instala el APK descargado
4. ¡Disfruta de FitLife Plus!

## 🤝 Contribución

Como proyecto estudiantil del Politécnico Gran Colombiano, valoramos las contribuciones de la comunidad. Para contribuir:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código
- Usar TypeScript para tipado fuerte
- Seguir las convenciones de Angular
- Mantener la cobertura de pruebas
- Documentar funciones y componentes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Politécnico Gran Colombiano**: Por proporcionar la formación y recursos necesarios
- **Comunidad Ionic**: Por el excelente framework de desarrollo móvil
- **Equipo de Desarrollo**: Por la dedicación y esfuerzo en crear esta solución integral

---

*FitLife Plus - Tu compañero de fitness inteligente* 💪📱
import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'workout',
        loadComponent: () =>
          import('./tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'nutrition',
        loadComponent: () =>
          import('./tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./tab4/tab4.page').then((m) => m.Tab4Page),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./tab5/tab5.page').then((m) => m.Tab5Page),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];

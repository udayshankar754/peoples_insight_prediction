import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/live-result' },
  {
    path: 'home',
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/welcome' },
      {
        path: 'welcome',
        loadChildren: () => import('./pages/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
      },
    ],
  },
  {
    path : 'live-result',
    loadComponent: () => import('./pages/live-result/live-result.component'),
  }
];

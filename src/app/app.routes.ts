import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { LiveResultComponent } from './pages/live-result/live-result.component';
import { RoundwiseAnalysisComponent } from './pages/roundwise-analysis/roundwise-analysis.component';
import { RoundwiseResultComponent } from './pages/roundwise-result/roundwise-result.component';

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
    path: 'live-result',
    component: LiveResultComponent,
  },
  {
    path: 'roundwise-result/:state_code/:ac_no',
    component : RoundwiseResultComponent
  },
  {
    path: 'roundwise-result-analysis',
   component : RoundwiseAnalysisComponent
  },
];

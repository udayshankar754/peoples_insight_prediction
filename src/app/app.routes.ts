import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { LiveResultComponent } from './pages/live-result/live-result.component';
import { RoundwiseAnalysisComponent } from './pages/roundwise-analysis/roundwise-analysis.component';
import { RoundwiseResultComponent } from './pages/roundwise-result/roundwise-result.component';
import {DataConfigComponent} from './pages/configurator/data-config/data-config.component';
import { KeysCongiguratorComponent } from './pages/configurator/keys-congigurator/keys-congigurator.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'home',
    component: LayoutComponent,
    children: [
      {
        path: 'data-config',
        component : DataConfigComponent,
      },
      {
        path: 'key-config',
        component : KeysCongiguratorComponent,
      },
    ],
  },
  {
    path: 'live-result',
    component: LiveResultComponent,
  },
  {
    path: 'roundwise-result/:state_code/:ac_no',
    component: RoundwiseResultComponent,
  },
  {
    path: 'roundwise-result-analysis/:state/:state_code',
    component: RoundwiseAnalysisComponent,
  },
];

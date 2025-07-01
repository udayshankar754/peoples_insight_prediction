import { Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { LiveResultComponent } from './pages/live-result/live-result.component';
import { RoundwiseAnalysisComponent } from './pages/roundwise-analysis/roundwise-analysis.component';
import { RoundwiseResultComponent } from './pages/roundwise-result/roundwise-result.component';
import {DataConfigComponent} from './pages/configurator/data-config/data-config.component';
import { KeysCongiguratorComponent } from './pages/configurator/keys-congigurator/keys-congigurator.component';
import { RoundWisePredictionComponent } from './pages/round-wise-prediction/round-wise-prediction.component';
import { BiRoundWiseResultComponent } from './pages/configurator/bi-round-wise-result/bi-round-wise-result.component';
import { TurnoutComponent } from './pages/configurator/turnout/turnout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'home',
    component: LayoutComponent,
    children: [
      {
        path: 'bi-result',
        component : DataConfigComponent,
      },
      {
        path: 'bi-round-wise-result',
        component : BiRoundWiseResultComponent,
      },
      {
        path: 'key-config',
        component : KeysCongiguratorComponent,
      },
      {
        path : 'turnout-config',
        component : TurnoutComponent,
      }
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
  {
    path : 'roundwise-prediction',
    component : RoundWisePredictionComponent
  }
];

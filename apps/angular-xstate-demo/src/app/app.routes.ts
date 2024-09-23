import { Route } from '@angular/router';
import { CounterComponent } from './counter/counter.component';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { RoutingComponent } from './routing/routing.component';

export const appRoutes: Route[] = [
  { path: 'counter', component: CounterComponent },
  { path: 'tic-tac-toe', component: TicTacToeComponent },
  { path: 'routing', component: RoutingComponent },
];

import { Route } from '@angular/router';
import { CounterComponent } from './counter/counter.component';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { TodosComponent } from './todo/todos.component';

export const appRoutes: Route[] = [
  { path: 'counter', component: CounterComponent },
  { path: 'tic-tac-toe', component: TicTacToeComponent },
  { path: 'todo', component: TodosComponent },
];

import { assign, fromPromise, setup } from 'xstate';
import { Router } from '@angular/router';
import {
  Component,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { useMachine } from 'xstate-ngx';
import { CommonModule } from '@angular/common';

const routeMachine = setup({
  types: {
    context: {} as { id: number },
    events: {} as { type: 'navigate' },
  },
  actors: {
    navigateActor: fromPromise(({ input }) => {
      const router = inject(Router);
      return router.navigate(['/counter']);
    }),
  },
}).createMachine({
  context: {
    id: 0,
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        navigate: { target: 'NEXT' },
      },
    },
    NEXT: {
      invoke: {
        id: 'navigateToCounter',
        src: 'navigateActor',
        onDone: 'success',
        onError: 'failure',
      },
    },
    success: {},
    failure: {},
  },
});

const RoutingMachine = useMachine(routeMachine);

@Component({
  selector: 'app-router',
  standalone: true,
  imports: [CommonModule],
  providers: [RoutingMachine],
  template: `
    {{ routingMachine.snapshot() | json }}
    <button (click)="navigate()">Navigate</button>
  `,
  styles: ``,
})
export class RoutingComponent {
  protected routingMachine = inject(RoutingMachine);
  private injector = inject(Injector);

  navigate() {
    console.log('send event');
    runInInjectionContext(this.injector, () =>
      this.routingMachine.send({ type: 'navigate' })
    );
  }
}

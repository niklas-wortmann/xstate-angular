import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { assign, setup } from 'xstate';
import { useMachine } from 'angular-xstate';

const countMachine = setup({
  types: {
    context: {} as { count: number },
    events: {} as
      | { type: 'INC' }
      | { type: 'DEC' }
      | { type: 'SET'; value: number },
  },
}).createMachine({
  context: {
    count: 0,
  },
  on: {
    INC: {
      actions: assign({
        count: ({ context }) => context.count + 1,
      }),
    },
    DEC: {
      actions: assign({
        count: ({ context }) => context.count - 1,
      }),
    },
    SET: {
      actions: assign({
        count: ({ event }) => event.value,
      }),
    },
  },
});

const CountService = useMachine(countMachine);

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  providers: [CountService],
  template: `
    <button (click)="counterMachine.send({ type: 'DEC' })">Decrement</button>
    <span>{{ counterMachine.snapshot().context.count }}</span>
    <button (click)="counterMachine.send({ type: 'INC' })">Increment</button>
    <button (click)="counterMachine.send({ type: 'SET', value: 0 })">
      Reset
    </button>
  `,
  styles: ``,
})
export class CounterComponent {
  protected counterMachine = inject(CountService);

  constructor() {
    this.counterMachine.snapshot().context.count;
    this.counterMachine.send({ type: 'INC' });
    this.counterMachine.send({ type: 'SET', value: 0 });
  }
}

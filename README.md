# xstate-angular

This is just a POC while the [PR in the Xstate Monorepository](https://github.com/statelyai/xstate/pull/4816) is being discussed. Eventually this will be moved and deprecated!

This package contains utilities for using [XState](https://github.com/statelyai/xstate) with [Angular](https://github.com/angular/angular).

- [Read the full documentation in the XState docs](https://stately.ai/docs/xstate-angular).
- [Read our contribution guidelines](https://github.com/statelyai/xstate/blob/main/CONTRIBUTING.md).

## Quick start

1. Install `xstate` and `xstate-angular`:

```bash
npm i xstate xstate-angular
```

2. Import the `useMachine` function:

```angular-ts
import { useMachine } from 'xstate-angular';
import { createMachine } from 'xstate';
import {Component, inject} from '@angular/core';
const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      on: { TOGGLE: 'active' }
    },
    active: {
      on: { TOGGLE: 'inactive' }
    }
  }
});
const ToggleMachine = useMachine(toggleMachine, {providedIn: 'root'})
@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [],
  template: `<button (click)="toggleMachine.send({type: 'TOGGLE'})">
    {{
      toggleMachine.snapshot().value === 'inactive'
        ? 'Click to activate'
        : 'Active! Click to deactivate'
    }}
  </button>
  `,
  styleUrl: './toggle.component.css'
})
export class ToggleComponent {
  public toggleMachine = inject(ToggleMachine);
}
```

## API

### `useActor(actorLogic, options?)`

**Returns** `{ snapshot, send, actorRef }`:

- `snapshot` - Represents the current snapshot (state) of the machine as an XState `State` object.  Returns a Signal.
- `send` - A function that sends events to the running actor.
- `actorRef` - The created actor ref.

### `useMachine(machine, options?)`

A [Vue composition function](https://v3.vuejs.org/guide/composition-api-introduction.html) that creates an actor from the given `machine` and starts an actor that runs for the lifetime of the component.

#### Arguments

- `machine` - An [XState machine](https://stately.ai/docs/machines)
- `options` (optional) - Actor options

**Returns** `{ snapshot, send, actorRef }`:

- `snapshot` - Represents the current snapshot (state) of the machine as an XState `State` object. Returns a Signal.
- `send` - A function that sends events to the running actor.
- `actorRef` - The created actor ref.

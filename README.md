# xstate-ngx

This is just a POC while the [PR in the Xstate Monorepository](https://github.com/statelyai/xstate/pull/4816) is being discussed. Eventually this will be moved and deprecated!

This package contains utilities for using [XState](https://github.com/statelyai/xstate) with [Angular](https://github.com/angular/angular).

- [Read the full documentation in the XState docs](https://stately.ai/docs/xstate-angular).
- [Read our contribution guidelines](https://github.com/statelyai/xstate/blob/main/CONTRIBUTING.md).

## Quick start

1. Install `xstate` and `xstate-ngx`:

```bash
npm i xstate xstate-ngx
```

2. Import the `useMachine` function:

```angular-ts
import { useMachine } from 'xstate-ngx';
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
- `matches` - indicating whether the provided path matches the machine snapshot.
- `hasTag` - machine or machine snapshot has the specified tag.
- `can` -  path can be transitioned to in the state machine

### `useMachine(machine, options?)`

A function that returns an Injectable that creates an actor from the given `machine` and starts an actor that runs for the lifetime of the component or DI context.

#### Arguments

- `machine` - An [XState machine](https://stately.ai/docs/machines)
- `options` (optional) - Actor options

**Returns** `{ snapshot, send, actorRef }`:

- `snapshot` - Represents the current snapshot (state) of the machine as an XState `State` object.  Returns a Signal.
- `send` - A function that sends events to the running actor.
- `actorRef` - The created actor ref.
- `matches` - indicating whether the provided path matches the machine snapshot.
- `hasTag` - machine or machine snapshot has the specified tag.
- `can` -  path can be transitioned to in the state machine

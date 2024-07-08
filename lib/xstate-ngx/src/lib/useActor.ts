import {
  Actor,
  ActorOptions,
  AnyActorLogic,
  isMachineSnapshot,
  Snapshot,
  SnapshotFrom,
} from 'xstate';
import {
  computed,
  Injectable,
  Signal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { useActorRef } from './useActorRef';
import type { AnyMachineSnapshot } from 'xstate/dist/declarations/src/types';

/**
 * Creates an Angular service that provides an instance of an actor store.
 *
 * @param actorLogic - The logic implementation for the actor.
 * @param _options - Optional options to configure the actor store. Can include "providedIn" property to specify the Angular module where the service is provided.
 *
 * @return The Angular service that provides the actor store.
 */
export function useActor<TLogic extends AnyActorLogic>(
  actorLogic: TLogic,
  _options?: ActorOptions<TLogic> & { providedIn: 'root' }
): Type<ActorStoreProps<TLogic>> {
  const { providedIn, ...options } = _options ?? {};

  @Injectable({ providedIn: providedIn ?? null })
  class ActorStore implements ActorStoreProps<TLogic> {
    public actorRef: Actor<TLogic>;
    private _snapshot: WritableSignal<SnapshotFrom<TLogic>>;
    public send: Actor<TLogic>['send'];
    public snapshot: Signal<SnapshotFrom<TLogic>>;

    private isMachine = true;

    constructor() {
      const listener = (nextSnapshot: Snapshot<unknown>) => {
        this._snapshot?.set(nextSnapshot as any);
      };

      this.actorRef = useActorRef(actorLogic, options, listener);
      this._snapshot = signal(this.actorRef.getSnapshot());
      this.send = this.actorRef.send;
      this.snapshot = this._snapshot.asReadonly();
      this.isMachine = isMachineSnapshot(this.snapshot());
    }

    matches(path: MatchType<TLogic>) {
      return computed(() => {
        const machineSnapshot = this.snapshot();
        if (this.isMachine) {
          return (machineSnapshot as AnyMachineSnapshot).matches(path);
        }
        return false;
      });
    }

    hasTag(path: HasTagType<TLogic>) {
      return computed(() => {
        const machineSnapshot = this.snapshot();
        if (this.isMachine) {
          return (machineSnapshot as AnyMachineSnapshot).hasTag(path);
        }
        return false;
      });
    }

    can(path: CanType<TLogic>) {
      return computed(() => {
        const machineSnapshot = this.snapshot();
        if (this.isMachine) {
          return (machineSnapshot as AnyMachineSnapshot).can(path);
        }
        return false;
      });
    }
  }
  return ActorStore;
}

type FnParameter<
  TLogic extends AnyActorLogic,
  functionName extends string
> = Parameters<SnapshotFrom<TLogic>[functionName]>[0];

type MatchType<TLogic extends AnyActorLogic> = FnParameter<TLogic, 'matches'>;
type CanType<TLogic extends AnyActorLogic> = FnParameter<TLogic, 'can'>;
type HasTagType<TLogic extends AnyActorLogic> = FnParameter<TLogic, 'hasTag'>;

export interface ActorStoreProps<TLogic extends AnyActorLogic> {
  actorRef: Actor<TLogic>;
  snapshot: Signal<SnapshotFrom<TLogic>>;
  send: Actor<TLogic>['send'];
  matches: (path: MatchType<TLogic>) => Signal<boolean>;
  can: (event: CanType<TLogic>) => Signal<boolean>;
  hasTag: (event: HasTagType<TLogic>) => Signal<boolean>;
}

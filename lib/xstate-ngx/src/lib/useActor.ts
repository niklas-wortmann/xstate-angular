import {
  Actor,
  ActorOptions,
  AnyActorLogic,
  isMachineSnapshot,
  Snapshot,
  SnapshotFrom,
  AnyMachineSnapshot,
  EventFromLogic,
} from 'xstate';
import {
  computed,
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  Signal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { useActorRef } from './useActorRef';

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
  _options?: ActorOptions<TLogic> & { providedIn?: 'root' }
): Type<ActorStoreProps<TLogic>> {
  const { providedIn, ...options } = _options ?? {};

  @Injectable({ providedIn: providedIn ?? null })
  class ActorStore implements ActorStoreProps<TLogic> {
    public actorRef: Actor<TLogic>;
    public send: Actor<TLogic>['send'];
    public snapshot: Signal<SnapshotFrom<TLogic>>;
    private injector = inject(Injector);

    private _isMachine = true;
    private _snapshot: WritableSignal<SnapshotFrom<TLogic>>;

    constructor() {
      const listener = (nextSnapshot: Snapshot<unknown>) => {
        this._snapshot?.set(nextSnapshot as any);
      };

      this.actorRef = useActorRef(actorLogic, options, listener);
      this._snapshot = signal(this.actorRef.getSnapshot());
      this.send = (event: EventFromLogic<TLogic>) =>
        runInInjectionContext(this.injector, () => this.actorRef.send(event));
      this.snapshot = this._snapshot.asReadonly();
      this._isMachine = isMachineSnapshot(this.snapshot());
    }

    matches(path: MatchType<TLogic>) {
      return computed(() => {
        const machineSnapshot = this.snapshot();
        if (this._isMachine) {
          return (machineSnapshot as AnyMachineSnapshot).matches(path);
        }
        return false;
      });
    }

    hasTag(path: HasTagType<TLogic>) {
      return computed(() => {
        const machineSnapshot = this.snapshot();
        if (this._isMachine) {
          return (machineSnapshot as AnyMachineSnapshot).hasTag(path);
        }
        return false;
      });
    }

    can(path: CanType<TLogic>) {
      return computed(() => {
        const machineSnapshot = this.snapshot();
        if (this._isMachine) {
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
  /**
   * Represents a reference to an actor.
   */
  actorRef: Actor<TLogic>;
  /**
   * Represents a snapshot of the actor as Signal.
   */
  snapshot: Signal<SnapshotFrom<TLogic>>;
  /**
   * Sends a message to the actor associated with the specified logic.
   */
  send: Actor<TLogic>['send'];
  /**
   * Returns a computed value indicating whether the provided path matches the machine snapshot.
   *
   * @param {MatchType<TLogic>} path - The path to be matched against the machine snapshot.
   * @return {Signal<boolean>} - A computed boolean value indicating whether the path matches the machine snapshot.
   */
  matches: (path: MatchType<TLogic>) => Signal<boolean>;
  /**
   * Determines whether the specified path can be transitioned to in the state machine.
   *
   * @param {CanType<TLogic>} path - The path to check if it can be transitioned to.
   * @return {Signal<boolean>} - Returns true if the specified path can be transitioned to, otherwise returns false.
   */
  can: (event: CanType<TLogic>) => Signal<boolean>;
  /**
   * Determines if the machine or machine snapshot has the specified tag.
   *
   * @param {HasTagType<TLogic>} path - The tag path.
   * @return {Signal<>boolean>} - True if the machine or machine snapshot has the tag, otherwise false.
   */
  hasTag: (event: HasTagType<TLogic>) => Signal<boolean>;
}

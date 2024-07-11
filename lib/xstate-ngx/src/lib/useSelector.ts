import { Signal, effect, isSignal, signal } from '@angular/core';
import type { AnyActorRef } from 'xstate';

function defaultCompare<T>(a: T, b: T) {
  return a === b;
}

const noop = () => {
  /* ... */
};

export const useSelector = <
  TActor extends Pick<AnyActorRef, 'getSnapshot' | 'subscribe'>,
  T
>(
  actor: TActor | Signal<TActor>,
  selector: (
    snapshot: TActor extends { getSnapshot(): infer TSnapshot }
      ? TSnapshot
      : undefined
  ) => T,
  compare: (a: T, b: T) => boolean = defaultCompare
) => {
  const actorRefRef = isSignal(actor) ? actor : signal(actor);
  const selected = signal(selector(actorRefRef()?.getSnapshot()));

  const updateSelectedIfChanged = (nextSelected: T) => {
    if (!compare(selected(), nextSelected)) {
      selected.set(nextSelected);
    }
  };

  effect(
    (onCleanup) => {
      const newActor = actorRefRef();
      selected.set(selector(newActor?.getSnapshot()));
      if (!newActor) {
        return;
      }
      const sub = newActor.subscribe({
        next: (emitted) => {
          updateSelectedIfChanged(selector(emitted));
        },
        error: noop,
        complete: noop,
      });
      onCleanup(() => sub.unsubscribe());
    },
    {
      allowSignalWrites: true,
    }
  );

  return selected;
};

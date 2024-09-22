import { ActorOptions, AnyStateMachine } from 'xstate';
import { useActor } from './useActor';

/**
 * Uses a machine to create an actor logic and returns it.
 * The actor logic can be used to interact with the given machine.
 *
 * @param {TMachine} actorLogic - The machine to create an actor logic for.
 * @param {ActorOptions<TMachine>} options - Optional configuration options for the actor logic.
 * @param {string} options.providedIn - The scope in which the actor logic should be provided. Defaults to 'root'.
 *
 * @returns {ActorLogic} The created actor logic.
 * @alias useActor
 */
export function useMachine<TMachine extends AnyStateMachine>(
  actorLogic: TMachine | (() => TMachine),
  options?: ActorOptions<TMachine> & { providedIn: 'root' }
) {
  return useActor(actorLogic, options);
}

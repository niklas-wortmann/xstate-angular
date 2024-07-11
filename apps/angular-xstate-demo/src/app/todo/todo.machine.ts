import { sendParent, setup, assign } from 'xstate';
import { Todo } from './todo';

type TodoContext = {
  id: string | undefined;
  title: string;
  prevTitle: string;
  completed?: boolean;
};
type TodoEvents =
  | { type: 'reading' }
  | { type: 'onEntry' }
  | { type: '' }
  | { type: 'DELETE' }
  | { type: 'TOGGLE_COMPLETE' }
  | { type: 'SET_ACTIVE' }
  | { type: 'EDIT' }
  | { type: 'COMMIT' }
  | { type: 'CHANGE'; value: string }
  | { type: 'CANCEL' }
  | { type: 'BLUR' }
  | { type: 'SET_COMPLETED' };

export const todoMachine = setup({
  types: {
    context: {} as TodoContext,
    events: {} as TodoEvents,
    input: {} as Todo,
  },
  guards: {
    isCompleted: ({ context }: { context: TodoContext }) => !!context.completed,
    validTitle: ({ context }: { context: TodoContext }) =>
      context.title.trim().length > 0,
  },
}).createMachine({
  id: 'todo',
  initial: 'reading',
  context: ({ input }) => ({
    id: input.id ?? undefined,
    title: input.title ?? '',
    prevTitle: '',
  }),
  on: {
    DELETE: 'deleted',
  },

  states: {
    reading: {
      initial: 'unknown',
      states: {
        unknown: {
          on: {
            '': [
              { target: 'completed', guard: 'isCompleted' },
              { target: 'pending' },
            ],
          },
        },
        pending: {
          on: {
            TOGGLE_COMPLETE: {
              target: 'completed',
              actions: [
                assign({ completed: true }),
                sendParent((ctx) => ({ type: 'TODO.COMMIT', todo: ctx })),
              ],
            },

            SET_COMPLETED: {
              target: 'completed',
              actions: [
                assign({ completed: true }),
                sendParent((ctx) => ({ type: 'TODO.COMMIT', todo: ctx })),
              ],
            },
          },
        },

        //
        completed: {
          on: {
            TOGGLE_COMPLETE: {
              target: 'pending',
              actions: [
                assign({ completed: false }),
                sendParent((ctx) => ({ type: 'TODO.COMMIT', todo: ctx })),
              ],
            },

            SET_ACTIVE: {
              target: 'pending',
              actions: [
                assign({ completed: false }),
                sendParent((ctx) => ({ type: 'TODO.COMMIT', todo: ctx })),
              ],
            },
          },
        },

        hist: {
          type: 'history',
        },
      },
      on: {
        EDIT: {
          target: 'editing',
        },
      },
    },
    editing: {
      entry: assign({ prevTitle: ({ context }) => context.title }),
      on: {
        CHANGE: {
          actions: assign({
            title: (ctx) => ctx.event.value,
          }),
        },

        COMMIT: [
          {
            target: 'reading.hist',
            actions: sendParent((ctx) => ({ type: 'TODO.COMMIT', todo: ctx })),
            guard: 'validTitle',
          },
          { target: 'deleted' },
        ],
        BLUR: {
          target: 'reading',
          actions: sendParent((ctx) => ({ type: 'TODO.COMMIT', todo: ctx })),
        },
        CANCEL: {
          target: 'reading',
          actions: assign({ title: (ctx) => ctx.context.prevTitle }),
        },
      },
    },
    deleted: {
      entry: sendParent(({ context }) => ({
        type: 'TODO.DELETE',
        id: context.id,
      })),
    },
  },
});

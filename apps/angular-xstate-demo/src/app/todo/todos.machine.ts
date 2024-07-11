import { assign, spawnChild, createMachine, setup, createActor } from 'xstate';
import { v4 as uuidv4 } from 'uuid';
import { todoMachine } from './todo.machine';
import { Todo } from './todo';

const createTodo = (title: string): Todo => {
  return {
    id: uuidv4(),
    title: title,
    completed: false,
  };
};

interface TodosContext {
  todo: string;
  todos: Array<Todo & { ref: ReturnType<typeof createActor> }>;
}

type TodosEvents =
  | { type: 'NEWTODO.CHANGE'; value: string }
  | { type: 'NEWTODO.COMMIT'; value: string }
  | { type: 'TODO.COMMIT'; todo: Todo }
  | { type: '' };

export const todosMachine = setup({
  types: {
    context: {} as TodosContext,
    events: {} as TodosEvents,
  },
}).createMachine({
  id: 'todos',
  context: {
    todo: '', // new todo
    todos: [],
  },
  initial: 'initializing',

  states: {
    //
    initializing: {
      entry: assign({
        todos: (ctx) => {
          return ctx.context.todos.map((todo) => ({
            ...todo,
            ref: createActor(todoMachine, {
              input: {
                ...todo,
              },
            }),
          }));
        },
      }),
      on: {
        '': 'all',
      },
    },
    all: {},
    active: {},
    completed: {},
  },

  on: {
    'NEWTODO.CHANGE': {
      actions: assign({
        todo: ({ event }) => event.value,
      }),
    },
    'NEWTODO.COMMIT': {
      actions: [
        assign({
          todo: '', // clear todo
          todos: ({ context, event }) => {
            const newTodo = createTodo(event.value.trim());
            return context.todos.concat({
              ...newTodo,
              ref: createActor(todoMachine, {
                input: {
                  ...newTodo,
                },
              }),
            });
          },
        }),
        'persist',
      ],
      cond: (ctx, e) => e.value.trim().length,
    },

    'TODO.COMMIT': {
      actions: [
        assign({
          todos: ({ context, event }) =>
            context.todos.map((todo) => {
              return todo.id === event.todo.id
                ? { ...todo, ...event.todo, ref: todo.ref }
                : todo;
            }),
        }),
        'persist',
      ],
    },

    'SHOW.all': '.all',
    'SHOW.active': '.active',
    'SHOW.completed': '.completed',

    'MARK.completed': {
      actions: ({ context }) => {
        context.todos.forEach((todo) => todo.ref.send('SET_COMPLETED'));
      },
    },

    'MARK.active': {
      actions: ({ context }) => {
        context.todos.forEach((todo) => todo.ref.send('SET_ACTIVE'));
      },
    },

    'TODO.DELETE': {
      actions: [
        assign({
          todos: ({ context }) =>
            context.todos.filter((todo) => todo.id !== e.id),
        }),
        'persist',
      ],
    },

    CLEAR_COMPLETED: {
      actions: assign({
        todos: ({ context }) => context.todos.filter((todo) => !todo.completed),
      }),
    },
  },
});

import { writable } from 'svelte/store';

export type TodoType = {
  id: number,
  title: string,
  completed: boolean,
}

export const todos = ()=>{
  const {subscribe, set, update} = writable<TodoType[]>([]);
  return {
    subscribe,
    set,
    update,
    add: (todo: Omit<TodoType, 'id'>) => update(todos => [...todos, {...todo, id: Math.max(...todos.map(todo => todo.id), 0) + 1}]),
    remove: (id: number) => update(todos => todos.filter(todo => todo.id !== id)),
    toggle: (id: number) => update(todos => todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo)),
  }
}

export const todoStore = todos();

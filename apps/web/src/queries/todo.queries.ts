import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKey } from "./querykey";

import type { Todo, CreateTodoInput, TodoStatus } from "@repo/shared";
import { readTodos, createTodo, updateTodoStatus, deleteTodo } from "@/services/todo.api";


export function useTodoQuery() {
  return useQuery<Todo[]>({
    queryKey: queryKey.all,
    queryFn: readTodos,
    initialData: [],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, CreateTodoInput>({
    mutationFn: createTodo, 
    retry: false,

    onSuccess: (newTodo) => {
      const todos = queryClient.getQueryData<Todo[]>(queryKey.all) ?? [];
      queryClient.setQueryData(queryKey.all, [...todos, newTodo]);
    },
  });
}


export function useUpdateTodoStatus() {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, { id: string; status: TodoStatus }>({
    mutationFn: ({ id, status }) => updateTodoStatus(id, status),
    retry: false,

    onSuccess: (updatedTodo) => {
      const todos = queryClient.getQueryData<Todo[]>(queryKey.all) ?? [];
      queryClient.setQueryData(
        queryKey.all,
        todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    },
  });
}


export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTodo,
    retry: false,

    onSuccess: (_, id) => {
      const todos = queryClient.getQueryData<Todo[]>(queryKey.all) ?? [];
      queryClient.setQueryData(
        queryKey.all,
        todos.filter((todo) => todo.id !== id)
      );
    },
  });
}

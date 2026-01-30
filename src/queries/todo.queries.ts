import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKey } from "./querykey";

import type {
  Todo,
  CreateTodoInput,
  TodoStatus,
} from "@/store/todo/todo.types";

import {
  readTodos,
  createTodo,
  updateTodoStatus,
  deleteTodo,
} from "@/services/todo.api";



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

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    retry: false,

    onMutate: (input) => {
      const todos =
        queryClient.getQueryData<Todo[]>(queryKey.all) ?? [];

      const optimisticTodo: Todo = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        status: "in-progress",
        completed: false,
        created: new Date(),
        endDate: input.endDate ?? null,
      };

      queryClient.setQueryData<Todo[]>(queryKey.all, [
        ...todos,
        optimisticTodo,
      ]);

      return { todos };
    },

    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKey.all, ctx?.todos);
    },
  });
}



export function useUpdateTodoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: TodoStatus;
    }) => updateTodoStatus(id, status),

    retry: false,

    onMutate: ({ id, status }) => {
      const todos =
        queryClient.getQueryData<Todo[]>(queryKey.all) ?? [];

      queryClient.setQueryData<Todo[]>(queryKey.all, () =>
        todos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                status,
                completed: status === "completed",
              }
            : todo
        )
      );

      return { todos };
    },

    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKey.all, ctx?.todos);
    },
  });
}



export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    retry: false,
    onMutate: (id) => {
      const todos =
        queryClient.getQueryData<Todo[]>(queryKey.all) ?? [];

      queryClient.setQueryData<Todo[]>(queryKey.all, () =>
        todos.filter((t) => t.id !== id)
      );

      return { todos };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(queryKey.all, ctx?.todos);
    },
  });
}

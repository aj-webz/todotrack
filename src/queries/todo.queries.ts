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
    staleTime: Infinity,
  });
}


export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKey.all });

      const previousTodos =
        queryClient.getQueryData<Todo[]>(queryKey.all) ?? [];

      const optimisticTodo: Todo = {
        ...input,
        id: crypto.randomUUID(),
        status: "in-progress",
        completed: false,
        created: new Date(),
        endDate: null,
      };

      queryClient.setQueryData<Todo[]>(queryKey.all, [
        ...previousTodos,
        optimisticTodo,
      ]);

      return { previousTodos };
    },

    onError: (_err, _input, context) => {
      queryClient.setQueryData(queryKey.all, context?.previousTodos);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
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

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKey.all });

      const previousTodos =
        queryClient.getQueryData<Todo[]>(queryKey.all);

      queryClient.setQueryData<Todo[]>(queryKey.all, (old) =>
        old?.map((todo) =>
          todo.id === id
            ? { ...todo, status, completed: status === "completed" }
            : todo
        )
      );

      return { previousTodos };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey.all, context?.previousTodos);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}


export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKey.all });

      const previousTodos =
        queryClient.getQueryData<Todo[]>(queryKey.all);

      queryClient.setQueryData<Todo[]>(queryKey.all, (old) =>
        old?.filter((todo) => todo.id !== id)
      );

      return { previousTodos };
    },

    onError: (_err, _id, context) => {
      queryClient.setQueryData(queryKey.all, context?.previousTodos);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.all });
    },
  });
}

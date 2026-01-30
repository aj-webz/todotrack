"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { format } from "date-fns";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import type { Todo, TodoStatus } from "@/store/todo/todo.types";

import {
  useTodoQuery,
  useUpdateTodoStatus,
  useDeleteTodo,
} from "@/queries/todo.queries";

import { useQueryClient } from "@tanstack/react-query";
import { queryKey } from "@/queries/querykey";

const statusColumn: {
  id: TodoStatus;
  label: string;
  headerColor: string;
  borderColor: string;
  badgeColor: string;
}[] = [
  {
    id: "in-progress",
    label: "In Progress",
    headerColor: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900",
    borderColor: "border-blue-400",
    badgeColor: "bg-blue-600 text-white",
  },
  {
    id: "completed",
    label: "Completed",
    headerColor: "bg-gradient-to-r from-green-50 to-green-100 text-green-900",
    borderColor: "border-green-400",
    badgeColor: "bg-green-600 text-white",
  },
];

export const KanbanBoard = () => {
  const { data: todos = [] } = useTodoQuery();
  const updateTodoStatus = useUpdateTodoStatus();
  const deleteTodo = useDeleteTodo();
  const queryClient = useQueryClient();

  const todosByStatus = statusColumn.reduce(
    (acc, col) => {
      acc[col.id] = todos.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<TodoStatus, Todo[]>
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId as TodoStatus;
    const destStatus = result.destination.droppableId as TodoStatus;

    if (sourceStatus === destStatus) return;

    const todoId = result.draggableId.replace("todo-", "");


    queryClient.setQueryData<Todo[]>(queryKey.all, (old = []) =>
      old.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              status: destStatus,
              completed: destStatus === "completed",
            }
          : todo
      )
    );

    updateTodoStatus.mutate({
      id: todoId,
      status: destStatus,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible">
        {statusColumn.map((column) => (
          <Card
            key={column.id}
            className="flex flex-col bg-white rounded-xl min-w-[90vw] sm:min-w-[70vw] md:min-w-0 shadow-sm border"
          >
            <CardHeader
              className={cn(
                "shadow sticky top-0 z-10 p-8 rounded-xl",
                column.headerColor
              )}
            >
              <CardTitle className="flex items-center justify-between text-sm md:text-xl font-semibold">
                {column.label}
                <span
                  className={cn("text-xs p-2 rounded-sm", column.badgeColor)}
                >
                  {todosByStatus[column.id].length}
                </span>
              </CardTitle>
            </CardHeader>

            <Droppable droppableId={column.id}>
              {(provided) => (
                <CardContent
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 space-y-4 p-4 overflow-y-auto"
                >
                  {todosByStatus[column.id].map((todo, index) => (
                    <Draggable
                      key={todo.id}
                      draggableId={`todo-${todo.id}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Card
                            className={cn(
                              "relative bg-white rounded-lg shadow-sm border-l-4",
                              column.borderColor
                            )}
                          >
                            <CardContent className="p-4 space-y-3 text-sm">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">
                                  {todo.title}
                                </h3>
                                <Badge>
                                  {todo.status}
                                </Badge>
                              </div>

                              <p>{todo.description}</p>

                              <div className="text-xs text-neutral-500">
                                Created:{" "}
                                {format(new Date(todo.created), "dd MMM yyyy")}
                              </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteTodo.mutate(todo.id)}
                              >
                                Delete
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </CardContent>
              )}
            </Droppable>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
};

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
  const { isPending } = updateTodoStatus;

  const todosByStatus = statusColumn.reduce(
    (acc, col) => {
      acc[col.id] = todos.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<TodoStatus, Todo[]>
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId;
    const destStatus = result.destination.droppableId;

    if (sourceStatus === destStatus) return;

    const todoId = result.draggableId.replace("todo-", "");
    const newStatus = destStatus as TodoStatus;

    updateTodoStatus.mutate({ id: todoId, status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={isPending ? () => {} : onDragEnd}>
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
              {(provided, snapshot) => (
                <CardContent
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex-1 space-y-4 p-4 overflow-y-auto transition-colors",
                    snapshot.isDraggingOver &&
                      "bg-linear-to-b from-neutral-50 to-neutral-100"
                  )}
                >
                  {todosByStatus[column.id].map((todo, index) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      index={index}
                      borderColor={column.borderColor}
                    />
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

const TodoCard = ({
  todo,
  index,
  borderColor,
}: {
  todo: Todo;
  index: number;
  borderColor: string;
}) => {
  const deleteTodo = useDeleteTodo();

  return (
    <Draggable draggableId={`todo-${todo.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "transition-all",
            snapshot.isDragging && "rotate-1 scale-[1.03]"
          )}
        >
          <Card
            className={cn(
              "relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4",
              borderColor,
              snapshot.isDragging && "shadow-xl"
            )}
          >
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug line-clamp-2">
                  {todo.title}
                </h3>
                <Badge
                  className={cn(
                    "text-[10px] capitalize",
                    todo.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {todo.status}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-neutral-500">
                <span>
                  Created:{" "}
                  {format(new Date(todo.created), "dd MMM yyyy")}
                </span>
                {todo.endDate && (
                  <span>
                    End: {format(new Date(todo.endDate), "dd MMM yyyy")}
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-700 line-clamp-3">
                {todo.description}
              </p>

              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-fit"
                onClick={() => deleteTodo.mutate(todo.id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

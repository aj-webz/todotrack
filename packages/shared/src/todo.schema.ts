
import { z } from "zod";

export const TodoStatusSchema = z.enum(["in-progress", "completed"]);
export type TodoStatus = z.infer<typeof TodoStatusSchema>;

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: TodoStatusSchema,
  completed: z.boolean(),
  created: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
}).refine(
  (data) => (data.status === "completed") === data.completed,
  {
    message: "completed must match status",
    path: ["completed"],
  }
);

export type Todo = z.infer<typeof TodoSchema>;

export const CreateTodoSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().min(10).max(200),
  endDate: z.coerce.date().nullish(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;

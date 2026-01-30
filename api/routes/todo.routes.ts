import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { randomUUID } from "crypto";
import { todos } from "../store/todo.store.js";
import { inputTodoSchema, PatchTodoSchema } from "../schema/todo.schema.js";
import type { Todo } from "../types/todo.types.js";
const routes = new Hono();

routes.get("/", (c) => {
  return c.json(todos);
});


routes.post(
  "/",
  zValidator("json", inputTodoSchema),
  (c) => {
    try {
      const data = c.req.valid("json");

      const todo: Todo = {
        id: randomUUID(),
        title: data.title,
        description: data.description,
        status: "in-progress",
        completed: false,
        created: new Date().toISOString(),
        endDate: data.endDate,
      };

      todos.push(todo);
      return c.json(todo, 201);
    } catch (error) {
      console.error(error);
      return c.json({ message: "Create failed" }, 500);
    }
  }
);


routes.patch(
  "/:id/status",
  zValidator("json", PatchTodoSchema),
  (c) => {
    const { id } = c.req.param();
    const { status } = c.req.valid("json");

    const todo = todos.find((t) => t.id === id);
    if (!todo) return c.json({ message: "Not found" }, 404);

    todo.status = status;
    todo.completed = status === "completed";

    return c.json(todo);
  }
);

routes.delete("/:id", (c) => {
  const { id } = c.req.param();

  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return c.json({ message: "Not found" }, 404);

  todos.splice(index, 1);
  return c.body(null, 204);
});


export default routes;

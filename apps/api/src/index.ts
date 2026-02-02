import { Hono } from "hono";
import { cors } from "hono/cors";
import { nanoid } from "nanoid";
import { z } from "zod";

import {
  TodoSchema,
  CreateTodoSchema,
  TodoStatusSchema,
  type Todo,
} from "@repo/shared";

import { todos } from "./todo.store.js"; 

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);


app.options("*", (c) => c.body(null, 204));


app.get("/", (c) => {
  return c.json(todos);
});


app.post("/", async (c) => {
  const raw = await c.req.json();
  const data = CreateTodoSchema.parse(raw);
  const todo: Todo = TodoSchema.parse({
    id: nanoid(),
    title: data.title,
    description: data.description,
    status: "in-progress",
    completed: false,
    created: new Date(),
    endDate: data.endDate ?? null,
  });

  todos.push(todo);
  return c.json(todo, 201);
});

const UpdateStatusSchema = z.object({
  status: TodoStatusSchema,
});

app.patch("/:id/status", async (c) => {
  const { id } = c.req.param();
  const body = UpdateStatusSchema.parse(await c.req.json());

  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return c.json({ message: "Todo not found" }, 404);
  }

  todo.status = body.status;
  todo.completed = body.status === "completed";

  return c.json(todo);
});


app.delete("/:id", (c) => {
  const { id } = c.req.param();
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return c.json({ message: "Todo not found" }, 404);
  }

  todos.splice(index, 1);
  return c.body(null, 204);
});


export default app;

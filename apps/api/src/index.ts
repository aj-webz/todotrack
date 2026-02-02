import { Hono } from "hono";
import { cors } from "hono/cors";
import { todos } from "./todo.store.js";
import { Todo, TodoStatus } from "@repo/shared";

const app = new Hono();

app.use("*",cors({ origin: ["http://localhost:3000","https://todotrack-web.vercel.app"], allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],allowHeaders: ["Content-Type"],}));

app.options("*",(c)=>{return c.body(null,202)})
const routes = new Hono();

routes.get("/", (c) => c.json(todos));

routes.post("/", async (c) => {
  const data = await c.req.json<Todo>();
  todos.push(data);
  return c.json(data, 201);
});

routes.patch("/:id/status", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<{ status: TodoStatus }>();

  const todo = todos.find((t) => t.id === id);
  if (!todo) return c.json({ message: "Todo not found" }, 404);

  todo.status = body.status;
  todo.completed = body.status === "completed";

  return c.json(todo);
});

routes.delete("/:id", (c) => {
  const { id } = c.req.param();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return c.json({ message: "Todo not found" }, 404);

  todos.splice(index, 1);
  return c.body(null, 204);
});

app.route("/", routes);
export default app;

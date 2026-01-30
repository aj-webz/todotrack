import { Hono } from "hono";
import { cors } from "hono/cors";
import todoRoutes from "./routes/todo.routes.js"; 

const app = new Hono();

app.use("*", cors());
app.route("/api/todos", todoRoutes);

export default app;

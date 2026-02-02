import {
  TodoSchema,
  type Todo,
  type CreateTodoInput,
  type TodoStatus,
} from "@repo/shared";

const baseUrl = "http://localhost:4000";

export async function readTodos(): Promise<Todo[]> {
  const res = await fetch(baseUrl);

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }

  const json = await res.json();

  return TodoSchema.array().parse(json);
}


export async function createTodo(
  input: CreateTodoInput
): Promise<Todo> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`Create failed: ${res.status}`);
  }

  const json = await res.json();

 
  return TodoSchema.parse(json);
}


export async function updateTodoStatus(
  id: string,
  status: TodoStatus
): Promise<Todo> {
  const res = await fetch(`${baseUrl}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`Update failed: ${res.status}`);
  }

  const json = await res.json();

  return TodoSchema.parse(json);
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status}`);
  }
}

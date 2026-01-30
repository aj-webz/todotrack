import type {
  Todo,
  CreateTodoInput,
  TodoStatus,
} from "@/store/todo/todo.types";

const baseUrl = "https://backend-ten-zeta-54.vercel.app";


export async function readTodos(): Promise<Todo[]> {
  try {
    const res = await fetch(baseUrl);

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("readTodos error:", error);
    throw error;
  }
}


export async function createTodo(
  input: CreateTodoInput
): Promise<Todo> {
  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(`Create failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("createTodo error:", error);
    throw error;
  }
}


export async function updateTodoStatus(
  id: string,
  status: TodoStatus
): Promise<Todo> {
  try {
    const res = await fetch(`${baseUrl}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      throw new Error(`Update failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("updateTodoStatus error:", error);
    throw error;
  }
}


export async function deleteTodo(id: string): Promise<void> {
  try {
    const res = await fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Delete failed: ${res.status}`);
    }
  } catch (error) {
    console.error("deleteTodo error:", error);
    throw error;
  }
}

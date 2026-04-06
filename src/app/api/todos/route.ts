import { listTodos, addTodo, toggleTodo, deleteTodo, clearCompletedTodos } from "@/lib/todoStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const todos = await listTodos(50);
    return Response.json({ todos });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string; text?: string; id?: string };
    const { action, text, id } = body;

    if (action === "add" && text) {
      const todo = await addTodo(text);
      return Response.json({ ok: true, todo });
    }

    if (action === "toggle" && id) {
      await toggleTodo(id);
      return Response.json({ ok: true });
    }

    if (action === "delete" && id) {
      await deleteTodo(id);
      return Response.json({ ok: true });
    }

    if (action === "clearCompleted") {
      await clearCompletedTodos();
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

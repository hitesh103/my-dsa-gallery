import { listTags, createTag, deleteTag } from "@/lib/tagStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "topic" | "pattern" | null;
    if (type && !["topic", "pattern"].includes(type)) {
      return Response.json({ error: "Invalid type" }, { status: 400 });
    }
    const tags = await listTags(type ?? undefined);
    return Response.json({ tags });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; type?: string };
    const { name, type } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    if (!type || !["topic", "pattern"].includes(type)) {
      return Response.json({ error: "Type must be 'topic' or 'pattern'" }, { status: 400 });
    }

    const tag = await createTag(name.trim(), type as "topic" | "pattern");
    return Response.json({ ok: true, tag });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");
    if (!idStr) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    await deleteTag(id);
    return Response.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

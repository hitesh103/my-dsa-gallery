import NextLink from "next/link";

import { TodoList } from "@/components/home/TodoList";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-14">
      <section className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Personal workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">My DSA Gallery</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Structured write-ups (statement → intuition → approach → Java code
              → complexity) plus study photos and quick revision notes.
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <NextLink
              href="/problems"
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Problems
            </NextLink>
            <NextLink
              href="/gallery"
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Gallery
            </NextLink>
            <NextLink
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Admin
            </NextLink>
          </div>

          <div className="mt-2 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            Tip: Start from <span className="font-medium text-foreground">Problems</span>, then
            attach study photos + leave comments under each problem for quick revisions.
          </div>
        </div>

        <TodoList />
      </section>
    </main>
  );
}

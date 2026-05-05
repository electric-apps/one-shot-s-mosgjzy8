# Todo App — Plan

A real-time todo app built on TanStack Start + Electric SQL. Users can create, complete, and delete todos, with all changes syncing instantly across clients via Electric shapes.

## User Flows

1. User opens the app and sees the full todo list (synced from Postgres via Electric).
2. User types a task title in the input at the top and presses Enter or clicks "Add" to create a new todo.
3. User clicks the checkbox next to a todo to toggle its `completed` state.
4. User clicks the delete (×) button on a todo to permanently remove it.
5. User clicks the "All / Active / Completed" filter tabs to narrow the visible list.
6. The footer shows a count of remaining active todos and a "Clear completed" button.

## Data Model

```ts
// src/db/schema.ts
export const todos = pgTable("todos", {
  id:          text("id").primaryKey(),
  title:       text("title").notNull(),
  completed:   boolean("completed").notNull().default(false),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

## Key Technical Decisions

- **Sync**: Electric shape proxy at `GET /api/todos` streams the `todos` table to the client. No pagination needed for a typical todo list.
- **Collection**: a single `todosCollection` in `src/db/collections/todos.ts` subscribes to the shape and exposes `insert`, `update`, `delete`.
- **Mutations**: three server-side handlers on the same file route (`POST /api/todos`, `PUT /api/todos`, `DELETE /api/todos`) write directly to Postgres via Drizzle; Electric syncs the result back.
- **IDs**: generate client-side UUIDs (`crypto.randomUUID()`) so optimistic inserts can reference the row immediately.
- **SSR**: the index route sets `ssr: false` (it uses `useLiveQuery`).
- **Filtering**: client-side only — filter state is local React state, no server round-trip.
- **Styling**: Tailwind 4 utility classes; use shadcn `Button`, `Input`, `Checkbox` components where available.

## Implementation Phases

### Phase 1 — Schema & Migrations
- [ ] Add `todos` pgTable to `src/db/schema.ts`.
- [ ] Derive Zod schemas in `src/db/zod-schemas.ts` (`insertTodoSchema`, `updateTodoSchema`).
- [ ] Run `drizzle-kit generate && drizzle-kit migrate` to create the `todos` table.

### Phase 2 — Collections & API Routes
- [ ] Create `src/db/collections/todos.ts` — TanStack DB collection backed by the Electric shape at `/api/todos`.
- [ ] Create `src/routes/api/todos.ts` with:
  - `GET` — Electric shape proxy (forward to Electric Cloud with secret injection).
  - `POST` — insert a new todo row via Drizzle; validate with `insertTodoSchema`.
  - `PUT` — update `completed` or `title` of an existing todo; validate with `updateTodoSchema`.
  - `DELETE` — delete a todo by `id`.

### Phase 3 — UI
- [ ] Update `src/routes/index.tsx`:
  - Set `ssr: false`.
  - Import `todosCollection` and query with `useLiveQuery`.
  - Render:
    - **Header**: app title.
    - **Input bar**: controlled text input + "Add" button; on submit, call `todosCollection.insert(...)` with a client-generated UUID then POST to `/api/todos`.
    - **Filter tabs**: "All", "Active", "Completed" — local state drives a `filteredTodos` derived value.
    - **Todo list**: map over `filteredTodos`; each row has a `Checkbox` (toggle completed), title text, and a delete `×` button. Wrap row in `<div>` (not `<button>`) to avoid nested-interactive-element hydration errors.
    - **Footer**: active count label + "Clear completed" button (calls DELETE for each completed todo).
- [ ] Apply Tailwind classes for a clean, centered, max-w-lg layout.

### Phase 4 — Build & Verify
- [ ] Run `pnpm run build` and confirm no TypeScript or Vite errors.
- [ ] Run `node scripts/preflight.mjs` and fix any SSR-safety warnings.
- [ ] Smoke-test in the dev server: create, complete, delete a todo; verify filter tabs work.

### Phase 5 — Tests
- [ ] Add `tests/todos.test.ts`:
  - Schema test: `generateValidRow` produces a row that passes `insertTodoSchema`.
  - Schema test: row missing `title` fails validation.
  - Optionally: API route unit test for POST handler (Vitest + mock Drizzle client).

### Phase 6 — README
- [ ] Update `README.md` with:
  - One-paragraph app description.
  - Setup steps: `pnpm install`, copy `.env.example` to `.env`, fill in vars, run migrations, `pnpm dev`.
  - Screenshot placeholder.

### Phase 7 — Deploy
- [ ] Confirm `DATABASE_URL`, `ELECTRIC_SOURCE_ID`, `ELECTRIC_SECRET` are documented in `.env.example`.
- [ ] Verify `pnpm build` produces a deployable output.

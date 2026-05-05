# Todo App

A real-time todo app built on TanStack Start + Electric SQL. Create, complete, and delete todos with all changes syncing instantly across clients via Electric shapes.

## Features

- Add todos with a title
- Toggle completion with a checkbox
- Delete individual todos
- Filter by All / Active / Completed
- Footer showing active count and a "Clear completed" button
- Optimistic updates with Electric SQL sync reconciliation

## Setup

```bash
pnpm install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `ELECTRIC_SOURCE_ID` | Electric Cloud source ID |
| `ELECTRIC_SECRET` | Electric Cloud auth secret |

Run migrations:

```bash
pnpm migrate
```

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:5174](http://localhost:5174).

## Screenshot

<!-- Add screenshot here -->

## Tech Stack

- **Framework**: TanStack Start (React, SSR, file-based routing)
- **Sync**: Electric SQL shapes → TanStack DB collections → `useLiveQuery`
- **Database**: Postgres via Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI Themes

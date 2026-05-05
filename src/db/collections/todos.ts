import { createCollection } from "@tanstack/react-db"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { absoluteApiUrl } from "@/lib/client-url"
import { todoSelectSchema } from "@/db/zod-schemas"

export const todosCollection = createCollection(
	electricCollectionOptions({
		id: "todos",
		schema: todoSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: absoluteApiUrl("/api/todos"),
			parser: {
				timestamptz: (date: string) => new Date(date),
			},
		},
		onInsert: async ({ transaction }) => {
			const { modified: todo } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(todo),
			})
			const data = await res.json()
			return { txid: data.txid }
		},
		onUpdate: async ({ transaction }) => {
			const { modified: todo } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(todo),
			})
			const data = await res.json()
			return { txid: data.txid }
		},
		onDelete: async ({ transaction }) => {
			const { original: todo } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: todo.id }),
			})
			const data = await res.json()
			return { txid: data.txid }
		},
	}),
)

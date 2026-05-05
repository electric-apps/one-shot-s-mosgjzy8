import { createFileRoute } from "@tanstack/react-router"
import { proxyElectricRequest } from "@/lib/electric-proxy"
import { db } from "@/db"
import { todos } from "@/db/schema"
import { todoInsertSchema, updateTodoSchema } from "@/db/zod-schemas"
import { parseDates, generateTxId } from "@/db/utils"
import { eq } from "drizzle-orm"

export const Route = createFileRoute("/api/todos")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				return proxyElectricRequest(request, "todos")
			},

			POST: async ({ request }) => {
				const body = parseDates(await request.json())
				const parsed = todoInsertSchema.parse(body)

				const result = await db.transaction(async (tx) => {
					const [row] = await tx.insert(todos).values(parsed).returning()
					const txid = await generateTxId(tx)
					return { id: row.id, txid }
				})

				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json" },
				})
			},

			PUT: async ({ request }) => {
				const body = parseDates(await request.json())
				const { id, ...rest } = updateTodoSchema.parse(body)

				const result = await db.transaction(async (tx) => {
					await tx.update(todos).set(rest).where(eq(todos.id, id))
					const txid = await generateTxId(tx)
					return { txid }
				})

				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json" },
				})
			},

			DELETE: async ({ request }) => {
				const { id } = await request.json()

				const result = await db.transaction(async (tx) => {
					await tx.delete(todos).where(eq(todos.id, id))
					const txid = await generateTxId(tx)
					return { txid }
				})

				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json" },
				})
			},
		},
	},
})

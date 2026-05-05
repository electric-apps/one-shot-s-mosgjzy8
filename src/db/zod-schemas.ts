import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import { todos } from "./schema"

export const todoSelectSchema = createSelectSchema(todos)
export const todoInsertSchema = createInsertSchema(todos)
export const updateTodoSchema = todoInsertSchema.partial().required({ id: true })

export type Todo = {
	id: string
	title: string
	completed: boolean
	createdAt: Date
}

export type NewTodo = {
	id: string
	title: string
	completed?: boolean | undefined
	createdAt?: Date | undefined
}

export type UpdateTodo = {
	id: string
	title?: string | undefined
	completed?: boolean | undefined
	createdAt?: Date | undefined
}

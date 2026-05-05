import { describe, it, expect } from "vitest"
import { generateValidRow, generateRowWithout } from "./helpers/schema-test-utils"
import { todoInsertSchema } from "@/db/zod-schemas"

describe("todos schema", () => {
	it("generateValidRow produces a row that passes insertTodoSchema", () => {
		const row = generateValidRow(todoInsertSchema as any)
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("row missing title fails insertTodoSchema validation", () => {
		const row = generateRowWithout(todoInsertSchema as any, "title")
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("row missing id fails insertTodoSchema validation", () => {
		const row = generateRowWithout(todoInsertSchema as any, "id")
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("completed defaults to false when not provided", () => {
		const row = {
			id: crypto.randomUUID(),
			title: "test todo",
		}
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})
})

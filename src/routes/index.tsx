import { createFileRoute } from "@tanstack/react-router"
import { useLiveQuery } from "@tanstack/react-db"
import { useState } from "react"
import { todosCollection } from "@/db/collections/todos"

export const Route = createFileRoute("/")({ ssr: false, component: App })

type Filter = "all" | "active" | "completed"

function App() {
	const [newTitle, setNewTitle] = useState("")
	const [filter, setFilter] = useState<Filter>("all")

	const { data: allTodos = [] } = useLiveQuery((q) =>
		q.from({ todo: todosCollection }).orderBy(({ todo }) => todo.createdAt, "asc"),
	)

	const filteredTodos = allTodos.filter((t) => {
		if (filter === "active") return !t.completed
		if (filter === "completed") return t.completed
		return true
	})

	const activeCount = allTodos.filter((t) => !t.completed).length
	const completedCount = allTodos.filter((t) => t.completed).length

	const handleAdd = () => {
		const title = newTitle.trim()
		if (!title) return
		todosCollection.insert({
			id: crypto.randomUUID(),
			title,
			completed: false,
			createdAt: new Date(),
		})
		setNewTitle("")
	}

	const handleToggle = (id: string, completed: boolean) => {
		todosCollection.update(id, (draft) => {
			draft.completed = !completed
		})
	}

	const handleDelete = (id: string) => {
		todosCollection.delete(id)
	}

	const handleClearCompleted = () => {
		for (const todo of allTodos) {
			if (todo.completed) todosCollection.delete(todo.id)
		}
	}

	return (
		<div className="flex min-h-svh items-start justify-center bg-gray-50 pt-16">
			<div className="w-full max-w-lg px-4">
				<h1 className="mb-6 text-center text-4xl font-thin text-gray-600">todos</h1>

				{/* Input bar */}
				<div className="mb-1 flex gap-2 rounded-md bg-white shadow">
					<input
						className="flex-1 rounded-md px-4 py-3 text-base outline-none placeholder:text-gray-400"
						placeholder="What needs to be done?"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAdd()}
					/>
					<button
						className="rounded-r-md bg-blue-500 px-4 text-sm font-medium text-white hover:bg-blue-600 active:bg-blue-700"
						onClick={handleAdd}
					>
						Add
					</button>
				</div>

				{allTodos.length > 0 && (
					<div className="rounded-md bg-white shadow">
						{/* Filter tabs */}
						<div className="flex border-b border-gray-100 px-3 py-2 gap-1">
							{(["all", "active", "completed"] as Filter[]).map((f) => (
								<button
									key={f}
									className={`rounded px-3 py-1 text-sm capitalize ${
										filter === f
											? "border border-gray-300 text-gray-700"
											: "text-gray-500 hover:text-gray-700"
									}`}
									onClick={() => setFilter(f)}
								>
									{f}
								</button>
							))}
						</div>

						{/* Todo list */}
						<ul>
							{filteredTodos.map((todo) => (
								<li
									key={todo.id}
									className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
								>
									<input
										type="checkbox"
										checked={todo.completed}
										onChange={() => handleToggle(todo.id, todo.completed)}
										className="h-5 w-5 cursor-pointer accent-green-500"
									/>
									<span
										className={`flex-1 text-base ${todo.completed ? "text-gray-400 line-through" : "text-gray-800"}`}
									>
										{todo.title}
									</span>
									<button
										className="text-gray-300 hover:text-red-400 text-lg leading-none"
										onClick={(e) => {
											e.stopPropagation()
											handleDelete(todo.id)
										}}
										aria-label="Delete todo"
									>
										×
									</button>
								</li>
							))}
						</ul>

						{/* Footer */}
						<div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500">
							<span>{activeCount} item{activeCount !== 1 ? "s" : ""} left</span>
							{completedCount > 0 && (
								<button
									className="hover:text-gray-700"
									onClick={handleClearCompleted}
								>
									Clear completed
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

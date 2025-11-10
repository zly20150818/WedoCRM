"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, SortAsc, SortDesc } from "lucide-react"
import { PROJECT_STAGES, getStagePercent } from "@/components/config/project-workflow"

type ProjectRow = {
	id: string
	project_number: string
	name: string
	customer_name: string | null
	status: string | null
	stage: string | null
	probability: number | null
	expected_close_date: string | null
	notes: string | null
	created_at: string
}

const PAGE_SIZE = 24

export default function ProjectsPage() {
	const router = useRouter()
	const supabase = createClient()

	const [projects, setProjects] = useState<ProjectRow[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")
	const [sortField, setSortField] = useState<"expected_close_date" | "name" | "created_at">(
		"created_at",
	)
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)

	useEffect(() => {
		void loadData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, sortField, sortDir, page])

	const loadData = async () => {
		setLoading(true)
		try {
			let query = supabase
				.from("projects")
				.select(
					"id, project_number, name, customer_name, status, stage, probability, expected_close_date, notes, created_at",
					{ count: "exact" },
				)

			if (search) {
				query = query.or(
					`name.ilike.%${search}%,customer_name.ilike.%${search}%,project_number.ilike.%${search}%`,
				)
			}

			query = query.order(sortField, { ascending: sortDir === "asc" })

			const from = (page - 1) * PAGE_SIZE
			const to = from + PAGE_SIZE - 1
			query = query.range(from, to)

			const { data, error, count } = await query
			if (error) throw error
			setProjects((data as ProjectRow[]) || [])
			setTotalCount(count || 0)
		} catch (err) {
			console.error("Failed to load projects:", err)
		} finally {
			setLoading(false)
		}
	}

	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

	const displayed = useMemo(() => projects, [projects])

	const statusBadgeClass = (status?: string | null) => {
		const s = (status || "").toLowerCase()
		if (s.includes("overdue")) return "bg-red-100 text-red-700"
		if (s.includes("risk") || s.includes("at risk")) return "bg-yellow-100 text-yellow-700"
		if (s.includes("hold")) return "bg-indigo-100 text-indigo-700"
		if (s.includes("track") || s.includes("active") || s.includes("in progress"))
			return "bg-green-100 text-green-700"
		return "bg-gray-100 text-gray-700"
	}

	const formatDate = (iso?: string | null) => {
		if (!iso) return "TBD"
		try {
			const d = new Date(iso)
			return d.toLocaleDateString()
		} catch {
			return "TBD"
		}
	}

	const ProgressBar = ({ value }: { value: number }) => {
		const clamped = Math.max(0, Math.min(100, value))
		return (
			<div className="w-full h-2.5 rounded-full bg-gray-100">
				<div
					className="h-2.5 rounded-full bg-blue-500 transition-all"
					style={{ width: `${clamped}%` }}
				/>
			</div>
		)
	}

	const progressFromStage = (s?: string | null) => getStagePercent(s || undefined)

	return (
		<MainLayout>
			<div className="p-8">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold">Projects</h1>
					<Button className="gap-2" onClick={() => router.push("/projects/new")}>
						<Plus className="h-4 w-4" />
						New Project
					</Button>
				</div>

				<div className="bg-white rounded-lg shadow p-4 mb-6">
					<div className="flex flex-wrap gap-3 items-center">
						<div className="relative flex-1 min-w-[240px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search projects..."
								value={search}
								onChange={(e) => {
									setPage(1)
									setSearch(e.target.value)
								}}
								className="pl-9"
							/>
						</div>
						<div className="flex items-center gap-2 ml-auto">
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => {
									setSortField("name")
									setSortDir(sortDir === "asc" ? "desc" : "asc")
								}}
								title="Sort by name"
							>
								{sortDir === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
								Name
							</Button>
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => {
									setSortField("expected_close_date")
									setSortDir(sortDir === "asc" ? "desc" : "asc")
								}}
								title="Sort by due date"
							>
								{sortDir === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
								Due
							</Button>
							<Button variant="outline" className="gap-2" disabled>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</div>
				</div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{/* Add New Project tile */}
					<div
						onClick={() => router.push("/projects/new")}
						className="cursor-pointer rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 transition-colors p-6 flex flex-col items-center justify-center min-h-[180px] bg-white"
					>
						<div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
							<Plus className="h-5 w-5" />
						</div>
						<div className="text-sm text-gray-600">Add New Project</div>
					</div>

					{loading && Array.from({ length: 8 }).map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="rounded-xl border bg-white p-6 animate-pulse min-h-[180px]"
						>
							<div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
							<div className="h-3 w-24 bg-gray-200 rounded mb-4" />
							<div className="h-3 w-full bg-gray-200 rounded mb-2" />
							<div className="h-3 w-5/6 bg-gray-200 rounded mb-4" />
							<div className="h-2.5 w-full bg-gray-200 rounded mb-2" />
							<div className="flex justify-between mt-3">
								<div className="h-3 w-24 bg-gray-200 rounded" />
								<div className="h-3 w-24 bg-gray-200 rounded" />
							</div>
						</div>
					))}

					{!loading &&
						displayed.map((p) => {
							const percent = progressFromStage(p.stage)
							return (
							<div
								key={p.id}
								className="rounded-xl border bg-white p-6 cursor-pointer hover:shadow-md transition-shadow"
								onClick={() => router.push(`/projects/${p.id}`)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault()
										router.push(`/projects/${p.id}`)
									}
								}}
							>
									<div className="flex items-start justify-between gap-3">
										<div>
											<div className="text-base font-semibold leading-6">{p.name}</div>
											<div className="text-xs text-gray-500 mt-0.5">{p.customer_name}</div>
										</div>
										<Badge className={statusBadgeClass(p.status)}>
											{p.status || "—"}
										</Badge>
									</div>
									<p className="text-sm text-gray-600 mt-3 line-clamp-2">
										{p.notes || "No description"}
									</p>

									<div className="mt-4">
										<ProgressBar value={percent} />
									</div>

									<div className="mt-3 flex items-center justify-between text-xs text-gray-600">
										<div>{percent}% Complete</div>
										<div>
											Due: <span className="font-medium text-gray-800">{formatDate(p.expected_close_date)}</span>
										</div>
									</div>
								</div>
							)
						})}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-3 mt-8">
						<Button
							variant="outline"
							disabled={page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Prev
						</Button>
						<div className="text-sm text-gray-600">
							Page <span className="font-medium text-gray-800">{page}</span> / {totalPages}
						</div>
						<Button
							variant="outline"
							disabled={page >= totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						>
							Next
						</Button>
					</div>
				)}
			</div>
		</MainLayout>
	)
}



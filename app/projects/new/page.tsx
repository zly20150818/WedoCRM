"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { PROJECT_STAGES, PROJECT_STATUSES, getStagePercent } from "@/components/config/project-workflow"

export default function NewProjectPage() {
	const router = useRouter()
	const supabase = createClient()
	const { user } = useAuth()

	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// basic fields to match list page usage
	const [name, setName] = useState("")
	const [customerId, setCustomerId] = useState<string>("")
	const [customerName, setCustomerName] = useState<string>("")
	const [status, setStatus] = useState<string>(PROJECT_STATUSES[0])
	const [stage, setStage] = useState<string>(PROJECT_STAGES[0].value)
	// progress derived from stage position
	const probability = getStagePercent(stage)
	const [expectedCloseDate, setExpectedCloseDate] = useState<string>("")
	const [notes, setNotes] = useState("")

	const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])

	useEffect(() => {
		const loadCustomers = async () => {
			const { data, error } = await supabase
				.from("customers")
				.select("id,name")
				.order("name", { ascending: true })
				.limit(200)
			if (!error && data) {
				setCustomers(data as any)
			}
		}
		void loadCustomers()
	}, [supabase])

	const canSubmit = name.trim().length > 0 && customerId.trim().length > 0

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!canSubmit) return
		setSubmitting(true)
		setError(null)
		try {
			const owner = user?.id || null
			const createdBy = user?.id || null
			const { data, error } = await supabase.from("projects").insert({
				name,
				customer_id: customerId,
				customer_name: customerName,
				status,
				stage,
				probability,
				expected_close_date: expectedCloseDate || null,
				notes: notes || null,
				// minimal required fields in schema; fallback placeholders
				project_number: `PRJ-${Date.now()}`,
				owner_id: owner,
				created_by: createdBy,
			}).select("id").single()
			if (error) throw error
			const id = data?.id
			// after create, go back to projects list for now
			router.push("/projects")
			// optional: router.refresh()
		} catch (err: any) {
			setError(err?.message || "Failed to create project")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<MainLayout>
			<div className="p-8 max-w-3xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={() => router.back()} className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>
						<h1 className="text-2xl font-bold">New Project</h1>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Project Name</label>
							<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., UK Expansion" />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Customer</label>
							<Select
								value={customerId}
								onValueChange={(val) => {
									setCustomerId(val)
									const found = customers.find((c) => c.id === val)
									setCustomerName(found?.name || "")
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select customer" />
								</SelectTrigger>
								<SelectContent>
									{customers.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Status</label>
							<Select value={status} onValueChange={(val) => setStatus(val)}>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									{PROJECT_STATUSES.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Stage</label>
							<Select
								value={stage}
								onValueChange={(val) => {
									setStage(val)
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select stage" />
								</SelectTrigger>
								<SelectContent>
									{PROJECT_STAGES.map((s) => (
										<SelectItem key={s.value} value={s.value}>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Due Date</label>
							<Input
								type="date"
								value={expectedCloseDate}
								onChange={(e) => setExpectedCloseDate(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Project Number (auto)</label>
							<Input value="Auto generated on save" disabled />
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Notes</label>
						<Textarea
							placeholder="Short description or context..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
					</div>

					{error && (
						<div className="text-sm text-red-600">
							{error}
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<Button type="button" variant="outline" onClick={() => router.push("/projects")}>
							Cancel
                        </Button>
						<Button type="submit" className="gap-2" disabled={!canSubmit || submitting}>
							<Save className="h-4 w-4" />
							{ submitting ? "Saving..." : "Create Project" }
						</Button>
					</div>
				</form>

			</div>
		</MainLayout>
	)
}



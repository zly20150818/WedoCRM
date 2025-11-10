import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import OverviewTab from "./_components/overview-tab"
import TasksTab from "./_components/tasks-tab"
import DocumentsTab, { type ProjectDocument } from "./_components/documents-tab"
import FinancialsTab from "./_components/financials-tab"

type Project = {
  id: string
  project_number: string
  name: string
  customer_id: string
  customer_name: string
  status: string | null
  stage: string | null
  probability: number | null
  expected_close_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

type Customer = {
  id: string
  name: string
  email: string | null
  phone: string | null
  primary_contact: string | null
}

function formatSize(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

async function loadData(id: string) {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>()

  if (error || !project) return { project: null, customer: null, documents: [] as ProjectDocument[] }

  const { data: customer } = await supabase
    .from("customers")
    .select("id,name,email,phone,primary_contact")
    .eq("id", project.customer_id)
    .single<Customer>()

  // Load project documents from generic files table
  const { data: fileRows } = await supabase
    .from("files")
    .select("id,name,path,size,created_at")
    .eq("scope", "project")
    .eq("ref_id", project.id)
    .order("created_at", { ascending: false })

  // Generate signed URLs for private documents bucket
  const documents: ProjectDocument[] = await Promise.all(
    (fileRows || []).map(async (f: any) => {
      // Generate a signed URL for the private document (valid for 1 hour)
      const { data: signedUrlData } = await supabase.storage
        .from("documents")
        .createSignedUrl(f.path, 3600)

      return {
        id: f.id,
        name: f.name,
        size: typeof f.size === "number" ? formatSize(f.size) : `${f.size || ""}`,
        uploadedAt: f.created_at,
        downloadUrl: signedUrlData?.signedUrl || undefined,
      } as ProjectDocument
    })
  )

  return { project, customer: customer || null, documents }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { project, customer, documents } = await loadData(params.id)
  if (!project) return notFound()

  const statusText = project.status || "Unknown"

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant="secondary">{statusText}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Track and manage all details related to this project.
            </p>
          </div>
          <div className="shrink-0">
            <Link href={`/projects/${project.id}/edit`}>
              <Button>Edit Project</Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab project={project} customer={customer} />
          </TabsContent>
          <TabsContent value="tasks" className="mt-6">
            <TasksTab />
          </TabsContent>
          <TabsContent value="documents" className="mt-6">
            <DocumentsTab projectId={project.id} documents={documents} />
          </TabsContent>
          <TabsContent value="financials" className="mt-6">
            <FinancialsTab />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}



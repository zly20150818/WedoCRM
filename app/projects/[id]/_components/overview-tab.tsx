import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Project = {
  id: string
  project_number: string
  name: string
  customer_id: string
  customer_name: string
  expected_close_date: string | null
  notes: string | null
}

type Customer = {
  id: string
  name: string
  email: string | null
  phone: string | null
  primary_contact: string | null
} | null

export default function OverviewTab({ project, customer }: { project: Project; customer: Customer }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-xs text-muted-foreground">Project ID</div>
                <div className="mt-1">{project.project_number}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Project Manager</div>
                <div className="mt-1">—</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Start Date</div>
                <div className="mt-1">—</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">End Date</div>
                <div className="mt-1">
                  {project.expected_close_date ? new Date(project.expected_close_date).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">
              {project.notes || "No description."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Company Name</div>
                <div className="mt-1">{project.customer_name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Contact Person</div>
                <div className="mt-1">{customer?.primary_contact || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email Address</div>
                <div className="mt-1">{customer?.email || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                <div className="mt-1">{customer?.phone || "—"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



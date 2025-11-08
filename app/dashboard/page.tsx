"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName} {user?.lastName}!
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>This is a base template dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is a clean template with authentication, layout, and basic navigation already set up.
              </p>
              <p className="text-sm text-muted-foreground">
                You can start building your own features by adding components and pages to this foundation.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Template Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Supabase Authentication</li>
                  <li>Responsive Layout with Sidebar & Header</li>
                  <li>Theme Support (Light/Dark)</li>
                  <li>Multi-language Support (EN/ZH)</li>
                  <li>Protected Routes</li>
                  <li>User Profile Management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">User Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.email}</div>
              <p className="text-xs text-muted-foreground mt-1">Current user email</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.role || "User"}</div>
              <p className="text-xs text-muted-foreground mt-1">Current user role</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground mt-1">Authentication status</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

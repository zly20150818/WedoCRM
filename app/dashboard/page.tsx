"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Briefcase,
  Users,
  CheckSquare,
  DollarSign,
  ChevronRight,
  Calendar,
  Plus,
  AlertCircle,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// 统计数据
const statsData = [
  {
    label: "Active Projects",
    value: "24",
    icon: Briefcase,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    label: "New Customers",
    value: "8",
    icon: Users,
    iconColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    label: "Pending Tasks",
    value: "12",
    icon: CheckSquare,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    label: "Revenue",
    value: "$1.2M",
    icon: DollarSign,
    iconColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
]

// 收入图表数据
const revenueData = [
  { month: "Jan", value: 120000 },
  { month: "Feb", value: 190000 },
  { month: "Mar", value: 150000 },
  { month: "Apr", value: 180000 },
  { month: "May", value: 220000 },
  { month: "Jun", value: 250000 },
  { month: "Jul", value: 280000 },
  { month: "Aug", value: 240000 },
  { month: "Sep", value: 270000 },
  { month: "Oct", value: 300000 },
  { month: "Nov", value: 320000 },
  { month: "Dec", value: 350000 },
]

// 最近项目数据
const recentProjects = [
  {
    name: "Q4 Shipment for Acme Corp",
    pid: "PID-00432",
    customer: "Acme Corporation",
    status: "In Progress",
    statusColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    value: "$245,000",
  },
  {
    name: "Annual Supply Agreement",
    pid: "PID-00398",
    customer: "Global Trade Co.",
    status: "Completed",
    statusColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    value: "$1.2M",
  },
  {
    name: "Prototype Development",
    pid: "PID-00415",
    customer: "Tech Innovations Ltd.",
    status: "Planning",
    statusColor: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    value: "$89,500",
  },
  {
    name: "Custom Components",
    pid: "PID-00387",
    customer: "Precision Manufacturing",
    status: "In Progress",
    statusColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    value: "$320,000",
  },
]

// 最近活动数据
const recentActivities = [
  {
    title: "New project created: Q4 Shipment for Acme Corp",
    time: "2 hours ago",
    color: "bg-primary",
  },
  {
    title: "Quotation #QT-2024-089 approved by Acme Corp",
    time: "4 hours ago",
    color: "bg-green-500",
  },
  {
    title: "Purchase order #PO-2024-105 sent to supplier",
    time: "Yesterday",
    color: "bg-blue-500",
  },
  {
    title: "New lead: Tech Innovations Ltd.",
    time: "Dec 12, 2024",
    color: "bg-yellow-500",
  },
  {
    title: "Contract signed for Annual Supply Agreement",
    time: "Dec 10, 2024",
    color: "bg-purple-500",
  },
]

// 即将到来的任务
const upcomingTasks = [
  {
    title: "Follow up with Acme Corp on shipment status",
    due: "Due today",
    icon: AlertCircle,
    iconColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    title: "Send quotation for prototype development",
    due: "Due tomorrow",
    icon: Clock,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    title: "Project review meeting with Global Trade Co.",
    due: "Dec 18, 2024",
    icon: CalendarIcon,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const userName = user?.firstName || "John"

  return (
    <MainLayout>
      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-3xl font-bold leading-tight tracking-tight">Dashboard</h1>
            <p className="text-sm font-normal leading-normal text-muted-foreground">
              Welcome back, {userName}. Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last 30 Days</span>
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="rounded-xl border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("flex size-12 items-center justify-center rounded-full", stat.bgColor)}>
                      <Icon className={cn("text-xl", stat.iconColor)} />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-normal leading-normal text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold leading-tight tracking-[-0.015em]">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Revenue Chart */}
            <Card className="rounded-xl border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold leading-tight tracking-[-0.015em]">
                  Revenue Overview
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                  <span>View Report</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        className="text-xs text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        className="text-xs text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="rounded-xl border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold leading-tight tracking-[-0.015em]">
                  Recent Projects
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left py-3 font-semibold">Project</TableHead>
                        <TableHead className="text-left py-3 font-semibold">Customer</TableHead>
                        <TableHead className="text-left py-3 font-semibold">Status</TableHead>
                        <TableHead className="text-right py-3 font-semibold">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentProjects.map((project, index) => (
                        <TableRow
                          key={project.pid}
                          className={cn(
                            "border-b border-border",
                            index === recentProjects.length - 1 && "border-b-0"
                          )}
                        >
                          <TableCell className="py-4">
                            <p className="font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.pid}</p>
                          </TableCell>
                          <TableCell className="py-4">{project.customer}</TableCell>
                          <TableCell className="py-4">
                            <Badge className={cn("rounded-full", project.statusColor)} variant="outline">
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-right font-medium">{project.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Recent Activity */}
            <Card className="rounded-xl border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold leading-tight tracking-[-0.015em]">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-2 h-2 rounded-full", activity.color)} />
                        {index < recentActivities.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className={cn("flex-1", index < recentActivities.length - 1 && "pb-4")}>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="rounded-xl border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-bold leading-tight tracking-[-0.015em]">
                  Upcoming Tasks
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {upcomingTasks.map((task, index) => {
                    const Icon = task.icon
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className={cn("flex size-8 items-center justify-center rounded-full", task.bgColor)}>
                          <Icon className={cn("text-base", task.iconColor)} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{task.due}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

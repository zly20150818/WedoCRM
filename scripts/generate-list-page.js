#!/usr/bin/env node

/**
 * 📋 列表页生成器
 * 
 * 使用方法：
 * node scripts/generate-list-page.js
 * 
 * 然后按照提示输入信息，自动生成列表页文件
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function generateListPage() {
  console.log('🚀 列表页生成器\n')

  // 收集信息
  const tableName = await question('1. 表名 (例如: customers): ')
  const pageTitle = await question('2. 页面标题 (例如: Customers): ')
  const routePath = await question('3. 路由路径 (例如: customers): ')
  const searchFields = await question('4. 搜索字段，逗号分隔 (例如: name,email,phone): ')
  const statusField = await question('5. 状态字段 (例如: status，留空跳过): ')
  const statusValues = statusField ? await question('6. 状态值，逗号分隔 (例如: Active,Inactive): ') : ''
  const columns = await question('7. 显示列，逗号分隔 (例如: name,email,phone,status): ')

  const config = {
    tableName,
    pageTitle,
    routePath,
    searchFields: searchFields.split(',').map(f => f.trim()),
    statusField,
    statusValues: statusValues ? statusValues.split(',').map(v => v.trim()) : [],
    columns: columns.split(',').map(c => c.trim())
  }

  // 生成文件内容
  const fileContent = generateFileContent(config)

  // 写入文件
  const outputPath = path.join(process.cwd(), 'app', routePath, 'page.tsx')
  const outputDir = path.dirname(outputPath)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, fileContent)

  console.log(`\n✅ 列表页已生成: ${outputPath}`)
  console.log('\n📝 下一步：')
  console.log('1. 查看并调整生成的文件')
  console.log('2. 根据需要添加更多筛选器')
  console.log('3. 自定义列的渲染函数')
  console.log('4. 运行 npm run dev 查看效果\n')

  rl.close()
}

function generateFileContent(config) {
  const {
    tableName,
    pageTitle,
    routePath,
    searchFields,
    statusField,
    statusValues,
    columns
  } = config

  // 生成状态标签配置
  const statusTabsConfig = statusField ? `
  statusTabs: {
    enabled: true,
    field: "${statusField}",
    options: [
      { value: "all", label: "All Statuses" },
${statusValues.map(v => `      { value: "${v}", label: "${v}" },`).join('\n')}
    ],
  },` : `
  statusTabs: {
    enabled: false,
    field: "",
    options: [],
  },`

  // 生成列配置
  const columnsConfig = columns.map(col => {
    const label = col.toUpperCase().replace(/_/g, ' ')
    
    if (col === statusField) {
      return `    {
      key: "${col}",
      label: "${label}",
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
${statusValues.map(v => `          ${v}: "bg-${v === 'Active' ? 'green' : v === 'Inactive' ? 'gray' : 'blue'}-100 text-${v === 'Active' ? 'green' : v === 'Inactive' ? 'gray' : 'blue'}-800",`).join('\n')}
        }
        return <Badge className={colors[value] || "bg-gray-100 text-gray-800"}>{value}</Badge>
      },
    },`
    }
    
    return `    {
      key: "${col}",
      label: "${label}",
      sortable: true,
    },`
  }).join('\n')

  // 生成搜索条件
  const searchCondition = searchFields.map(f => `${f}.ilike.%\${searchTerm}%`).join(',')

  return `/**
 * ${pageTitle} 列表页
 * 
 * 自动生成，请根据需要调整
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Eye, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

const CONFIG = {
  title: "${pageTitle}",
  createButtonText: "Create New ${pageTitle.slice(0, -1)}",
  createRoute: "/${routePath}/new",
  
  table: "${tableName}",
  idField: "id",
  
  search: {
    enabled: true,
    placeholder: "Search by ${searchFields.join(', ')}",
    fields: ${JSON.stringify(searchFields)},
  },
  ${statusTabsConfig}
  
  columns: [
${columnsConfig}
  ],
  
  pagination: {
    pageSize: 20,
  },
  
  defaultSort: {
    field: "created_at",
    direction: "desc" as const,
  },
}

export default function ${pageTitle}Page() {
  const router = useRouter()
  const supabase = createClient()
  
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortField, setSortField] = useState(CONFIG.defaultSort.field)
  const [sortDirection, setSortDirection] = useState(CONFIG.defaultSort.direction)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [searchTerm, selectedStatus, sortField, sortDirection, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from(CONFIG.table)
        .select("*", { count: "exact" })

      if (searchTerm && CONFIG.search.enabled) {
        query = query.or("${searchCondition}")
      }

      if (selectedStatus !== "all" && CONFIG.statusTabs.enabled) {
        query = query.eq(CONFIG.statusTabs.field, selectedStatus)
      }

      query = query.order(sortField, { ascending: sortDirection === "asc" })

      const from = (currentPage - 1) * CONFIG.pagination.pageSize
      const to = from + CONFIG.pagination.pageSize - 1
      query = query.range(from, to)

      const { data: results, error, count } = await query

      if (error) throw error

      setData(results || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const totalPages = Math.ceil(totalCount / CONFIG.pagination.pageSize)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{CONFIG.title}</h1>
        <Button onClick={() => router.push(CONFIG.createRoute)}>
          <Plus className="mr-2 h-4 w-4" />
          {CONFIG.createButtonText}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={CONFIG.search.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        ${statusField ? `
        <div className="flex gap-2 flex-wrap">
          {CONFIG.statusTabs.options.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? "default" : "outline"}
              onClick={() => setSelectedStatus(option.value)}
              className="rounded-full"
            >
              {option.label}
            </Button>
          ))}
        </div>
        ` : ''}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {CONFIG.columns.map((column: any) => (
                <TableHead
                  key={column.key}
                  className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortField === column.key && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={CONFIG.columns.length + 1} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={CONFIG.columns.length + 1} className="text-center py-8">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[CONFIG.idField]}>
                  {CONFIG.columns.map((column: any) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || "-"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(\`/${routePath}/\${row.id}\`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(\`/${routePath}/\${row.id}/edit\`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * CONFIG.pagination.pageSize + 1} to{" "}
            {Math.min(currentPage * CONFIG.pagination.pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
`
}

// 运行生成器
generateListPage().catch(console.error)

"use client"

import { useMemo, useState, useRef, type KeyboardEvent, useCallback, type ChangeEvent } from "react"
import { UploadCloud, Download, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export type ProjectDocument = {
  id: string
  name: string
  size: string
  uploadedAt: string
  downloadUrl?: string
}

type DocumentsTabProps = {
  projectId: string
  documents?: ProjectDocument[]
}

export default function DocumentsTab({ projectId, documents: initialDocuments = [] }: DocumentsTabProps) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const sortedDocuments = useMemo(
    () =>
      [...documents].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    [documents],
  )

  const isClickable = !uploading

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      fileInputRef.current?.click()
    }
  }

  const formatDate = (value: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
    } catch {
      return value
    }
  }

  const handleOpenFileDialog = useCallback(() => {
    if (uploading) return
    fileInputRef.current?.click()
  }, [uploading])

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true)

      const supabase = createClient()

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error("Unable to verify current user.")
        }

        const filePath = `projects/${projectId}/${Date.now()}-${file.name}`
        const { error: storageError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { cacheControl: "3600", upsert: false })

        if (storageError) {
          throw storageError
        }

        const { data: inserted, error: insertError } = await supabase
          .from("files")
          .insert({
            name: file.name,
            path: filePath,
            size: file.size,
            type: file.type,
            scope: "project",
            ref_id: projectId,
            uploaded_by: user.id,
          })
          .select("id,name,path,size,created_at")
          .single()

        if (insertError || !inserted) {
          throw insertError || new Error("Failed to record document metadata.")
        }

        // Generate a signed URL for the private document (valid for 1 hour)
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from("documents")
          .createSignedUrl(filePath, 3600)

        if (urlError) {
          console.warn("Failed to generate signed URL:", urlError)
        }

        const newDocument: ProjectDocument = {
          id: inserted.id,
          name: inserted.name,
          size: formatFileSize(inserted.size),
          uploadedAt: inserted.created_at,
          downloadUrl: signedUrlData?.signedUrl || undefined,
        }

        setDocuments((prev) => [newDocument, ...prev])
        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded.`,
        })
      } catch (error) {
        console.error("Failed to upload project document:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    },
    [projectId, toast],
  )

  const handleFileSelected = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (uploading) return
      const file = event.target.files?.[0]
      if (!file) return
      await uploadFile(file)
      event.target.value = ""
    },
    [uploadFile, uploading],
  )

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!uploading && event.dataTransfer.types.includes("Files")) {
      setIsDragging(true)
    }
  }, [uploading])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!uploading && event.dataTransfer.types.includes("Files")) {
      event.dataTransfer.dropEffect = "copy"
    }
  }, [uploading])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    // 检查是否真的离开了卡片区域（而不是进入子元素）
    const relatedTarget = event.relatedTarget as Node | null
    if (!event.currentTarget.contains(relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)

      if (uploading) return

      const files = Array.from(event.dataTransfer.files)
      if (files.length === 0) return

      // 处理第一个文件（可以后续扩展为支持多文件）
      const file = files[0]
      await uploadFile(file)
    },
    [uploadFile, uploading],
  )

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
        // Accept attribute is optional - server-side validation is the source of truth
        // If you want to restrict file types, uncomment and modify the accept attribute
        // accept=".pdf,.doc,.docx,.xls,.xlsx,.pptx,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.txt,.csv"
        disabled={uploading}
      />
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isClickable
            ? "cursor-pointer hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            : "cursor-not-allowed opacity-80",
          isDragging && "border-primary bg-primary/5",
        )}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-busy={uploading}
        onClick={isClickable ? handleOpenFileDialog : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Drag &amp; drop files here or{" "}
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm font-semibold"
                onClick={(event) => {
                  event.stopPropagation()
                  handleOpenFileDialog()
                }}
                disabled={uploading}
              >
                click to upload
              </Button>
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: Documents, Images, Archives, and more
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Project Files</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sortedDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <FileText className="h-10 w-10 text-muted-foreground/60" />
              <span>No documents uploaded yet.</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">File Name</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium text-foreground">{doc.name}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          if (!doc.downloadUrl) {
                            // Generate a new signed URL if the old one expired
                            const supabase = createClient()
                            const { data: fileRow } = await supabase
                              .from("files")
                              .select("path")
                              .eq("id", doc.id)
                              .single()
                            
                            if (fileRow) {
                              const { data: signedUrlData } = await supabase.storage
                                .from("documents")
                                .createSignedUrl(fileRow.path, 3600)
                              
                              if (signedUrlData?.signedUrl) {
                                window.open(signedUrlData.signedUrl, "_blank")
                              }
                            }
                          } else {
                            window.open(doc.downloadUrl, "_blank")
                          }
                        }}
                        aria-label={`Download ${doc.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const base = Math.log(bytes) / Math.log(1024)
  const index = Math.floor(base)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}




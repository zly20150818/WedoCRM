"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, File, Download, Loader2, CheckCircle2, AlertCircle, FileText, FileSpreadsheet, FileImage } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadProductAttachment, deleteProductFile } from "@/lib/supabase/storage"
import { cn } from "@/lib/utils"

/**
 * 附件项接口
 */
interface AttachmentItem {
  url: string
  name: string
  path?: string
  status?: "uploading" | "success" | "error" | "pending"
  progress?: number
  size?: number
}

interface ProductAttachmentUploadProps {
  /**
   * 产品 ID（新建时为 undefined）
   */
  productId?: string | null
  /**
   * 当前附件列表（JSON 字符串或数组）
   */
  attachments: string | string[]
  /**
   * 附件列表更新回调
   */
  onAttachmentsChange: (attachments: string[]) => void
  /**
   * 文件对象更新回调（用于新建模式下保存文件对象）
   */
  onFilesChange?: (files: File[]) => void
  /**
   * 是否禁用
   */
  disabled?: boolean
}

/**
 * 产品附件上传组件
 * 支持拖拽上传、多文件上传、下载和删除
 */
export function ProductAttachmentUpload({
  productId,
  attachments,
  onAttachmentsChange,
  onFilesChange,
  disabled = false,
}: ProductAttachmentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, { file: File; progress: number }>>(new Map())
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<Map<string, File>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 解析附件列表（JSON 字符串或数组）
  const attachmentList: AttachmentItem[] = (() => {
    try {
      let attachmentArray: any[] = []
      
      if (typeof attachments === "string") {
        try {
          const parsed = JSON.parse(attachments)
          attachmentArray = Array.isArray(parsed) ? parsed : []
        } catch {
          attachmentArray = attachments ? [attachments] : []
        }
      } else if (Array.isArray(attachments)) {
        attachmentArray = attachments
      }

      return attachmentArray.map((item: any) => {
        if (typeof item === "string") {
          const url = item
          let fileName = "file"
          try {
            if (url.startsWith("http")) {
              const urlObj = new URL(url)
              fileName = urlObj.pathname.split("/").pop() || "file"
            } else if (url.startsWith("blob:")) {
              fileName = "file"
            } else {
              fileName = url.split("/").pop() || "file"
            }
          } catch {
            fileName = url.split("/").pop() || "file"
          }
          return { 
            url, 
            name: fileName,
            status: url.startsWith("blob:") ? "pending" as const : "success" as const
          }
        }
        return { 
          url: item.url || item.path || "", 
          name: item.name || "file",
          path: item.path,
          status: item.status || "success" as const,
          size: item.size
        }
      })
    } catch {
      return []
    }
  })()

  /**
   * 获取文件图标
   */
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    const iconClass = "h-5 w-5"
    
    switch (ext) {
      case "pdf":
        return <FileText className={cn(iconClass, "text-red-500")} />
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className={cn(iconClass, "text-green-500")} />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <FileImage className={cn(iconClass, "text-blue-500")} />
      default:
        return <File className={cn(iconClass, "text-muted-foreground")} />
    }
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  /**
   * 处理文件上传
   */
  const processFiles = useCallback(async (files: File[]) => {
    // 验证文件大小（限制为 10MB）
    const validFiles = files.filter((file) => {
      const isValid = file.size <= 10 * 1024 * 1024
      if (!isValid) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        })
      }
      return isValid
    })

    if (validFiles.length === 0) return

    setUploading(true)
    const newAttachments: AttachmentItem[] = [...attachmentList]
    const newUploadingFiles = new Map(uploadingFiles)
    let successCount = 0
    let failCount = 0

    try {
      if (productId) {
        // 编辑模式：立即上传
        for (const file of validFiles) {
          const fileId = `${file.name}-${Date.now()}`
          newUploadingFiles.set(fileId, { file, progress: 0 })
          setUploadingFiles(new Map(newUploadingFiles))

          try {
            // 模拟上传进度
            const progressInterval = setInterval(() => {
              const current = newUploadingFiles.get(fileId)
              if (current) {
                newUploadingFiles.set(fileId, { file, progress: Math.min(90, current.progress + 10) })
                setUploadingFiles(new Map(newUploadingFiles))
              }
            }, 200)

            const { url, path, error } = await uploadProductAttachment(productId, file)
            clearInterval(progressInterval)

            if (error) {
              failCount++
              toast({
                title: "Upload Failed",
                description: `Failed to upload ${file.name}: ${error.message}`,
                variant: "destructive",
              })
            } else if (url) {
              successCount++
              newAttachments.push({
                url,
                name: file.name,
                path: path || undefined,
                status: "success",
                size: file.size,
              })
              toast({
                title: "Upload Success",
                description: `${file.name} uploaded successfully`,
              })
            }
          } catch (error: any) {
            failCount++
            toast({
              title: "Upload Failed",
              description: `Failed to upload ${file.name}: ${error.message || "Unknown error"}`,
              variant: "destructive",
            })
          } finally {
            newUploadingFiles.delete(fileId)
            setUploadingFiles(new Map(newUploadingFiles))
          }
        }
      } else {
        // 新建模式：保存文件对象并创建临时 URL
        const newPendingFiles = new Map(pendingFiles)
        for (const file of validFiles) {
          try {
            const tempUrl = URL.createObjectURL(file)
            newAttachments.push({
              url: tempUrl,
              name: file.name,
              status: "pending",
              size: file.size,
            })
            newPendingFiles.set(tempUrl, file)
            successCount++
            toast({
              title: "File Added",
              description: `${file.name} added successfully`,
            })
          } catch (error) {
            failCount++
            console.error("Error creating object URL:", error)
            toast({
              title: "Warning",
              description: `Failed to prepare ${file.name} for upload`,
              variant: "destructive",
            })
          }
        }
        setPendingFiles(newPendingFiles)
        if (onFilesChange) {
          onFilesChange(Array.from(newPendingFiles.values()))
        }
      }

      const attachmentUrls = newAttachments.map((att) => att.url)
      onAttachmentsChange(attachmentUrls)

      // 显示总结提示
      if (validFiles.length > 1) {
        if (successCount > 0 && failCount === 0) {
          toast({
            title: "All Files Uploaded",
            description: `${successCount} file(s) uploaded successfully`,
          })
        } else if (successCount > 0) {
          toast({
            title: "Partial Success",
            description: `${successCount} succeeded, ${failCount} failed`,
            variant: "default",
          })
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadingFiles(new Map())
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [productId, attachmentList, uploadingFiles, pendingFiles, onAttachmentsChange, onFilesChange, toast])

  /**
   * 处理文件选择
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    await processFiles(Array.from(files))
  }

  /**
   * 处理拖拽事件
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !uploading) {
      setIsDragging(true)
    }
  }, [disabled, uploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFiles(files)
    }
  }, [disabled, uploading, processFiles])

  /**
   * 删除附件
   */
  const handleDeleteAttachment = async (index: number, attachment: AttachmentItem) => {
    try {
      // 如果是新建模式（blob URL），直接从前端移除
      if (!productId || attachment.url.startsWith("blob:")) {
        if (attachment.url.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.url)
          const newPendingFiles = new Map(pendingFiles)
          newPendingFiles.delete(attachment.url)
          setPendingFiles(newPendingFiles)
          if (onFilesChange) {
            onFilesChange(Array.from(newPendingFiles.values()))
          }
        }
        const newAttachments = attachmentList.filter((_, i) => i !== index)
        onAttachmentsChange(newAttachments.map((att) => att.url))
        toast({
          title: "File Removed",
          description: "File removed from list",
        })
        return
      }

      // 编辑模式：从服务器删除
      const pathToDelete = attachment.path || attachment.url

      const { error } = await deleteProductFile(pathToDelete)
      if (error) {
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete attachment",
          variant: "destructive",
        })
        return
      }

      const newAttachments = attachmentList.filter((_, i) => i !== index)
      onAttachmentsChange(newAttachments.map((att) => att.url))

      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete attachment",
        variant: "destructive",
      })
    }
  }

  /**
   * 下载附件
   */
  const handleDownloadAttachment = (attachment: AttachmentItem) => {
    if (attachment.url.startsWith("blob:")) {
      toast({
        title: "Not Available",
        description: "Attachment will be available after product is created",
        variant: "destructive",
      })
      return
    }

    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.name
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={cn(
            "rounded-full p-4",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}>
            {uploading ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="link"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                className="h-auto p-0 font-semibold"
              >
                Click to upload
              </Button>
              <span className="text-muted-foreground">or drag and drop</span>
            </div>
            <p className="text-sm text-muted-foreground">
              PDF, DOC, XLS, ZIP, etc. up to 10MB each
            </p>
          </div>
        </div>

        {/* 上传中的文件提示 */}
        {uploadingFiles.size > 0 && (
          <div className="mt-4 space-y-2">
            {Array.from(uploadingFiles.entries()).map(([fileId, { file, progress }]) => (
              <div key={fileId} className="flex items-center gap-2 text-sm bg-muted/50 rounded p-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 附件列表 */}
      {attachmentList.length > 0 && (
        <div className="space-y-2">
          {attachmentList.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(attachment.name)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    {attachment.status === "success" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                    {attachment.status === "pending" && (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                    )}
                    {attachment.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {attachment.size && (
                      <span>{formatFileSize(attachment.size)}</span>
                    )}
                    {attachment.status === "pending" && (
                      <span className="text-amber-500">Pending upload</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!attachment.url.startsWith("blob:") && attachment.status === "success" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadAttachment(attachment)}
                    disabled={disabled}
                    title="Download"
                    className="h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAttachment(index, attachment)}
                  disabled={disabled}
                  title="Delete"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

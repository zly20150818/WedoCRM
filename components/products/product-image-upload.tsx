"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadProductImage, deleteProductFile } from "@/lib/supabase/storage"
import { cn } from "@/lib/utils"

/**
 * 图片项接口
 */
interface ImageItem {
  url: string
  path?: string
  status?: "uploading" | "success" | "error"
  progress?: number
}

interface ProductImageUploadProps {
  /**
   * 产品 ID（新建时为 undefined）
   */
  productId?: string | null
  /**
   * 当前图片列表
   */
  images: string[]
  /**
   * 图片列表更新回调
   */
  onImagesChange: (images: string[]) => void
  /**
   * 是否禁用
   */
  disabled?: boolean
}

/**
 * 产品图片上传组件
 * 支持拖拽上传、多图片上传、预览和删除
 */
export function ProductImageUpload({
  productId,
  images,
  onImagesChange,
  disabled = false,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, { file: File; progress: number }>>(new Map())
  const [isDragging, setIsDragging] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 解析图片列表（JSON 字符串或数组）
  const imageList: ImageItem[] = (() => {
    try {
      if (typeof images === "string") {
        const parsed = JSON.parse(images)
        return Array.isArray(parsed) ? parsed.map((url: string) => ({ url, status: "success" as const })) : []
      }
      return Array.isArray(images) ? images.map((url: string) => ({ url, status: "success" as const })) : []
    } catch {
      return []
    }
  })()

  /**
   * 处理文件上传
   */
  const processFiles = useCallback(async (files: File[]) => {
    // 验证文件类型
    const imageFiles = files.filter((file) => {
      const isValid = file.type.startsWith("image/")
      if (!isValid) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
      }
      return isValid
    })

    if (imageFiles.length === 0) return

    // 验证文件大小（限制为 5MB）
    const validFiles = imageFiles.filter((file) => {
      const isValid = file.size <= 5 * 1024 * 1024
      if (!isValid) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        })
      }
      return isValid
    })

    if (validFiles.length === 0) return

    setUploading(true)
    const newImages: string[] = [...imageList.map((img) => img.url)]
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
            // 模拟上传进度（实际应用中可以使用 XMLHttpRequest 的 progress 事件）
            const progressInterval = setInterval(() => {
              newUploadingFiles.set(fileId, { file, progress: Math.min(90, (newUploadingFiles.get(fileId)?.progress || 0) + 10) })
              setUploadingFiles(new Map(newUploadingFiles))
            }, 200)

            const { url, error } = await uploadProductImage(productId, file)
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
              newImages.push(url)
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
        // 新建模式：创建临时 URL（使用 FileReader）
        for (const file of validFiles) {
          try {
            const url = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
            newImages.push(url)
            successCount++
            toast({
              title: "Image Added",
              description: `${file.name} added successfully`,
            })
          } catch (error: any) {
            failCount++
            toast({
              title: "Error",
              description: `Failed to process ${file.name}`,
              variant: "destructive",
            })
          }
        }
      }

      onImagesChange(newImages)

      // 显示总结提示
      if (validFiles.length > 1) {
        if (successCount > 0 && failCount === 0) {
          toast({
            title: "All Images Uploaded",
            description: `${successCount} image(s) uploaded successfully`,
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
        description: error.message || "Failed to process images",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadingFiles(new Map())
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [productId, imageList, uploadingFiles, onImagesChange, toast])

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
   * 删除图片
   */
  const handleDeleteImage = async (index: number, imageUrl: string) => {
    try {
      // 如果是新建模式，直接从前端移除
      if (!productId) {
        const newImages = imageList.filter((_, i) => i !== index)
        onImagesChange(newImages.map((img) => img.url))
        toast({
          title: "Image Removed",
          description: "Image removed from list",
        })
        return
      }

      // 编辑模式：从服务器删除
      const imageItem = imageList[index]
      const pathToDelete = imageItem.path || imageUrl

      const { error } = await deleteProductFile(pathToDelete)
      if (error) {
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete image",
          variant: "destructive",
        })
        return
      }

      // 从列表中移除
      const newImages = imageList.filter((_, i) => i !== index)
      onImagesChange(newImages.map((img) => img.url))

      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  /**
   * 预览图片
   */
  const handlePreviewImage = (url: string) => {
    setPreviewImage(url)
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
          accept="image/*"
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
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
              JPG, PNG, GIF, WebP up to 5MB each
            </p>
          </div>
        </div>

        {/* 上传中的文件提示 */}
        {uploadingFiles.size > 0 && (
          <div className="mt-4 space-y-2">
            {Array.from(uploadingFiles.entries()).map(([fileId, { file, progress }]) => (
              <div key={fileId} className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 图片列表 */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageList.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border overflow-hidden bg-muted relative">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => handlePreviewImage(image.url)}
                />
                {/* 状态指示器 */}
                {image.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                {image.status === "success" && (
                  <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
                {image.status === "error" && (
                  <div className="absolute top-2 left-2 bg-red-500 rounded-full p-1">
                    <AlertCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={() => handleDeleteImage(index, image.url)}
                disabled={disabled}
                title="Delete image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 图片预览对话框 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:text-gray-300 hover:bg-white/10"
              onClick={() => setPreviewImage(null)}
              title="Close"
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

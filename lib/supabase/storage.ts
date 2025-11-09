import { createClient } from "@/lib/supabase/client"

/**
 * 上传文件到 Supabase Storage
 * @param bucket 存储桶名称
 * @param path 文件路径（包含文件名）
 * @param file 文件对象
 * @returns 文件的公共 URL
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      return { url: null, error: error as Error }
    }

    // 获取公共 URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return { url: publicUrl, error: null }
  } catch (error) {
    return { url: null, error: error as Error }
  }
}

/**
 * 删除 Supabase Storage 中的文件
 * @param bucket 存储桶名称
 * @param paths 要删除的文件路径数组
 */
export async function deleteFiles(
  bucket: string,
  paths: string[]
): Promise<{ error: Error | null }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage.from(bucket).remove(paths)

    if (error) {
      return { error: error as Error }
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * 获取文件的公共 URL
 * @param bucket 存储桶名称
 * @param path 文件路径
 * @returns 文件的公共 URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}

/**
 * 上传用户头像
 * @param userId 用户 ID
 * @param file 头像文件
 * @returns 头像的公共 URL
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  return await uploadFile("avatars", filePath, file)
}

/**
 * 上传文档
 * @param clientId 客户 ID（可选，用于组织文档）
 * @param file 文档文件
 * @returns 文档的公共 URL
 */
export async function uploadDocument(
  clientId: string | null,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${file.name}`
  const filePath = clientId ? `documents/${clientId}/${fileName}` : `documents/${fileName}`

  return await uploadFile("documents", filePath, file)
}

/**
 * 上传产品图片
 * @param productId 产品 ID
 * @param file 图片文件
 * @returns 图片的公共 URL 和文件路径
 */
export async function uploadProductImage(
  productId: string,
  file: File
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  const supabase = createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `products/${productId}/${fileName}`

  try {
    const { data, error } = await supabase.storage.from("products").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      return { url: null, path: null, error: error as Error }
    }

    // 获取公共 URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath)

    return { url: publicUrl, path: filePath, error: null }
  } catch (error) {
    return { url: null, path: null, error: error as Error }
  }
}

/**
 * 上传产品附件
 * @param productId 产品 ID
 * @param file 附件文件
 * @returns 附件的公共 URL 和文件路径
 */
export async function uploadProductAttachment(
  productId: string,
  file: File
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  const supabase = createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `products/${productId}/attachments/${fileName}`

  try {
    const { data, error } = await supabase.storage.from("products").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      return { url: null, path: null, error: error as Error }
    }

    // 获取公共 URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath)

    return { url: publicUrl, path: filePath, error: null }
  } catch (error) {
    return { url: null, path: null, error: error as Error }
  }
}

/**
 * 从文件路径删除产品文件
 * @param filePath 文件路径（可以是完整 URL 或相对路径）
 * @returns 删除结果
 */
export async function deleteProductFile(
  filePath: string
): Promise<{ error: Error | null }> {
  const supabase = createClient()

  try {
    let path: string

    // 如果是完整 URL，提取路径
    // 例如: https://xxx.supabase.co/storage/v1/object/public/products/products/xxx/image.jpg
    if (filePath.startsWith("http")) {
      try {
        // 从 URL 中提取路径部分
        const url = new URL(filePath)
        // URL 路径格式: /storage/v1/object/public/products/products/xxx/image.jpg
        const pathParts = url.pathname.split("/").filter((p) => p)
        // 找到 'products' bucket 后的路径
        const productsIndex = pathParts.indexOf("products")
        if (productsIndex !== -1 && productsIndex < pathParts.length - 1) {
          // 提取 products/xxx/image.jpg（包含 products）
          path = pathParts.slice(productsIndex).join("/")
        } else {
          // 尝试直接从路径中提取（可能在 public 之后）
          const publicIndex = pathParts.indexOf("public")
          if (publicIndex !== -1 && publicIndex < pathParts.length - 1) {
            path = pathParts.slice(publicIndex + 1).join("/")
          } else {
            return { error: new Error("Invalid file path: cannot extract path from URL") }
          }
        }
      } catch (urlError) {
        // 如果 URL 解析失败，尝试使用正则表达式提取
        const match = filePath.match(/\/products\/(.+)$/)
        if (match) {
          path = `products/${match[1]}`
        } else {
          return { error: new Error("Invalid file path: cannot parse URL") }
        }
      }
    } else {
      // 如果已经是相对路径，直接使用
      path = filePath.startsWith("products/") ? filePath : `products/${filePath}`
    }

    const { error } = await supabase.storage.from("products").remove([path])
    if (error) {
      return { error: error as Error }
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}


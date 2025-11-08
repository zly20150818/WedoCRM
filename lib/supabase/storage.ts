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


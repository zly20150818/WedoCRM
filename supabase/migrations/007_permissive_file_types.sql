-- Permissive file types configuration (推荐方案 / Recommended)
-- This allows common business file types while blocking dangerous ones
-- 允许常见的业务文件类型，同时阻止危险类型

-- Blocked file types (危险类型，不应允许):
-- - Executables: .exe, .bat, .sh, .ps1, .cmd, .com, .scr
-- - Scripts: .js, .vbs, .php, .asp, .jsp, .py, .rb
-- - System files: .dll, .sys, .drv, .ocx
-- - Archives with executables: 需要内容扫描

DO $$
DECLARE
  existing_mimes TEXT[];
  new_mimes TEXT[];
BEGIN
  -- Get existing MIME types for documents bucket
  SELECT allowed_mime_types
    INTO existing_mimes
    FROM storage.buckets
   WHERE id = 'documents'
   FOR UPDATE;

  IF existing_mimes IS NULL THEN
    existing_mimes := ARRAY[]::TEXT[];
  END IF;

  -- Add comprehensive list of safe business file types
  -- 添加全面的安全业务文件类型列表
  new_mimes := (SELECT ARRAY(
    SELECT DISTINCT unnest(existing_mimes || ARRAY[
      -- Documents / 文档
      'application/pdf',
      'application/msword', -- .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
      'application/vnd.ms-excel', -- .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- .xlsx
      'application/vnd.ms-excel.sheet.macroEnabled.12', -- .xlsm (宏文件，需谨慎)
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template', -- .xltx
      'application/vnd.ms-powerpoint', -- .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
      'application/vnd.openxmlformats-officedocument.presentationml.template', -- .potx
      'application/rtf', -- Rich Text Format
      'application/x-rtf',
      'application/vnd.oasis.opendocument.text', -- .odt
      'application/vnd.oasis.opendocument.spreadsheet', -- .ods
      'application/vnd.oasis.opendocument.presentation', -- .odp
      'application/vnd.oasis.opendocument.graphics', -- .odg
      'application/vnd.oasis.opendocument.chart', -- .odc
      'application/vnd.oasis.opendocument.formula', -- .odf
      'application/vnd.oasis.opendocument.database', -- .odb
      'application/vnd.oasis.opendocument.image', -- .odi
      'application/x-mspublisher', -- .pub
      'application/vnd.ms-visio.drawing', -- .vsd
      'application/vnd.visio', -- .vsd (新版)
      
      -- Text files / 文本文件
      'text/plain',
      'text/csv',
      'text/tab-separated-values', -- .tsv
      'text/html', -- HTML (需谨慎，可能包含脚本)
      'text/xml',
      'application/xml',
      'text/markdown', -- .md
      'text/x-markdown',
      
      -- Archives / 压缩文件
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed', -- .rar
      'application/x-rar', -- .rar (alternative)
      'application/x-7z-compressed', -- .7z
      'application/gzip', -- .gz
      'application/x-gzip',
      'application/x-tar', -- .tar
      'application/x-compressed-tar', -- .tgz
      'application/x-bzip2', -- .bz2
      'application/x-bzip', -- .bz
      'application/x-lzip', -- .lz
      'application/x-lzma', -- .lzma
      'application/x-xz', -- .xz
      
      -- Images / 图片
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/tif',
      'image/svg+xml', -- SVG (需谨慎，可能包含脚本)
      'image/x-icon', -- .ico
      'image/vnd.microsoft.icon', -- .ico
      'image/x-ms-bmp', -- .bmp (Windows)
      'image/photoshop', -- .psd
      'image/x-photoshop',
      'image/vnd.adobe.photoshop',
      
      -- Audio / 音频 (可选)
      'audio/mpeg', -- .mp3
      'audio/mp3',
      'audio/x-mpeg-3',
      'audio/wav', -- .wav
      'audio/wave',
      'audio/x-wav',
      'audio/ogg', -- .ogg
      'audio/vorbis',
      'audio/aac', -- .aac
      'audio/x-aac',
      'audio/mp4', -- .m4a
      'audio/x-m4a',
      'audio/flac', -- .flac
      'audio/x-flac',
      'audio/webm', -- .webm
      
      -- Video / 视频 (可选，文件较大)
      'video/mp4', -- .mp4
      'video/x-m4v',
      'video/mpeg', -- .mpeg
      'video/quicktime', -- .mov
      'video/x-msvideo', -- .avi
      'video/x-ms-wmv', -- .wmv
      'video/webm', -- .webm
      'video/ogg', -- .ogv
      'video/x-matroska', -- .mkv
      'video/x-flv', -- .flv
      'video/3gpp', -- .3gp
      'video/3gpp2', -- .3g2
      
      -- CAD / 设计文件 (可选)
      'application/acad', -- .dwg
      'application/x-acad',
      'image/vnd.dwg',
      'application/dxf', -- .dxf
      'image/vnd.dxf',
      'application/x-dxf',
      'model/step', -- .stp, .step
      'application/step',
      'model/iges', -- .igs, .iges
      'application/iges',
      'application/x-iges',
      
      -- Other / 其他
      'application/json', -- JSON files
      'application/x-json',
      'application/vnd.ms-outlook', -- .msg
      'application/vnd.ms-excel.addin.macroEnabled.12', -- .xlam
      'application/vnd.ms-powerpoint.addin.macroEnabled.12', -- .ppam
      'application/vnd.ms-word.document.macroEnabled.12', -- .docm (宏文件，需谨慎)
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12' -- .pptm (宏文件，需谨慎)
    ])
  ));

  -- Update documents bucket
  UPDATE storage.buckets
     SET allowed_mime_types = new_mimes
   WHERE id = 'documents';
END;
$$;

-- Note: This configuration allows many file types but blocks:
-- 注意: 此配置允许许多文件类型，但阻止:
-- - Executable files (.exe, .bat, .sh, etc.)
-- - Script files (.js, .php, .py, etc.) - except when embedded in documents
-- - System files (.dll, .sys, etc.)
-- 
-- If you need to allow scripts or executables, you MUST:
-- 如果您需要允许脚本或可执行文件，您必须:
-- 1. Implement file scanning (virus detection)
-- 2. Add strict access controls
-- 3. Monitor and audit all uploads
-- 4. Consider sandboxed execution environment


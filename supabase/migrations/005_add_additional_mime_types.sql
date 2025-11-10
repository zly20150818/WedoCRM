-- Add additional MIME types for documents bucket
-- This includes common compression formats and document types that may be encountered

DO $$
DECLARE
  existing_mimes TEXT[];
  new_mimes TEXT[];
BEGIN
  -- Get existing MIME types
  SELECT allowed_mime_types
    INTO existing_mimes
    FROM storage.buckets
   WHERE id = 'documents'
   FOR UPDATE;

  IF existing_mimes IS NULL THEN
    existing_mimes := ARRAY[]::TEXT[];
  END IF;

  -- Add new MIME types (will automatically deduplicate)
  new_mimes := (SELECT ARRAY(
    SELECT DISTINCT unnest(existing_mimes || ARRAY[
      -- Compression formats
      'application/x-zip-compressed',  -- Windows ZIP format
      'application/x-rar-compressed',  -- RAR format
      'application/x-7z-compressed',   -- 7z format
      'application/gzip',              -- GZIP format
      'application/x-tar',             -- TAR format
      'application/x-gzip',            -- GZIP (alternative)
      'application/x-compressed',      -- Generic compressed
      -- Additional Office formats
      'application/vnd.ms-powerpoint', -- PowerPoint (.ppt)
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- PowerPoint (.pptx)
      'application/vnd.ms-excel.sheet.macroEnabled.12', -- Excel with macros (.xlsm)
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template', -- Excel template (.xltx)
      -- Additional document formats
      'application/rtf',               -- Rich Text Format
      'application/x-rtf',             -- RTF (alternative)
      'application/vnd.oasis.opendocument.text', -- OpenDocument Text (.odt)
      'application/vnd.oasis.opendocument.spreadsheet', -- OpenDocument Spreadsheet (.ods)
      'application/vnd.oasis.opendocument.presentation', -- OpenDocument Presentation (.odp)
      -- Image formats (additional)
      'image/gif',                     -- GIF images
      'image/webp',                    -- WebP images
      'image/bmp',                     -- BMP images
      'image/tiff',                    -- TIFF images
      'image/svg+xml'                  -- SVG images
    ])
  ));

  -- Update the bucket with new MIME types
  UPDATE storage.buckets
     SET allowed_mime_types = new_mimes
   WHERE id = 'documents';
END;
$$;

-- Also update products bucket to include compression formats
DO $$
DECLARE
  existing_mimes TEXT[];
  new_mimes TEXT[];
BEGIN
  SELECT allowed_mime_types
    INTO existing_mimes
    FROM storage.buckets
   WHERE id = 'products'
   FOR UPDATE;

  IF existing_mimes IS NULL THEN
    existing_mimes := ARRAY[]::TEXT[];
  END IF;

  new_mimes := (SELECT ARRAY(
    SELECT DISTINCT unnest(existing_mimes || ARRAY[
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ])
  ));

  UPDATE storage.buckets
     SET allowed_mime_types = new_mimes
   WHERE id = 'products';
END;
$$;


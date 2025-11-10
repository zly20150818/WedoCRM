-- Allow additional image mime types (PNG and JPEG) for documents bucket
DO $$
DECLARE
  existing_mimes TEXT[];
  new_mimes TEXT[];
BEGIN
  SELECT allowed_mime_types
    INTO existing_mimes
    FROM storage.buckets
   WHERE id = 'documents'
   FOR UPDATE;

  IF existing_mimes IS NULL THEN
    existing_mimes := ARRAY[]::TEXT[];
  END IF;

  new_mimes := (SELECT ARRAY(
    SELECT DISTINCT unnest(existing_mimes || ARRAY[
      'image/png',
      'image/jpeg',
      'image/jpg'
    ])
  ));

  UPDATE storage.buckets
     SET allowed_mime_types = new_mimes
   WHERE id = 'documents';
END;
$$;



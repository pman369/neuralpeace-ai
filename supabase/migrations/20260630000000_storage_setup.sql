-- 20260630000000_storage_setup.sql
-- Create storage buckets and define RLS policies for avatars, book covers, and book files

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('covers', 'covers', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('books', 'books', false, 52428800, ARRAY['application/pdf', 'application/epub+zip'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'avatars'
-- Anyone can view avatars
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload/update/delete their own avatars (stored at path 'avatars/{auth.uid()}/avatar.png')
DROP POLICY IF EXISTS "Allow users to manage their own avatar" ON storage.objects;
CREATE POLICY "Allow users to manage their own avatar"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Policies for 'covers'
-- Anyone can view covers
DROP POLICY IF EXISTS "Allow public read access to covers" ON storage.objects;
CREATE POLICY "Allow public read access to covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

-- Only users with 'can_upload_books' permission (in public.user_profiles) can upload/modify covers
DROP POLICY IF EXISTS "Allow curators to manage covers" ON storage.objects;
CREATE POLICY "Allow curators to manage covers"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'covers' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND can_upload_books = true
    )
  )
  WITH CHECK (
    bucket_id = 'covers' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND can_upload_books = true
    )
  );

-- 3. Policies for 'books'
-- Authenticated users can read/download books
DROP POLICY IF EXISTS "Allow authenticated users to read books" ON storage.objects;
CREATE POLICY "Allow authenticated users to read books"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'books');

-- Only users with 'can_upload_books' permission can upload/modify book files
DROP POLICY IF EXISTS "Allow curators to manage book files" ON storage.objects;
CREATE POLICY "Allow curators to manage book files"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'books' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND can_upload_books = true
    )
  )
  WITH CHECK (
    bucket_id = 'books' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND can_upload_books = true
    )
  );

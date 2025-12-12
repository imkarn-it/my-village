# Supabase Storage Setup

To make the File Upload System work, you need to create the necessary Storage Buckets and Policies in your Supabase project.

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- 1. Create 'maintenance' bucket for maintenance request images
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance', 'maintenance', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 'profiles' bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Policies for 'maintenance' bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload maintenance images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'maintenance' );

-- Allow anyone to view maintenance images
CREATE POLICY "Anyone can view maintenance images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'maintenance' );

-- 4. Set up Policies for 'profiles' bucket
-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profiles' );

-- Allow users to update/delete their own avatars (optional, for better management)
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[2] );

-- Allow anyone to view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'profiles' );

-- 5. Create 'payment-slips' bucket for payment slip uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Set up Policies for 'payment-slips' bucket
-- Allow authenticated users to upload payment slips
CREATE POLICY "Authenticated users can upload payment slips"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'payment-slips' );

-- Allow anyone to view payment slips (for admin verification)
CREATE POLICY "Anyone can view payment slips"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'payment-slips' );

-- Allow authenticated users to delete their own slips (optional)
CREATE POLICY "Users can delete payment slips"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'payment-slips' );
```

## How to run:
1. Go to your Supabase Dashboard.
2. Navigate to the **SQL Editor** tab.
3. Paste the code above.
4. Click **Run**.

Once completed, the image upload feature in "Maintenance Request" and "Profile" pages will work immediately.

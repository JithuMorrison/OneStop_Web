# Supabase Storage Bucket Setup

This document provides instructions for setting up the required storage buckets in Supabase.

## Required Storage Buckets

The following storage buckets need to be created manually in the Supabase Dashboard or via the Supabase API.

### 1. announcement-images

**Purpose**: Store images for announcements

**Configuration**:

- **Bucket Name**: `announcement-images`
- **Public**: Yes (publicly accessible)
- **File Size Limit**: 5MB
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`

### 2. post-images

**Purpose**: Store images for user posts

**Configuration**:

- **Bucket Name**: `post-images`
- **Public**: Yes (publicly accessible)
- **File Size Limit**: 5MB
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`

### 3. material-files

**Purpose**: Store educational materials (PDFs, documents, images)

**Configuration**:

- **Bucket Name**: `material-files`
- **Public**: Yes (publicly accessible)
- **File Size Limit**: 10MB
- **Allowed MIME Types**:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 4. club-logos

**Purpose**: Store club logo images

**Configuration**:

- **Bucket Name**: `club-logos`
- **Public**: Yes (publicly accessible)
- **File Size Limit**: 2MB
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/png`
  - `image/svg+xml`

## Setup Instructions

### Via Supabase Dashboard

1. Navigate to your Supabase project dashboard
2. Go to **Storage** in the left sidebar
3. Click **New bucket**
4. For each bucket above:
   - Enter the bucket name
   - Toggle **Public bucket** to ON
   - Click **Create bucket**
5. After creating each bucket, click on it and go to **Policies**
6. Set up the following policies:

#### Storage Policies

**For all buckets, create these policies:**

**Upload Policy** (Allow authenticated users to upload):

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bucket-name-here');
```

**Read Policy** (Allow public read access):

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bucket-name-here');
```

**Update Policy** (Allow users to update their own files):

```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bucket-name-here' AND auth.uid()::text = owner);
```

**Delete Policy** (Allow users to delete their own files):

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bucket-name-here' AND auth.uid()::text = owner);
```

Replace `'bucket-name-here'` with the actual bucket name for each policy.

### Via Supabase CLI

If you prefer using the Supabase CLI, you can create buckets programmatically:

```bash
# Create announcement-images bucket
supabase storage create announcement-images --public

# Create post-images bucket
supabase storage create post-images --public

# Create material-files bucket
supabase storage create material-files --public

# Create club-logos bucket
supabase storage create club-logos --public
```

### Via Supabase JavaScript Client

You can also create buckets programmatically using the Supabase JavaScript client:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Create buckets
await supabase.storage.createBucket("announcement-images", { public: true });
await supabase.storage.createBucket("post-images", { public: true });
await supabase.storage.createBucket("material-files", { public: true });
await supabase.storage.createBucket("club-logos", { public: true });
```

**Note**: You'll need the service role key (not the anon key) to create buckets programmatically.

## Verification

After setup, verify that:

1. All four buckets are created
2. Each bucket is marked as public
3. Storage policies are in place
4. You can upload a test file to each bucket
5. You can access uploaded files via their public URLs

## File Upload Example

Once buckets are set up, you can upload files like this:

```javascript
import { supabase } from "./services/supabaseClient.jsx";

// Upload a file
const uploadFile = async (bucketName, filePath, file) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  return publicUrl;
};

// Example usage
const file = event.target.files[0];
const publicUrl = await uploadFile(
  "announcement-images",
  `${userId}/${Date.now()}.jpg`,
  file
);
```

## Troubleshooting

### Issue: "Bucket already exists"

- The bucket name must be unique across your project
- Check if the bucket was already created

### Issue: "Permission denied"

- Ensure RLS policies are correctly set up
- Verify the user is authenticated
- Check that the bucket is marked as public if needed

### Issue: "File size too large"

- Check the file size limits for each bucket
- Compress images before uploading if needed

### Issue: "Invalid MIME type"

- Ensure the file type is in the allowed MIME types list
- Add additional MIME types if needed via bucket settings

# Storage Buckets Configuration for SSN Connect

This document outlines the Supabase Storage buckets required for the SSN Connect Portal.

## Overview

The SSN Connect Portal uses Supabase Storage for storing images and files. MongoDB stores the URLs to these files as strings. This hybrid approach allows us to leverage Supabase's robust file storage while maintaining our MongoDB data structure.

## Required Buckets

### 1. announcements

- **Purpose**: Store announcement images and additional images
- **Public**: Yes
- **File Size Limit**: 5MB
- **Allowed Types**: image/jpeg, image/png, image/gif, image/webp

### 2. posts

- **Purpose**: Store post images
- **Public**: Yes
- **File Size Limit**: 5MB
- **Allowed Types**: image/jpeg, image/png, image/gif, image/webp

### 3. materials

- **Purpose**: Store educational materials (PDFs, documents, images)
- **Public**: Yes
- **File Size Limit**: 10MB
- **Allowed Types**: application/pdf, image/jpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

### 4. clubs

- **Purpose**: Store club logo images
- **Public**: Yes
- **File Size Limit**: 2MB
- **Allowed Types**: image/jpeg, image/png, image/svg+xml

## Setup Instructions

### Option 1: Via Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create each bucket with the following settings:
   - **Bucket name**: Use the names listed above (announcements, posts, materials, clubs)
   - **Public bucket**: Toggle ON
   - Click **Create bucket**

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create buckets
supabase storage create announcements --public
supabase storage create posts --public
supabase storage create materials --public
supabase storage create clubs --public
```

### Option 3: Programmatically via JavaScript

Create a setup script (run once):

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key required

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
  const buckets = ["announcements", "posts", "materials", "clubs"];

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit:
        bucket === "materials"
          ? 10485760
          : bucket === "clubs"
          ? 2097152
          : 5242880,
    });

    if (error) {
      console.error(`Error creating ${bucket}:`, error);
    } else {
      console.log(`✓ Created bucket: ${bucket}`);
    }
  }
}

setupBuckets();
```

## Storage Policies

After creating the buckets, ensure the following RLS policies are in place:

### Public Read Access (All Buckets)

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('announcements', 'posts', 'materials', 'clubs'));
```

### Authenticated Upload (All Buckets)

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('announcements', 'posts', 'materials', 'clubs'));
```

### User Can Update Own Files

```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('announcements', 'posts', 'materials', 'clubs'));
```

### User Can Delete Own Files

```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('announcements', 'posts', 'materials', 'clubs'));
```

## Integration with MongoDB

### How It Works

1. **File Upload Flow**:

   - User uploads file via frontend
   - File is uploaded to Supabase Storage bucket
   - Supabase returns public URL
   - Public URL is stored in MongoDB document as a string

2. **File Retrieval Flow**:
   - MongoDB document contains Supabase Storage URL
   - Frontend displays image/file using the URL
   - Supabase serves the file directly

### Example: Announcement with Image

```javascript
// MongoDB Document
{
  _id: ObjectId("..."),
  title: "Tech Workshop",
  description: "Join us for...",
  image: "https://xxx.supabase.co/storage/v1/object/public/announcements/user123/1234567890.jpg",
  additional_images: [
    "https://xxx.supabase.co/storage/v1/object/public/announcements/user123/1234567891.jpg"
  ],
  created_by: ObjectId("..."),
  // ... other fields
}
```

## File Upload Service

Create a reusable upload service in `src/services/uploadService.jsx`:

```javascript
import { supabase } from "./supabaseClient.jsx";

export const uploadService = {
  /**
   * Upload file to Supabase Storage
   * @param {string} bucket - Bucket name (announcements, posts, materials, clubs)
   * @param {File} file - File to upload
   * @param {string} userId - User ID for organizing files
   * @returns {Promise<string>} Public URL of uploaded file
   */
  async uploadFile(bucket, file, userId) {
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload file");
    }
  },

  /**
   * Delete file from Supabase Storage
   * @param {string} bucket - Bucket name
   * @param {string} filePath - Path to file in bucket
   */
  async deleteFile(bucket, filePath) {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error("Failed to delete file");
    }
  },
};
```

## Verification Checklist

After setup, verify:

- [ ] All four buckets are created (announcements, posts, materials, clubs)
- [ ] Each bucket is marked as public
- [ ] Storage policies are in place
- [ ] Test file upload to each bucket works
- [ ] Public URLs are accessible
- [ ] MongoDB can store and retrieve URLs correctly

## Troubleshooting

### Bucket Already Exists

- Check if bucket was created in a previous setup
- Use a different bucket name if needed

### Permission Denied

- Verify RLS policies are set up correctly
- Ensure user is authenticated for upload operations
- Check that bucket is public for read operations

### File Size Too Large

- Check file size limits for each bucket
- Compress images before uploading
- Adjust bucket file size limits if needed

### CORS Issues

- Ensure Supabase project has correct CORS settings
- Add your frontend domain to allowed origins in Supabase dashboard

## Environment Variables

Ensure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For programmatic bucket creation, you'll also need:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Note**: Never commit the service role key to version control!

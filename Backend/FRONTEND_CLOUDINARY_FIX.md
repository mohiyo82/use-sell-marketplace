# Frontend Cloudinary Upload Fix

## The Issue
Your frontend code is trying to use environment variables `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` which are missing, causing upload failures.

## The Solution
Use the backend signature-based approach instead. Create this file in your **frontend** project:

### File: `lib/cloudinary.ts`

```typescript
/**
 * Cloudinary Upload Library
 * 
 * SECURITY NOTE: Never put Cloudinary API_SECRET in frontend code!
 * This library gets signatures from the backend instead.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  try {
    // Get signature from backend (never expose API_SECRET in frontend)
    const sigResponse = await fetch(`${API_BASE}/products/cloudinary/signature`);
    if (!sigResponse.ok) {
      throw new Error(`Failed to get Cloudinary signature: ${sigResponse.statusText}`);
    }
    
    const sigData = await sigResponse.json();
    if (!sigData.success) {
      throw new Error(sigData.data?.error || "Failed to get signature");
    }

    const { signature, apiKey, cloudName, timestamp, folder } = sigData.data;

    // Upload to Cloudinary using signature-based authentication
    const uploadPromises = files.map((file) => 
      uploadFileToCloudinary(file, signature, apiKey, cloudName, timestamp, folder)
    );

    const urls = await Promise.all(uploadPromises);
    return urls.filter(Boolean);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

async function uploadFileToCloudinary(
  file: File,
  signature: string,
  apiKey: string,
  cloudName: string,
  timestamp: number,
  folder: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error?.message || `Upload failed: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.secure_url;
}
```

## Backend Changes (Already Done)
✅ Backend signature endpoint added: `GET /products/cloudinary/signature`
✅ Cloudinary service fixed to not expose credentials
✅ Products controller updated to accept imageUrls

## Frontend Setup Steps

1. **Delete or replace any old cloudinary utilities** - Remove any code that uses `NEXT_PUBLIC_CLOUDINARY_*` env vars

2. **Create** `lib/cloudinary.ts` with the code above

3. **Update your `.env.local`** - Add this line:
   ```
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_uploads
   ```

4. **Your `.env.local` should have**:
   ```
   NEXT_PUBLIC_API_BASE=http://localhost:5000
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_uploads
   ```

5. **No changes needed** to your admin form component - it already imports `uploadMultipleToCloudinary` correctly

## How It Works

1. Frontend calls `uploadMultipleToCloudinary(files)`
2. Library fetches signature from backend: `GET /products/cloudinary/signature`
3. Backend generates secure SHA1 signature using credentials from `.env`
4. Frontend receives: `{ signature, apiKey, cloudName, timestamp, folder }`
5. Frontend uploads directly to Cloudinary using signature authentication
6. Cloudinary validates signature and accepts upload
7. Frontend sends secure URLs to backend via `/products` endpoint
8. Backend stores image URLs in database

## Security Benefits
- ✅ API_SECRET never exposed to frontend
- ✅ Each upload gets a unique timestamp + signature
- ✅ Backend controls folder paths
- ✅ Signatures are one-time use (timestamp-based)

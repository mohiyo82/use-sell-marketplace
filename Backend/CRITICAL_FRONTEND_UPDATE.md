⚠️ CRITICAL: Frontend Code Must Be Updated

The backend has been updated to use unsigned uploads (simple approach).
Your frontend is STILL using the old signature-based code which calls a non-existent endpoint.

ERROR YOU'RE SEEING:
  "Failed to get Cloudinary signature: Not Found"
  
REASON:
  Your frontend calls: GET /products/cloudinary/signature ❌ (does not exist)
  Backend now provides: GET /products/cloudinary/config ✅ (new endpoint)

═══════════════════════════════════════════════════════════════════════════

IMMEDIATE ACTION REQUIRED:

Replace your frontend's lib/cloudinary.ts COMPLETELY with this code:

═══════════════════════════════════════════════════════════════════════════

```typescript
/**
 * Cloudinary Upload Library - Unsigned Upload Approach
 * 
 * This is the CORRECT implementation using unsigned uploads.
 * No signatures needed, no API_SECRET exposed.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  try {
    // Get Cloudinary config from backend (cloudName and uploadPreset)
    const configResponse = await fetch(`${API_BASE}/products/cloudinary/config`);
    
    if (!configResponse.ok) {
      throw new Error(
        `Failed to get Cloudinary config: ${configResponse.statusText}`
      );
    }

    const configData = await configResponse.json();
    
    if (!configData.success || !configData.data) {
      throw new Error(
        configData.data?.error || "Failed to get Cloudinary config"
      );
    }

    const config: CloudinaryConfig = configData.data;

    // Upload all files to Cloudinary
    const uploadPromises = files.map((file) =>
      uploadFileToCloudinary(file, config)
    );

    const urls = await Promise.all(uploadPromises);
    return urls.filter(Boolean) as string[];
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

async function uploadFileToCloudinary(
  file: File,
  config: CloudinaryConfig
): Promise<string> {
  const { cloudName, uploadPreset } = config;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "use-and-sell/products");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message ||
        `Cloudinary upload failed: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.secure_url;
}
```

═══════════════════════════════════════════════════════════════════════════

IMPORTANT DIFFERENCES:

OLD CODE (signature-based) ❌
  - Calls: /products/cloudinary/signature
  - Uses: api_key, timestamp, signature
  - Complex and error-prone

NEW CODE (unsigned uploads) ✅
  - Calls: /products/cloudinary/config
  - Uses: upload_preset (unsigned)
  - Simple, reliable, works immediately

═══════════════════════════════════════════════════════════════════════════

CHECKLIST:

1. [ ] Delete or backup old lib/cloudinary.ts
2. [ ] Create NEW lib/cloudinary.ts with code above
3. [ ] Make sure .env.local has: NEXT_PUBLIC_API_BASE=http://localhost:5000
4. [ ] Restart frontend dev server
5. [ ] Try uploading an image again
6. [ ] Should work now! ✅

═══════════════════════════════════════════════════════════════════════════

If you still get errors after this:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart frontend: npm run dev
3. Check Network tab in DevTools
4. Verify endpoint returns: { success: true, data: { cloudName: "...", uploadPreset: "unsigned_uploads" } }

═══════════════════════════════════════════════════════════════════════════

BACKEND STATUS: ✅ Ready
FRONTEND STATUS: ❌ Needs update (you need to do this)

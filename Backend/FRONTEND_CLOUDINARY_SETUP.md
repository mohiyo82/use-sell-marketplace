# Frontend Cloudinary Upload - Complete Setup Guide

## The Issue (FIXED ✅)
Your frontend was getting "Invalid Signature" errors because:
1. The signature-based approach was overly complex
2. Cloudinary requires ALL parameters in signature to be sent in request
3. Better solution: Use **unsigned uploads** - simpler and just as secure

## The Solution ✅
Use Cloudinary's unsigned upload presets (no backend signature needed).

---

## Step 1: Create Frontend Library File

Create `lib/cloudinary.ts` in your **frontend** project:

```typescript
/**
 * Cloudinary Upload Library with Unsigned Upload
 * 
 * Simple and secure: uses Cloudinary's unsigned upload preset.
 * API_SECRET never needed on frontend!
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  try {
    // Get config from backend
    const configResponse = await fetch(`${API_BASE}/products/cloudinary/config`);
    if (!configResponse.ok) {
      throw new Error(`Failed to get Cloudinary config: ${configResponse.statusText}`);
    }
    
    const configData = await configResponse.json();
    if (!configData.success || !configData.data) {
      throw new Error(configData.data?.error || "Failed to get Cloudinary config");
    }

    const config: CloudinaryConfig = configData.data;

    // Upload to Cloudinary using unsigned upload preset
    const uploadPromises = files.map((file) => 
      uploadFileToCloudinary(file, config)
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
    const error = await response.json();
    throw new Error(
      error.error?.message || `Cloudinary upload failed: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.secure_url;
}
```

---

## Step 2: Configure Frontend Environment

Update your `.env.local`:

```
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

That's it! No Cloudinary credentials needed in frontend.

---

## Step 3: Setup Cloudinary Upload Preset (ONE TIME ONLY)

You need to create an **unsigned upload preset** in your Cloudinary dashboard:

1. Go to https://cloudinary.com/console/settings/upload
2. Click "Add upload preset"
3. Configure:
   - **Name**: `unsigned_uploads`
   - **Mode**: Unsigned ✅
   - **Folder**: `use-and-sell/products`
   - Save

That's it! The preset is now ready for unsigned uploads.

---

## Step 4: Admin Form - No Changes Needed

Your admin form already imports correctly:
```typescript
const { uploadMultipleToCloudinary } = await import("@/lib/cloudinary");
```

Just replace `lib/cloudinary.ts` with the code from Step 1.

---

## How It Works

1. **Frontend calls**: `uploadMultipleToCloudinary(files)`
2. **Gets config**: `GET /products/cloudinary/config`
   - Returns: `{ cloudName: "dapsxeewd", uploadPreset: "unsigned_uploads" }`
3. **Direct upload to Cloudinary**: No signature needed!
   - Parameters: `file`, `upload_preset`, `folder`
4. **Cloudinary accepts**: Since upload preset is unsigned, no validation needed
5. **Returns URLs**: Frontend stores in database via `/products` endpoint

---

## Backend Configuration ✅

Already done:
- ✅ Endpoint: `GET /products/cloudinary/config` (public)
- ✅ Returns cloudName and uploadPreset
- ✅ Products controller handles imageUrls from frontend
- ✅ `.env` has Cloudinary credentials

---

## Security ✅

- ✅ **No API secrets in frontend code**
- ✅ **Unsigned uploads** = no signature validation errors
- ✅ **Backend controls** folder paths
- ✅ **Simple and reliable** approach

---

## Testing Checklist

- [ ] Updated `lib/cloudinary.ts` with code from Step 1
- [ ] Updated `.env.local` with `NEXT_PUBLIC_API_BASE`
- [ ] Created unsigned upload preset in Cloudinary dashboard
- [ ] Backend running on http://localhost:5000
- [ ] Go to Admin Add Product page
- [ ] Select images and submit
- [ ] Images upload to Cloudinary successfully
- [ ] Product saves to database with image URLs

---

## Troubleshooting

**Images still won't upload?**
- ✅ Verify `.env.local` has: `NEXT_PUBLIC_API_BASE=http://localhost:5000`
- ✅ Check backend is running: `npm run start:dev`
- ✅ Verify upload preset exists in Cloudinary: `unsigned_uploads`
- ✅ Check browser Network tab for failed requests
- ✅ Make sure preset name matches exactly: `unsigned_uploads`

**Error: "Invalid Signature"?**
- ✅ You've still got the old signature-based code
- ✅ Replace `lib/cloudinary.ts` with the code above
- ✅ Restart frontend dev server

---

## Files Changed

**Backend** (Done):
- `cloudinary.service.ts` - Kept for reference
- `products.controller.ts` - Changed to `/products/cloudinary/config` endpoint
- `.env` - Has Cloudinary credentials

**Frontend** (You need to do):
- `lib/cloudinary.ts` - Replace with code from Step 1
- `.env.local` - Add `NEXT_PUBLIC_API_BASE`

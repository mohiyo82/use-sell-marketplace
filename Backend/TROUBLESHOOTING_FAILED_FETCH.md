# Troubleshooting: "Image upload failed: Failed to fetch"

## What This Error Means
The frontend cannot connect to either:
1. **Backend endpoint**: `http://localhost:5000/products/cloudinary/config` 
2. **Cloudinary API**: `https://api.cloudinary.com/v1_1/...`
3. **CORS issue** between frontend and backend

---

## Checklist to Fix

### ✅ Step 1: Verify Backend is Running

**Windows PowerShell:**
```powershell
# Check if port 5000 is listening
netstat -ano | Select-String "5000"

# Should show something like:
# TCP    127.0.0.1:5000         0.0.0.0:0              LISTENING       12345
```

**If NOT listening:**
```powershell
# Navigate to backend
cd "c:\Users\Micro\Desktop\use-and-sell\Backend\server"

# Start the server
nest start --watch
# or
npm run start:dev

# Wait for: "🚀 Server running on http://localhost:5000"
```

---

### ✅ Step 2: Verify Frontend Environment Variables

**Your frontend `.env.local` should have:**
```
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

**Check it exists:**
```bash
# In your frontend directory
cat .env.local
# Should show: NEXT_PUBLIC_API_BASE=http://localhost:5000
```

**If missing, create/update it:**
```
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

---

### ✅ Step 3: Verify Frontend Code is Updated

Your `lib/cloudinary.ts` should call `/products/cloudinary/config` (NOT `/products/cloudinary/signature`)

**Check line 29-30:**
```typescript
const configResponse = await fetch(`${API_BASE}/products/cloudinary/config`);
//                                                          ^^^^^^^^
//                                          Should be "config", not "signature"
```

**If it says "signature":**
- Replace entire `lib/cloudinary.ts` with the code from `SOLUTION_CLOUDINARY_UPLOAD.md`

---

### ✅ Step 4: Clear Browser Cache

**Chrome/Edge:**
1. Press: `Ctrl + Shift + Delete`
2. Time range: "All time"
3. Check: "Cookies and cached images"
4. Click: "Clear data"

**Then hard reload:**
- `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

---

### ✅ Step 5: Restart Frontend Dev Server

```bash
# Stop current frontend (Ctrl+C if running)

# Navigate to frontend directory
cd your-frontend-directory

# Clear cache
rm -r .next  # or delete the .next folder manually on Windows

# Restart
npm run dev
# or
yarn dev
```

Wait for: `▲ Next.js 15.x.x` and `Ready in ...`

---

### ✅ Step 6: Test the Endpoint Directly

**In browser, go to:**
```
http://localhost:5000/products/cloudinary/config
```

**You should see:**
```json
{
  "success": true,
  "data": {
    "cloudName": "dapsxeewd",
    "uploadPreset": "unsigned_uploads"
  }
}
```

**If you get:**
- ❌ 404 Not Found → Backend route not mapped, rebuild
- ❌ Connection refused → Backend not running on port 5000
- ❌ CORS error → Check backend CORS config

---

### ✅ Step 7: Check Browser DevTools Network Tab

1. **Open DevTools**: `F12` or `Ctrl+Shift+I`
2. **Go to Network tab**
3. **Try uploading an image**
4. **Look for requests:**
   - `cloudinary/config` → Check Status and Response
   - `api.cloudinary.com` → Check Status and Response

**Common issues:**
- ❌ `cloudinary/config` → 404: Backend route missing
- ❌ `cloudinary/config` → No response: Backend crashed
- ❌ `api.cloudinary.com` → 401/403: Cloudinary preset issue

---

## Common Causes & Fixes

### Backend Not Running
```bash
# Terminal 1: Backend
cd Backend/server
nest start --watch

# Wait for: 🚀 Server running on http://localhost:5000
```

### Wrong Frontend Environment Variable
```
❌ NEXT_PUBLIC_API_BASE=http://localhost:3000
✅ NEXT_PUBLIC_API_BASE=http://localhost:5000
```

### Frontend Code Still Using Old Signature Endpoint
```typescript
❌ fetch(`${API_BASE}/products/cloudinary/signature`)
✅ fetch(`${API_BASE}/products/cloudinary/config`)
```

### CORS Issues
Backend already has CORS enabled for `http://localhost:3000`, so this should work.

### Cloudinary Upload Preset Missing
1. Go: https://cloudinary.com/console/settings/upload
2. Create preset: `unsigned_uploads`
3. Mode: **Unsigned**
4. Folder: `use-and-sell/products`

---

## Verification Steps (In Order)

1. ✅ Backend running on 5000? 
   ```powershell
   netstat -ano | Select-String "5000"
   ```

2. ✅ Frontend `.env.local` has NEXT_PUBLIC_API_BASE?
   ```bash
   cat .env.local
   ```

3. ✅ Frontend code updated to use `/config` endpoint?
   ```bash
   grep "cloudinary/config" lib/cloudinary.ts
   ```

4. ✅ Can you reach the endpoint directly?
   ```
   Browser: http://localhost:5000/products/cloudinary/config
   ```

5. ✅ Cloudinary preset created?
   ```
   https://cloudinary.com/console/settings/upload
   ```

---

## Quick Debug Script

**In your frontend console** (DevTools → Console tab), paste:

```javascript
// Test backend connection
fetch('http://localhost:5000/products/cloudinary/config')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend ERROR:', e.message));
```

**Result:**
- ✅ Logs config → Backend is working
- ❌ Error: "Failed to fetch" → Backend not running
- ❌ Error: "CORS" → Check backend CORS settings

---

## If Still Stuck

Run ALL these in order:

```bash
# 1. Stop everything
# Kill all Node processes (PowerShell)
Get-Process node | Stop-Process -Force

# 2. Backend: Fresh start
cd Backend/server
npm run build
nest start --watch

# Wait for: 🚀 Server running on http://localhost:5000

# 3. Frontend: In another terminal
cd your-frontend-directory
rm -r .next
npm run dev

# Wait for: Ready in ...

# 4. Test in browser
# Go to: http://localhost:3000/admin/add-product
# Try uploading
```

---

## Expected Success Signs

✅ Backend console shows request:
```
GET /products/cloudinary/config
```

✅ Browser Network tab shows:
- `cloudinary/config` → 200 OK
- Response has cloudName and uploadPreset

✅ No errors in browser console

✅ Images upload to Cloudinary successfully

---

## Still Seeing "Failed to fetch"?

Check these in order:
1. Port 5000 actually listening? (netstat)
2. Frontend .env.local correct? (cat command)
3. Frontend code updated? (grep for "/config")
4. Browser cache cleared? (Ctrl+Shift+Delete)
5. Frontend dev server restarted? (stop and npm run dev)
6. Direct endpoint test works? (http://localhost:5000/products/cloudinary/config)

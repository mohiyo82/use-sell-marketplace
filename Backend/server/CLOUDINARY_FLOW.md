/**
 * CLOUDINARY IMAGE STORAGE FLOW
 * 
 * Database میں Cloudinary Secure URLs محفوظ ہوں گے
 * Example URL: https://res.cloudinary.com/dapsxeewd/image/upload/v1733542800/use-and-sell/products/abc123.jpg
 */

// ===========================
// 1. UPLOAD CONTROLLER FLOW
// ===========================

// Frontend sends FormData with files
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('title', 'Samsung Phone');
formData.append('price', '50000');

// POST /products
// Authorization: Bearer <token>


// ===========================
// 2. BACKEND PROCESSING
// ===========================

// products.controller.ts
async create(
  @Req() req: any,
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: CreateProductDto,
) {
  // Step 1: Upload files to Cloudinary
  const images = await this.cloudinaryService.uploadMultipleFiles(files);
  // Returns: [
  //   "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542800/use-and-sell/products/file1.jpg",
  //   "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542801/use-and-sell/products/file2.jpg"
  // ]

  // Step 2: Create product payload
  const payload = {
    ...body,
    images,  // ← Cloudinary URLs
    price: Number(body.price),
  };

  // Step 3: Save to database
  const product = await this.productsService.create({
    ...payload,
    userId: req.user?.id,
  });

  return { success: true, data: product };
}


// ===========================
// 3. DATABASE SAVE
// ===========================

// products.service.ts
async create(data: CreateProductInput) {
  const product = await this.prisma.product.create({
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      price: data.price,
      location: data.location,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      images: data.images,  // ← Array of Cloudinary URLs stored here
      acceptTerms: data.acceptTerms,
      user: data.userId ? { connect: { id: data.userId } } : undefined,
    },
  });
  return product;
}


// ===========================
// 4. DATABASE SCHEMA
// ===========================

// prisma/schema.prisma
model Product {
  id           Int      @id @default(autoincrement())
  title        String
  category     String
  description  String
  price        Int
  location     String
  contactName  String
  contactPhone String
  images       String[]  // ← Stores array of Cloudinary URLs
  acceptTerms  Boolean
  
  userId Int?
  user   User?  @relation(fields: [userId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}


// ===========================
// 5. STORED IN DATABASE
// ===========================

/*
PostgreSQL storage:
{
  "id": 1,
  "title": "Samsung Galaxy S21",
  "category": "Mobile",
  "description": "Good condition phone",
  "price": 50000,
  "location": "Karachi",
  "contactName": "Ali",
  "contactPhone": "03001234567",
  "images": [
    "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542800/use-and-sell/products/abc123.jpg",
    "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542801/use-and-sell/products/def456.jpg"
  ],
  "acceptTerms": true,
  "userId": 1,
  "createdAt": "2025-12-06T10:45:00Z",
  "updatedAt": "2025-12-06T10:45:00Z"
}
*/


// ===========================
// 6. RETRIEVE FROM DATABASE
// ===========================

// GET /products
async getAll(@Req() req: any) {
  const products = await this.productsService.findAll();
  
  // products[0].images = [
  //   "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542800/use-and-sell/products/abc123.jpg",
  //   "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542801/use-and-sell/products/def456.jpg"
  // ]
  
  return { success: true, data: products };
}


// ===========================
// 7. FRONTEND USAGE
// ===========================

// Frontend gets response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Samsung Galaxy S21",
      "price": 50000,
      "images": [
        "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542800/use-and-sell/products/abc123.jpg",
        "https://res.cloudinary.com/dapsxeewd/image/upload/v1733542801/use-and-sell/products/def456.jpg"
      ]
    }
  ]
}

// Display images directly:
<img src="https://res.cloudinary.com/dapsxeewd/image/upload/v1733542800/use-and-sell/products/abc123.jpg" />


// ===========================
// 8. UPDATE PRODUCT WITH NEW IMAGES
// ===========================

// PUT /products/:id
async update(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: any
) {
  // Upload new images
  const newImages = files && files.length > 0 
    ? await this.cloudinaryService.uploadMultipleFiles(files)
    : [];

  // Keep existing images or use new ones
  const existingImages = body.existingImages || [];
  const allImages = [...existingImages, ...newImages];

  // Update database
  const updated = await this.productsService.update(Number(id), {
    ...body,
    images: allImages,  // ← Mix of old Cloudinary URLs + new ones
  });

  return { success: true, data: updated };
}


// ===========================
// 9. DELETE PRODUCT
// ===========================

// DELETE /products/:id
// Images automatically deleted from Cloudinary
// Database record deleted
// (Optional: can implement soft delete to keep URLs in history)


// ===========================
// 10. BENEFITS
// ===========================

/*
✅ URLs directly stored in database
✅ No local disk storage needed
✅ Cloudinary handles optimization (resize, compress, format)
✅ Global CDN delivery (fast worldwide)
✅ Easy image transformations (crop, filters, etc.)
✅ Automatic cleanup of old images
✅ No storage size limits
✅ Secure signed URLs available
*/


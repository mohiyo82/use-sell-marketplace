import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  UploadedFiles,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { promises as fs } from 'fs';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ----------- GET CLOUDINARY CONFIG -----------
  @Get('cloudinary/config')
  async getCloudinaryConfig() {
    try {
      return { 
        success: true, 
        data: {
          cloudName: this.cloudinaryService.getCloudName(),
          uploadPreset: 'unsigned_uploads', // Use unsigned uploads instead of signatures
        }
      };
    } catch (err) {
      console.error(err);
      throw new HttpException({ success: false, error: err?.message || 'Failed to get Cloudinary config' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ----------- CREATE PRODUCT -----------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 12))
  async create(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    try {
      let images: string[] = [];
      
      // Handle images uploaded to Cloudinary from frontend
      if (body.imageUrls) {
        const urls = Array.isArray(body.imageUrls) ? body.imageUrls : [body.imageUrls];
        images = urls.filter(Boolean);
      }
      
      // If no imageUrls from frontend, handle file uploads from backend
      if (images.length === 0 && files && files.length > 0) {
        images = await this.cloudinaryService.uploadMultipleFiles(files);
      }
      
      const price = Number(body.price || 0);
      const acceptTerms = body.acceptTerms === 'true' || body.acceptTerms === true;

      const payload = { ...body, price, acceptTerms, images };

      // Allow unauthenticated product creation: `userId` will be null when no token provided.
      const userId = req.user?.id ?? null;

      const product = await this.productsService.create({ ...payload, userId });
      return { success: true, data: product };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error(err);
      const message = err?.message || 'Failed to create product';
      throw new HttpException({ success: false, error: message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ----------- GET ALL PRODUCTS -----------
  @Get()
  async getAll(@Req() req: any) {
    try {
      const products = await this.productsService.findAll();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const transformed = products.map((p) => ({
        ...p,
        images: (p.images || []).map((img) => {
          if (typeof img === 'string') {
            // Normalize Windows backslashes and trim
            const s = img.replace(/\\+/g, '/').trim();
            if (s.startsWith('http://') || s.startsWith('https://')) return s;
            if (s.startsWith('/uploads/products/')) return `${baseUrl}${s}`;
            if (s.startsWith('/uploads/')) {
              const fname = s.split('/').pop();
              return `${baseUrl}/uploads/products/${fname}`;
            }
            return `${baseUrl}/uploads/products/${s.replace(/^\/+/, '')}`;
          }
          return `${baseUrl}/uploads/products/${String(img).replace(/^\/+/, '')}`;
        }),
      }));
      return { success: true, data: transformed };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error(err);
      throw new HttpException({ success: false, error: err?.message || 'Failed to fetch products' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ----------- UPDATE PRODUCT -----------
  @Put(':id')
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 12))
  async update(@Req() req: any, @Param('id') id: string, @UploadedFiles() files: Express.Multer.File[], @Body() body: any) {
    try {
      const product = await this.productsService.findOne(Number(id));
      const userId = req.user?.id;
      if (product && product.userId && Number(product.userId) !== Number(userId)) {
        throw new HttpException({ success: false, error: 'Not allowed' }, HttpStatus.FORBIDDEN);
      }

      // Handle images uploaded to Cloudinary from frontend
      let uploadedUrls: string[] = [];
      if (body.imageUrls) {
        const urls = Array.isArray(body.imageUrls) ? body.imageUrls : [body.imageUrls];
        uploadedUrls = urls.filter(Boolean);
      }
      
      // If no imageUrls from frontend, handle file uploads from backend
      if (uploadedUrls.length === 0 && files && files.length > 0) {
        uploadedUrls = await this.cloudinaryService.uploadMultipleFiles(files);
      }

      // existingImages may be passed as a JSON-string or array
      let keptImages: any[] = [];
      if (body?.existingImages) {
        try {
          keptImages = typeof body.existingImages === 'string' ? JSON.parse(body.existingImages) : body.existingImages;
          if (!Array.isArray(keptImages)) keptImages = [];
        } catch (e) {
          keptImages = [];
        }
      }

      // Merge, filtering falsy and duplicates
      const images = [...(keptImages || []).filter(Boolean), ...uploadedUrls].filter(Boolean);

      const payload = { ...body, images };

      const updated = await this.productsService.update(Number(id), payload);
      return { success: true, data: updated };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error(err);
      throw new HttpException({ success: false, error: err?.message || 'Failed to update product' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ----------- DELETE PRODUCT -----------
  @Delete(':id')
  async deleteProduct(@Req() req: any, @Param('id') id: string) {
    try {
      const productId = Number(id);
      if (isNaN(productId)) {
        throw new HttpException({ success: false, error: 'Invalid product ID' }, HttpStatus.BAD_REQUEST);
      }

      // Allow unauthenticated deletes for frontend convenience.
      // If the request is authenticated, enforce ownership checks.
      const product = await this.productsService.findOne(productId);
      const userId = req.user?.id;
      if (!product) {
        throw new HttpException({ success: false, error: 'Product not found' }, HttpStatus.NOT_FOUND);
      }
      // If the request came from an authenticated user, ensure they own the product
      // (if product.userId exists). If unauthenticated (no userId) allow deletion.
      if (userId && product.userId && Number(product.userId) !== Number(userId)) {
        throw new HttpException({ success: false, error: 'Not allowed' }, HttpStatus.FORBIDDEN);
      }

      // Try to delete product (service) first. If successful, remove uploaded files.
      const deleted = await this.productsService.remove(productId);

      // If product had images stored locally, remove them from disk.
      try {
          const images: any[] = product.images || [];
        for (const img of images) {
          // Accept absolute URL or local relative path; only delete local files.
          if (!img) continue;
          // Normalize to forward slashes so basename works the same across OSes
          const str = String(img).replace(/\\+/g, '/').trim();
          // If image is a remote URL (http/s) skip
          if (str.startsWith('http://') || str.startsWith('https://')) continue;

          // Normalize path and strip leading slashes
          // Use path.basename for safety (handles both separators)
          const filename = basename(str);
          if (!filename) continue;
          const filePath = join(process.cwd(), 'uploads', 'products', filename);
          // Use fs.unlink and ignore errors (file may not exist)
          await fs.unlink(filePath)
            .then(() => console.log('Removed file:', filePath))
            .catch((err) => console.warn('Could not remove file:', filePath, err?.message || err));
        }
      } catch (ex) {
        // Log and continue — don't fail deletion just because filesystem cleanup failed
        console.warn('Failed to remove product images from disk', ex);
      }

      if (!deleted) {
        throw new HttpException({ success: false, error: 'Failed to delete product' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return { success: true, message: 'Product deleted successfully' };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error(err);
      throw new HttpException({ success: false, error: err?.message || 'Failed to delete product' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ----------- GET PRODUCTS FOR CURRENT USER -----------
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProducts(@Req() req: any) {
    try {
      const userId = req.user?.id;
      const products = await this.productsService.findByUser(Number(userId));

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const transformed = products.map((p) => ({
        ...p,
        images: (p.images || []).map((img) => {
          if (typeof img === 'string') {
            // Normalize Windows backslashes and trim
            const s = img.replace(/\\+/g, '/').trim();
            if (s.startsWith('http://') || s.startsWith('https://')) return s;
            if (s.startsWith('/uploads/products/')) return `${baseUrl}${s}`;
            if (s.startsWith('/uploads/')) {
              const fname = s.split('/').pop();
              return `${baseUrl}/uploads/products/${fname}`;
            }
            return `${baseUrl}/uploads/products/${s.replace(/^\/+/, '')}`;
          }
          return `${baseUrl}/uploads/products/${String(img).replace(/^\/+/, '')}`;
        }),
      }));

      return { success: true, data: transformed };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error(err);
      throw new HttpException({ success: false, error: err?.message || 'Failed to fetch user products' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

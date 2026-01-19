import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
  Req,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dtos/create-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('admin/products')
// REMOVED GUARDS — NOW NO TOKEN REQUIRED
export class AdminProductsController {
  constructor(
    private productsService: ProductsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 12))
  async create(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductDto,
  ) {
    try {
      let images: string[] = [];
      const b: any = body;

      if (b?.imageUrls) {
        const urls = Array.isArray(b.imageUrls) ? b.imageUrls : [b.imageUrls];
        images = [...images, ...urls.filter(Boolean)];
      }

      if (files && files.length > 0) {
        const uploaded = await this.cloudinaryService.uploadMultipleFiles(files);
        images = [...images, ...uploaded];
      }

      const payload: any = {
        ...body,
        price: Number(body.price || 0),
        acceptTerms: body.acceptTerms === 'true' || body.acceptTerms === true,
        images,
        status: body.status || 'pending',
      };

      // REMOVE USER TOKEN DEPENDENCY
      const product = await this.productsService.create(payload);
      return { success: true, data: product };
    } catch (err) {
      console.error(err);
      throw new HttpException(
        { success: false, error: 'Failed to create product' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Req() req: any) {
    try {
      const products = await this.productsService.findAll();
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const transformed = products.map((p) => ({
        ...p,
        images: (p.images || []).map((img) => {
          if (
            typeof img === 'string' &&
            (img.startsWith('http://') || img.startsWith('https://'))
          )
            return img;

          if (typeof img === 'string' && img.startsWith('/uploads/'))
            return `${baseUrl}${img}`;

          return `${baseUrl}/uploads/products/${String(img).replace(/^\/+/, '')}`;
        }),
      }));

      return { success: true, data: transformed };
    } catch (err) {
      console.error(err);
      throw new HttpException(
        { success: false, error: 'Failed to fetch products' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    try {
      const product = await this.productsService.findOne(Number(id));
      if (!product) return { success: false, error: 'Product not found' };

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const transformed = {
        ...product,
        images: (product.images || []).map((img) => {
          if (
            typeof img === 'string' &&
            (img.startsWith('http://') || img.startsWith('https://'))
          )
            return img;

          if (typeof img === 'string' && img.startsWith('/uploads/'))
            return `${baseUrl}${img}`;

          return `${baseUrl}/uploads/products/${String(img).replace(/^\/+/, '')}`;
        }),
      };

      return { success: true, data: transformed };
    } catch (err) {
      console.error(err);
      throw new HttpException(
        { success: false, error: 'Failed to fetch product' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 12))
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    try {
      let bodyImageUrls: string[] = [];
      if (body?.imageUrls) {
        const urls = Array.isArray(body.imageUrls)
          ? body.imageUrls
          : [body.imageUrls];
        bodyImageUrls = urls.filter(Boolean);
      }

      const uploadedUrls =
        files && files.length > 0
          ? await this.cloudinaryService.uploadMultipleFiles(files)
          : [];

      let keptImages: any[] = [];
      if (body?.existingImages) {
        try {
          keptImages =
            typeof body.existingImages === 'string'
              ? JSON.parse(body.existingImages)
              : body.existingImages;
          if (!Array.isArray(keptImages)) keptImages = [];
        } catch {
          keptImages = [];
        }
      }

      const images = [
        ...keptImages.filter(Boolean),
        ...bodyImageUrls,
        ...uploadedUrls,
      ];

      const updated = await this.productsService.update(Number(id), {
        ...body,
        images,
      });

      return { success: true, data: updated };
    } catch (err) {
      console.error(err);
      throw new HttpException(
        { success: false, error: 'Failed to update product' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const removed = await this.productsService.remove(Number(id));
      return { success: true, data: removed };
    } catch (err) {
      console.error(err);
      throw new HttpException(
        { success: false, error: 'Failed to delete product' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { AdminProductsController } from '../admin/products.controller';
import { ProductsService } from './products.service';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, RolesGuard],
})
export class ProductsModule {}

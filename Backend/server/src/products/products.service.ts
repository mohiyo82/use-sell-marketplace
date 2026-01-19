import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ----------- CREATE PRODUCT -----------
  async create(data: any) {
    const normalizeNullable = (v: any) => (v === undefined || v === null || v === 'null' || v === '' ? null : v);
    const mobileBrand = normalizeNullable(data.mobileBrand);
    const ptaStatus = normalizeNullable(data.ptaStatus);

    const created = await this.prisma.product.create({
      data: {
        title: data.title,
        category: data.category,
        mobileBrand,
        ptaStatus,
        condition: data.condition,
        description: data.description,
        price: Number(data.price),
        location: data.location,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        status: data.status || 'available',
        images: Array.isArray(data.images) ? data.images : (data.images ? [String(data.images)] : []),
        acceptTerms: data.acceptTerms === 'true' || data.acceptTerms === true,
        userId: data.userId ?? null,
      },
    });

    return created;
  }

  // ----------- FIND PRODUCTS BY USER -----------
  async findByUser(userId: number) {
    const products = await this.prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      mobileBrand: p.mobileBrand,
      ptaStatus: p.ptaStatus,
      condition: p.condition,
      description: p.description,
      price: p.price,
      location: p.location,
      contactName: p.contactName,
      contactPhone: p.contactPhone,
      status: p.status,
      images: p.images,
      acceptTerms: p.acceptTerms,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  // ----------- GET ALL PRODUCTS -----------
  async findAll() {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      mobileBrand: p.mobileBrand,
      ptaStatus: p.ptaStatus,
      condition: p.condition,
      description: p.description,
      price: p.price,
      location: p.location,
      contactName: p.contactName,
      contactPhone: p.contactPhone,
      status: p.status,
      images: p.images,
      acceptTerms: p.acceptTerms,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  // ----------- FIND ONE PRODUCT -----------
  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  // ----------- UPDATE PRODUCT -----------
  async update(id: number, data: any) {
    const normalizeNullable = (v: any) => (v === undefined || v === null || v === 'null' || v === '' ? null : v);

    // ensure correct, simple types before calling prisma
    const title = data.title;
    const category = data.category;
    const mobileBrand = normalizeNullable(data.mobileBrand);
    const ptaStatus = normalizeNullable(data.ptaStatus);
    const condition = normalizeNullable(data.condition);
    const description = data.description;
    const price = Number(data.price || 0);
    const location = data.location;
    const contactName = data.contactName;
    const contactPhone = data.contactPhone;

    // status may come as string, null or an array (eg. ['pending','active']) if sent incorrectly — normalize to a single string
    let status: string | null = null;
    if (data.status === undefined || data.status === null) status = 'available';
    else if (Array.isArray(data.status)) status = String(data.status[0] ?? 'available');
    else status = String(data.status);

    // images may be array or a single value
    const images = Array.isArray(data.images) ? data.images : (data.images ? [String(data.images)] : []);

    const acceptTerms = data.acceptTerms === 'true' || data.acceptTerms === true;

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        title,
        category,
        mobileBrand,
        ptaStatus,
        condition,
        description,
        price,
        location,
        contactName,
        contactPhone,
        status,
        images,
        acceptTerms,
      },
    });
    return updated;
  }

  // ----------- DELETE PRODUCT -----------
  async remove(id: number) {
    await this.prisma.product.delete({
      where: { id },
    });
    return true;
  }
}

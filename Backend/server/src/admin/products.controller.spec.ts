import { Test, TestingModule } from '@nestjs/testing';
import { AdminProductsController } from './products.controller';
import { ProductsService } from '../products/products.service';

const mockProductsService = {
  create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 2, ...data })),
  findAll: jest.fn().mockResolvedValue([{ id: 1, title: 't1' }]),
  findOne: jest.fn().mockResolvedValue({ id: 1, title: 't1' }),
  update: jest.fn().mockResolvedValue({ id: 1, title: 'updated' }),
  remove: jest.fn().mockResolvedValue(true),
};

describe('AdminProductsController', () => {
  let controller: AdminProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<AdminProductsController>(AdminProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns products', async () => {
    // controller.findAll expects a request object (used to build base url)
    const mockReq: any = { protocol: 'http', get: jest.fn().mockReturnValue('localhost:5000') };
    const res = await controller.findAll(mockReq);
    expect(res).toEqual({ success: true, data: [{ id: 1, title: 't1', images: [] }] });
  });

  it('create stores filename-only images and returns created product', async () => {
    const mockReq: any = { user: { id: 2 } };
    // simulate uploaded files (multer gives a filename property)
    const files: any = [{ filename: 'one.jpg' }, { filename: 'two.png' }];
    const body: any = { title: 'new', price: '100', acceptTerms: 'true' };

    const res = await controller.create(mockReq, files, body);
    expect(mockProductsService.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 2, images: ['one.jpg', 'two.png'] }));
    expect(res).toEqual({ success: true, data: expect.objectContaining({ id: 2, images: ['one.jpg', 'two.png'] }) });
  });

  it('findOne returns product', async () => {
    const mockReq: any = { protocol: 'http', get: jest.fn().mockReturnValue('localhost:5000') };
    const res = await controller.findOne(mockReq, '1');
    expect(res).toEqual({ success: true, data: { id: 1, title: 't1', images: [] } });
  });

  it('update returns updated product', async () => {
    const res = await controller.update('1', { title: 'updated' });
    expect(res).toEqual({ success: true, data: { id: 1, title: 'updated' } });
  });

  it('remove deletes product', async () => {
    const res = await controller.remove('1');
    expect(res).toEqual({ success: true, data: true });
  });
});

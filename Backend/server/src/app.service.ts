import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { success: boolean; message: string; endpoints: any[]; notes?: string } {
    const endpoints = [
      { method: 'POST', path: '/auth/register', auth: 'none', description: 'Register user' },
      { method: 'POST', path: '/auth/login', auth: 'none', description: 'Login -> returns JWT token' },
      { method: 'POST', path: '/auth/logout', auth: 'none', description: 'Logout (body: { userId })' },

      { method: 'GET', path: '/users', auth: 'none', description: 'List all users' },
      { method: 'POST', path: '/users/register', auth: 'none', description: 'Create user' },
      { method: 'PATCH', path: '/users/:id', auth: 'none', description: "Update user's active flag" },
      { method: 'DELETE', path: '/users/:id', auth: 'none', description: 'Delete user' },

      { method: 'POST', path: '/products', auth: 'Bearer <user-token>', description: 'Create product (multipart/form-data, key files[])' },
      { method: 'GET', path: '/products', auth: 'none', description: 'List all products' },
      { method: 'GET', path: '/products/me', auth: 'Bearer <user-token>', description: "Get logged user's products" },
      { method: 'PUT', path: '/products/:id', auth: 'Bearer <user-token>', description: 'Update product (owner check)' },
      { method: 'DELETE', path: '/products/:id', auth: 'conditional (allows unauthenticated)', description: 'Delete product (owner check if authenticated)' },

      { method: 'POST', path: '/admin/products', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Admin create product (multipart)' },
      { method: 'GET', path: '/admin/products', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'List all products (admin)' },
      { method: 'GET', path: '/admin/products/:id', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Get product (admin)' },
      { method: 'PUT', path: '/admin/products/:id', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Update product (admin)' },
      { method: 'DELETE', path: '/admin/products/:id', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Delete product (admin)' },

      { method: 'GET', path: '/stats/users', auth: 'none', description: 'User statistics' },

      { method: 'POST', path: '/api/products', auth: 'none', description: 'Legacy express route (uploads example) — defined in src/routes/products.ts' },
    ];

    return {
      success: true,
      message: 'Welcome to Use & Sell — Backend API (list of known endpoints below)',
      endpoints,
      notes: 'When testing admin routes use an admin user (seed script creates admin@example.com / password123). For file uploads use multipart/form-data with key `files`.'
    };
  }
}

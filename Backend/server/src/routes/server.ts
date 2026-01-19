import express from "express";
import cors from "cors";
import dotenv from "dotenv";
const productsRouter = require("../routes/products");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Root welcome endpoint — make it explicit so GET / returns a friendly message
app.get('/', (req, res) => {
	const endpoints = [
		{ method: 'POST', path: '/auth/register', auth: 'none', description: 'Register user (Nest)' },
		{ method: 'POST', path: '/auth/login', auth: 'none', description: 'Login -> returns JWT token (Nest)' },
		{ method: 'POST', path: '/auth/logout', auth: 'none', description: 'Logout (body: { userId }) (Nest)' },

		{ method: 'GET', path: '/users', auth: 'none', description: 'List all users (Nest)' },
		{ method: 'POST', path: '/users/register', auth: 'none', description: 'Create user (Nest)' },
		{ method: 'PATCH', path: '/users/:id', auth: 'none', description: "Update user's active flag (Nest)" },
		{ method: 'DELETE', path: '/users/:id', auth: 'none', description: 'Delete user (Nest)' },

		{ method: 'POST', path: '/products', auth: 'Bearer <user-token>', description: 'Create product (multipart/form-data, key files[]) (Nest)' },
		{ method: 'GET', path: '/products', auth: 'none', description: 'List all products (Nest)' },
		{ method: 'GET', path: '/products/me', auth: 'Bearer <user-token>', description: "Get logged user's products (Nest)" },
		{ method: 'PUT', path: '/products/:id', auth: 'Bearer <user-token>', description: 'Update product (owner check, Nest)' },
		{ method: 'DELETE', path: '/products/:id', auth: 'conditional', description: 'Delete product (owner check if auth, Nest)' },

		{ method: 'POST', path: '/admin/products', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Admin create product (multipart) (Nest)' },
		{ method: 'GET', path: '/admin/products', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'List all products (admin, Nest)' },
		{ method: 'GET', path: '/admin/products/:id', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Get product (admin, Nest)' },
		{ method: 'PUT', path: '/admin/products/:id', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Update product (admin, Nest)' },
		{ method: 'DELETE', path: '/admin/products/:id', auth: 'Bearer <admin-token> (role=ADMIN)', description: 'Delete product (admin, Nest)' },

		{ method: 'GET', path: '/stats/users', auth: 'none', description: 'User statistics (Nest)' },

		{ method: 'POST', path: '/api/products', auth: 'none', description: 'Legacy express route (uploads example) — defined in src/routes/products.ts' },
	];

	res.json({
		success: true,
		message: 'Welcome to Use & Sell — Express helper API (list of known endpoints below)',
		endpoints,
		notes: 'When testing admin routes use an admin user (seed script creates admin@example.com / password123). For file uploads use multipart/form-data with key `files`.'
	});
});

app.use("/api/products", productsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

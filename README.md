# Use & Sell Marketplace

A full-featured online marketplace where users can list, buy, and sell used items. Built with modern web technologies for scalability and performance.

## Features
- User registration and login
- Add, update, and delete items
- Browse items by category
- Search items
- Responsive design for web and mobile
- RESTful API endpoints tested via Postman

## Tech Stack
- **Frontend:** React, Next.js
- **Backend:** NestJS, Node.js
- **Database:** PostgreSQL (connected via pgAdmin)
- **ORM:** Prisma
- **API Testing:** Postman

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohiyo82/use-sell-marketplace.git
   ```

2. **Navigate to the project folder:**
   ```bash
   cd use-sell-marketplace
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Setup environment variables:**
   - Copy `.env.example` to `.env`
   - Update your database credentials in `.env` (host, port, username, password, database name)

5. **Run database migrations (Prisma):**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the backend server:**
   ```bash
   npm run start:dev
   ```

7. **Start the frontend (Next.js) server:**
   ```bash
   npm run dev
   ```

## Usage
- Open your browser and go to `http://localhost:3000`
- Register a new account or login
- Browse, list, and buy items
- Use Postman to test backend API endpoints at `http://localhost:3001` (or your configured backend port)

## Contributing
- Fork the repository
- Create a new branch for your feature
- Make changes and submit a pull request

## License
MIT License

# ShopHub - Next.js Full Stack E-Commerce

A production-ready full-stack e-commerce platform built with Next.js 14, MongoDB, and modern UI/UX practices.

## Features

### Customer Features
- 🛒 **Shopping Cart** - Persistent cart with quantity management
- ❤️ **Wishlist** - Save favorite products for later
- 🔍 **Advanced Search & Filters** - Filter by category, price, rating, and more
- 👤 **User Authentication** - Register, login, profile management
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 💳 **Checkout Flow** - Multi-step checkout with coupon support

### Admin Features
- 📊 **Dashboard** - Sales overview, statistics, recent orders
- 🏷️ **Product Management** - Full CRUD with bulk operations
- 📁 **Category Management** - Hierarchical categories with subcategories
- 📦 **Order Management** - Order tracking, status updates
- 🎫 **Coupon System** - Percentage & fixed discounts
- 🖼️ **Banner Management** - Home page promotional banners
- 👥 **User Management** - View and manage customers

### Technical Features
- 🔒 **JWT Authentication** - Secure API authentication
- 📈 **MongoDB** - Flexible database with Mongoose
- 🎨 **Tailwind CSS** - Modern, responsive styling
- 🔔 **Toast Notifications** - User feedback system
- 📦 **Zustand** - Lightweight state management

## Project Structure

```
nextjs-ecommerce/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── products/      # Product endpoints
│   │   │   ├── orders/        # Order endpoints
│   │   │   ├── categories/    # Category endpoints
│   │   │   ├── coupons/       # Coupon endpoints
│   │   │   ├── banners/       # Banner endpoints
│   │   │   └── admin/         # Admin endpoints
│   │   ├── admin/             # Admin pages
│   │   ├── customer/          # Customer pages
│   │   └── login/             # Auth pages
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   ├── customer/          # Customer components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── models/            # Mongoose models
│   │   ├── mongodb.js         # Database connection
│   │   └── utils.js           # Utility functions
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd nextjs-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-secret-key
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

### Demo Accounts

- **Admin**: admin@shophub.com / admin123
- **Customer**: user@example.com / user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[id]` - Get single product
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/admin/orders/[id]` - Update order status

### Coupons
- `GET /api/coupons` - List coupons
- `POST /api/coupons` - Create coupon (admin)

### Banners
- `GET /api/banners` - List banners
- `POST /api/banners` - Create banner (admin)

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **Authentication**: JWT
- **Payments**: Stripe (ready to integrate)

## License

MIT License

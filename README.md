# ShopHub - Full Stack E-Commerce Platform

A production-ready, full-stack e-commerce platform built with Next.js 16, MongoDB, and modern UI/UX practices. ShopHub provides a complete online shopping experience with a modern customer-facing storefront and a powerful admin dashboard.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [License](#license)

---

## Tech Stack

### Core Technologies

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 16.1.6 |
| **Language** | JavaScript/React | React 19.2.4 |
| **Database** | MongoDB | - |
| **ODM** | Mongoose | 9.2.3 |
| **Styling** | Tailwind CSS | 4.2.1 |

### State & Data Management

| Purpose | Library |
|---------|---------|
| Client State | Zustand 5.0.11 |
| Server State | React Query (built-in) |
| Form Validation | Zod 4.3.6 |

### Authentication & Security

| Purpose | Library |
|---------|---------|
| Authentication | NextAuth.js 4.24.13 |
| JWT | jsonwebtoken 9.0.3 |
| Password Hashing | bcryptjs 3.0.3 |

### Payments & Media

| Purpose | Library |
|---------|---------|
| Payments | Stripe 20.4.0 |
| Image Upload | Cloudinary 2.9.0 |
| Email | Resend 6.9.3 |

### UI & UX

| Purpose | Library |
|---------|---------|
| Icons | react-icons 5.5.0 |
| Toast Notifications | react-hot-toast 2.6.0, react-toastify 11.0.5 |
| Dark Mode | next-themes 0.4.6 |
| Class Merging | tailwind-merge 3.5.0, clsx 2.1.1 |

### Development Tools

| Purpose | Library |
|---------|---------|
| HTTP Client | Axios 1.13.6 |
| Linting | ESLint 10.0.2 |
| CSS Processing | PostCSS, Autoprefixer |

---

## Features

### Customer Features

#### Shopping Experience
- **Product Catalog** - Browse products with grid/list views, sorting, and pagination
- **Advanced Search** - Real-time search with autocomplete suggestions
- **Product Filtering** - Filter by category, price range, rating, brand, and more
- **Product Details** - High-quality images, specifications, reviews, and related products
- **Quick View Modal** - Preview products without leaving the current page
- **Product Comparison** - Compare up to 4 products side-by-side

#### Shopping Cart
- **Persistent Cart** - Cart items saved across sessions
- **Quantity Management** - Add, remove, and update quantities
- **Price Calculations** - Automatic subtotal, tax, and total calculations
- **Coupon Codes** - Apply discount codes at checkout

#### Wishlist
- **Save Favorites** - Add products to wishlist for later
- **Move to Cart** - Easily transfer wishlist items to cart
- **Persistent Storage** - Wishlist saved to database when logged in

#### User Account
- **Authentication** - Register, login, logout functionality
- **Profile Management** - Update personal information and avatar
- **Order History** - View past orders and their status
- **Address Book** - Manage multiple shipping addresses
- **Password Reset** - Forgot password and reset functionality

#### Checkout & Orders
- **Guest Checkout** - Purchase without creating an account
- **Multi-step Checkout** - Shipping, payment, and confirmation steps
- **Order Confirmation** - Email confirmation with order details
- **Order Tracking** - Track order status and history

#### Additional Features
- **Newsletter Subscription** - Subscribe for updates and promotions
- **Stock Notifications** - Get notified when out-of-stock items are available
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Mode** - System preference detection with manual toggle

---

### Admin Features

#### Dashboard
- **Sales Overview** - Total revenue, orders, and key metrics
- **Recent Orders** - Latest orders with quick actions
- **Statistics Cards** - Visual representation of key data
- **Quick Actions** - Common admin tasks at your fingertips

#### Product Management
- **CRUD Operations** - Create, read, update, delete products
- **Bulk Operations** - Select and delete multiple products
- **Image Management** - Upload multiple product images
- **Inventory Tracking** - Stock quantity management
- **Variants** - Size, color, and other product variants

#### Category Management
- **Hierarchical Categories** - Parent and subcategory support
- **Category CRUD** - Full management of categories
- **Category Assignment** - Assign products to categories

#### Order Management
- **Order List** - View all orders with filtering
- **Order Details** - Complete order information
- **Status Updates** - Update order status (pending, processing, shipped, delivered)
- **Order History** - Track order timeline

#### Coupon System
- **Percentage Discounts** - % off total order
- **Fixed Amount Discounts** - Fixed amount off total order
- **Usage Limits** - Set maximum uses per coupon
- **Expiry Dates** - Set coupon validity period

#### Banner Management
- **Promotional Banners** - Add/remove home page banners
- **Banner Links** - Link banners to specific pages
- **Banner Scheduling** - Control banner visibility

#### User Management
- **Customer List** - View all registered users
- **User Details** - View user profile and order history
- **Admin Roles** - Assign admin privileges (future enhancement)

#### Review Management
- **Review Moderation** - View and manage product reviews
- **Review Status** - Approve or reject reviews
- **Rating Summary** - View average ratings per product

#### Settings
- **Site Settings** - Configure store information
- **Email Templates** - Customize email notifications

---

## Project Structure

```
shophub/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Authentication pages
│   │   │   ├── login/               # Login page
│   │   │   ├── register/           # Registration page
│   │   │   ├── forgot-password/     # Password recovery
│   │   │   └── reset-password/      # Password reset
│   │   ├── (customer)/              # Customer pages
│   │   │   ├── account/            # User account
│   │   │   ├── cart/               # Shopping cart
│   │   │   ├── checkout/           # Checkout flow
│   │   │   ├── collections/        # Product collections
│   │   │   ├── orders/             # Order history
│   │   │   ├── product/[id]/       # Product details
│   │   │   ├── search/             # Search results
│   │   │   └── wishlist/           # User wishlist
│   │   ├── (admin)/                # Admin pages
│   │   │   └── admin/              # Admin dashboard
│   │   │       ├── dashboard/      # Admin dashboard
│   │   │       ├── products/       # Product management
│   │   │       ├── categories/     # Category management
│   │   │       ├── orders/         # Order management
│   │   │       ├── users/          # User management
│   │   │       ├── coupons/        # Coupon management
│   │   │       ├── banners/        # Banner management
│   │   │       ├── reviews/        # Review management
│   │   │       └── settings/       # Site settings
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/               # Authentication endpoints
│   │   │   ├── products/           # Product CRUD
│   │   │   ├── categories/         # Category CRUD
│   │   │   ├── orders/             # Order CRUD
│   │   │   ├── users/              # User management
│   │   │   ├── coupons/            # Coupon CRUD
│   │   │   ├── banners/            # Banner CRUD
│   │   │   ├── reviews/            # Review CRUD
│   │   │   ├── addresses/          # Address management
│   │   │   ├── stock-notifications/# Stock alerts
│   │   │   ├── newsletter/         # Newsletter subscription
│   │   │   ├── upload/             # Image upload
│   │   │   └── admin/              # Admin-only endpoints
│   │   ├── layout.js               # Root layout
│   │   ├── page.js                 # Home page
│   │   ├── about/                  # About page
│   │   ├── contact/                # Contact page
│   │   ├── compare/                # Product comparison
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── admin/                  # Admin components
│   │   │   ├── AdminLayout.jsx     # Admin layout wrapper
│   │   │   ├── DashboardContent.jsx
│   │   │   ├── ProductsContent.jsx
│   │   │   ├── CategoriesContent.jsx
│   │   │   ├── OrdersContent.jsx
│   │   │   ├── UsersContent.jsx
│   │   │   ├── CouponsContent.jsx
│   │   │   ├── BannersContent.jsx
│   │   │   ├── ReviewsContent.jsx
│   │   │   └── SettingsContent.jsx
│   │   ├── customer/               # Customer components
│   │   │   ├── Navbar.jsx          # Main navigation
│   │   │   ├── Footer.jsx          # Site footer
│   │   │   ├── MobileBottomNav.jsx # Mobile navigation
│   │   │   ├── HeroSection.jsx    # Home page hero
│   │   │   ├── FeaturedProducts.jsx
│   │   │   ├── RecentProducts.jsx
│   │   │   ├── CollectionsContent.jsx
│   │   │   ├── CartContent.jsx
│   │   │   ├── WishlistContent.jsx
│   │   │   ├── QuickViewModal.jsx
│   │   │   ├── CompareBar.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   └── ...
│   │   ├── ui/                     # Reusable UI components
│   │   └── ClientProviders.jsx    # Context providers
│   ├── lib/
│   │   ├── models/                 # Mongoose models
│   │   │   ├── User.js             # User schema
│   │   │   ├── Product.js          # Product schema
│   │   │   ├── Category.js         # Category schema
│   │   │   ├── Order.js            # Order schema
│   │   │   ├── Coupon.js           # Coupon schema
│   │   │   ├── Banner.js           # Banner schema
│   │   │   └── Review.js            # Review schema
│   │   ├── mongodb.js              # MongoDB connection
│   │   ├── utils.js                # Utility functions
│   │   └── email.js                # Email sending functions
│   ├── store/                      # Zustand stores
│   │   ├── index.js                # Main store (cart, wishlist, auth)
│   │   └── stockNotification.js    # Stock notification store
│   └── types/                      # TypeScript types (if used)
├── public/                         # Static assets
├── .env.local                      # Environment variables
├── package.json                    # Dependencies
├── next.config.js                  # Next.js configuration
├── postcss.config.mjs              # PostCSS configuration
├── jsconfig.json                   # JavaScript configuration
└── README.md                       # This file
```

---

## Getting Started

### Prerequisites

Before running the project, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **MongoDB** instance (local or MongoDB Atlas)
- **Cloudinary** account for image storage (optional)
- **Stripe** account for payment processing (optional)
- **Resend** account for email sending (optional)

### Installation

1. **Clone the repository**

   ```bash
   cd shophub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   Or if using yarn:

   ```bash
   yarn install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` with your configuration (see [Environment Variables](#environment-variables) section).

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

For testing purposes, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shophub.com | admin123 |
| Customer | user@example.com | user123 |

**Note:** You may need to create these users manually or modify the seed data.

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Authentication

```env
# JWT Secret for token generation (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Stripe Payment

```env
# Stripe Secret Key (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Publishable Key (for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (for local development)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cloudinary (Image Upload)

```env
# Cloudinary credentials (get from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET_KEY=your-api-secret
```

### Email (Resend)

```env
# Resend API Key for sending emails
RESEND_API_KEY=re_...

# Email domain for sending
NEXT_PUBLIC_EMAIL_DOMAIN=yourdomain.com
```

### Application

```env
# Base URL of the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/session` | Get current session | Yes |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET | `/api/products` | List products (with filters) | No |
| GET | `/api/products/[id]` | Get single product | No |
| POST | `/api/admin/products` | Create product | Admin |
| PUT | `/api/admin/products/[id]` | Update product | Admin |
| DELETE | `/api/admin/products/[id]` | Delete product | Admin |

### Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET | `/api/categories` | List categories | No |
| POST | `/api/admin/categories` | Create category | Admin |
| PUT | `/api/admin/categories/[id]` | Update category | Admin |
| DELETE | `/api/admin/categories/[id]` | Delete category | Admin |

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET | `/api/orders` | List user orders | Yes |
| GET | `/api/orders/[id]` | Get order details | Yes |
| POST | `/api/orders` | Create new order | Yes |
| PUT | `/api/admin/orders/[id]` | Update order status | Admin |
| DELETE | `/api/admin/orders/[id]` | Delete order | Admin |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET | `/api/users` | List users | Admin |
| GET | `/api/users/[id]` | Get user details | Yes |
| PUT | `/api/users/[id]` | Update user | Yes |
| DELETE | `/api/users/[id]` | Delete user | Admin |

### Coupons

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET | `/api/coupons` | List coupons | No |
| POST | `/api/coupons` | Validate coupon | No |
| POST | `/api/admin/coupons` | Create coupon | Admin |
| PUT | `/api/admin/coupons/[id]` | Update coupon | Admin |
| DELETE | `/api/admin/coupons/[id]` | Delete coupon | Admin |

### Banners

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET | `/api/banners` | List banners | No |
| POST | `/api/admin/banners` | Create banner | Admin |
| PUT | `/api/admin/banners/[id]` | Update banner | Admin |
| DELETE | `/api/admin/banners/[id]` | Delete banner | Admin |

### Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET | `/api/reviews` | List reviews (by product) | No |
| POST | `/api/reviews` | Create review | Yes |
| PUT | `/api/reviews/[id]` | Update review | Yes |
| DELETE | `/api/reviews/[id]` | Delete review | Yes |

### Other Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|---------------|
| GET/POST | `/api/addresses` | Manage addresses | Yes |
| POST | `/api/stock-notifications` | Subscribe to stock alerts | No |
| POST | `/api/newsletter` | Subscribe to newsletter | No |
| POST | `/api/upload` | Upload image | Admin |

---

## Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String,
  role: String (enum: ['user', 'admin']),
  isVerified: Boolean,
  addresses: [{
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model

```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  price: Number,
  comparePrice: Number,
  images: [String],
  category: ObjectId (ref: Category),
  subcategory: String,
  brand: String,
  sku: String,
  stock: Number,
  soldCount: Number,
  rating: Number,
  reviewsCount: Number,
  features: [String],
  specifications: Object,
  isActive: Boolean,
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model

```javascript
{
  name: String,
  slug: String (unique),
  description: String,
  image: String,
  parentCategory: ObjectId (ref: Category, nullable),
  isActive: Boolean,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: String,
  paymentStatus: String (enum: ['pending', 'paid', 'failed']),
  orderStatus: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  subtotal: Number,
  shippingCost: Number,
  tax: Number,
  discount: Number,
  total: Number,
  coupon: ObjectId (ref: Coupon),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Coupon Model

```javascript
{
  code: String (unique),
  description: String,
  discountType: String (enum: ['percentage', 'fixed']),
  discountValue: Number,
  minOrderAmount: Number,
  maxUses: Number,
  usedCount: Number,
  startsAt: Date,
  expiresAt: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Banner Model

```javascript
{
  title: String,
  description: String,
  image: String,
  link: String,
  isActive: Boolean,
  order: Number,
  startsAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model

```javascript
{
  user: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  rating: Number (1-5),
  comment: String,
  images: [String],
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Development Guide

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** (optional) for code formatting
- **Tailwind CSS** for styling

### Adding New Features

#### Creating a New Page

1. Create a new directory in `src/app/`
2. Add a `page.js` file for the page component
3. Optionally add a `layout.js` for a custom layout
4. Add API routes in `src/app/api/`

#### Creating a New Component

1. Create component file in `src/components/customer/` or `src/components/admin/`
2. Use existing components as reference for patterns
3. Import and use the component in your pages

#### Creating a New API Route

1. Create a directory in `src/app/api/`
2. Add `route.js` for the API handler
3. Implement GET, POST, PUT, DELETE methods as needed
4. Add authentication checks for protected routes

#### Adding a New Database Model

1. Create a new file in `src/lib/models/`
2. Define the Mongoose schema
3. Export the model
4. Use the model in your API routes

### State Management with Zustand

The project uses Zustand for client-side state management. Stores are located in `src/store/`.

Example store usage:

```javascript
import { useCartStore } from '@/store';

// In a component
const { items, addItem, removeItem, clearCart } = useCartStore();
```

### Authentication Flow

1. User submits login credentials
2. API validates and returns JWT token
3. Token stored in cookies/localStorage
4. Subsequent requests include token in Authorization header
5. Middleware verifies token on each request

### Payment Integration

Stripe integration is partially implemented. To complete:

1. Configure Stripe keys in `.env.local`
2. Create Stripe checkout session in API
3. Redirect to Stripe checkout
4. Handle webhook for payment confirmation

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with automatic builds

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t shophub .
docker run -p 3000:3000 shophub
```

### Other Platforms

For other hosting platforms:

1. Run `npm run build` to create production build
2. Start with `npm run start`
3. Configure environment variables
4. Set up reverse proxy (nginx, etc.)

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check your `MONGODB_URI` in `.env.local`
- Ensure MongoDB instance is running
- Check network/firewall settings

**Image Upload Fails**
- Verify Cloudinary credentials
- Check Cloudinary storage limits
- Ensure image size is under limit

**Authentication Issues**
- Clear cookies and try again
- Check JWT_SECRET is set
- Verify token hasn't expired

**Stripe Payment Issues**
- Check Stripe keys are correct
- Verify webhook is configured
- Check Stripe dashboard for errors

### Getting Help

For issues and feature requests, please open an issue on the project repository.

---

## License

MIT License - see LICENSE file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Stripe](https://stripe.com/) - Payments
- [Cloudinary](https://cloudinary.com/) - Image management
- [Resend](https://resend.com/) - Email sending

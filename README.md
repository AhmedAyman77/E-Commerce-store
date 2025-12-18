# E-Commerce Store API

Modern e-commerce backend built with Express, MongoDB, Redis, Stripe, and Cloudinary. Provides authentication, product management, cart, coupons, checkout, and analytics endpoints.

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture & Dependencies](#architecture--dependencies)
- [API](#api)
	- [Auth](#auth)
	- [Products](#products)
	- [Cart](#cart)
	- [Coupons](#coupons)
	- [Payments](#payments)
	- [Analytics](#analytics)
- [Data Models](#data-models)
- [Auth & Session Model](#auth--session-model)
- [Caching](#caching)
- [Payments Flow](#payments-flow)
- [Development Notes](#development-notes)

## Overview
Express v5 API for an e-commerce store. Uses JWT (http-only cookies) for auth, MongoDB for persistence, Redis for caching/refresh tokens, Stripe for checkout, and Cloudinary for image storage.

## Quick Start
1) Prereqs: Node 18+, npm, MongoDB connection string, Upstash/Redis URL, Stripe account, Cloudinary credentials.
2) Install dependencies:
```bash
npm install
```
3) Create a `.env` file (see variables below).
4) Run locally:
```bash
npm run dev
```
5) Server defaults to `http://localhost:5000` (override with `PORT`).

## Environment Variables
| Key | Description |
| --- | --- |
| PORT | (optional) Port for the API |
| MONGO_URI | MongoDB connection string |
| ACCESS_TOKEN_SECRET | JWT secret for access tokens |
| REFRESH_TOKEN_SECRET | JWT secret for refresh tokens |
| UPSTASH_REDIS_URL | Redis connection URL for tokens/cache |
| STRIPE_SECRET_KEY | Stripe secret key |
| CLIENT_URL | Frontend base URL for Stripe return links |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| NODE_ENV | Set to `production` to enable secure cookies |

## Project Structure
```
server/
	server.js                # Express bootstrap and route mounting
	controllers/             # Route handlers (auth, products, cart, coupons, payments, analytics)
	routes/                  # Route definitions per domain
	models/                  # Mongoose schemas (User, Product, Order, Coupon)
	middleware/              # Auth guards (protectRoute, adminRoute)
	lib/                     # Integrations (Mongo, Redis, Cloudinary, Stripe)
```

## Architecture & Dependencies
- Express v5 with ES modules (`type: module`).
- MongoDB + Mongoose for data models and queries.
- JWT for auth; tokens stored in http-only cookies.
- Redis (ioredis) for refresh-token storage and featured-products cache.
- Stripe for checkout sessions and order creation.
- Cloudinary for product image upload/deletion.
- Cookie parsing (`cookie-parser`) and body parsing (`express.json`).

## API
Base path: `/api`.

### Auth
- `POST /api/auth/signup` — Register user.
- `POST /api/auth/login` — Login, sets access/refresh cookies.
- `POST /api/auth/logout` — Clears cookies and refresh token in Redis.
- `POST /api/auth/refresh-token` — Issues new access token if refresh token is valid.
- `GET /api/auth/profile` — Returns authenticated user (protected).

### Products
- `GET /api/products` — Admin-only list of all products.
- `GET /api/products/featured` — Public featured products (cached in Redis).
- `GET /api/products/category/:category` — Products by category.
- `GET /api/products/recommendations` — Random 4 products.
- `POST /api/products` — Admin-only create product (uploads image to Cloudinary).
- `PATCH /api/products/:id` — Admin-only toggle featured flag and refresh cache.
- `DELETE /api/products/:id` — Admin-only delete product (also removes Cloudinary image and cache entry).

### Cart
- `GET /api/cart` — Get products in authenticated user cart.
- `POST /api/cart` — Add product to cart.
- `DELETE /api/cart` — Remove a specific product or clear cart.
- `PUT /api/cart/:id` — Update quantity for a product.

### Coupons
- `GET /api/coupons` — Get active coupon for the user.
- `POST /api/coupons/validate` — Validate coupon code for the user.

### Payments
- `POST /api/payments/create-checkout-session` — Create Stripe Checkout session; applies coupon if valid.
- `POST /api/payments/checkout-success` — Finalize order, deactivate coupon, and store order after Stripe success.

### Analytics
- `GET /api/analytics` — Admin-only overview plus daily sales for the past 7 days.

## Data Models
- User: name, email, hashed password, `cartItems` (product refs with quantity), role (`customer|admin`).
- Product: name, description, price, image URL, category, `isFeatured`, timestamps.
- Order: user ref, products [{ product ref, quantity, price }], totalAmount, stripeSessionId, timestamps.
- Coupon: code, discountPercentage, expirationDate, isActive, userId (one active per user), timestamps.

## Auth & Session Model
- Access token (~15m) and refresh token (~7d) are JWTs.
- Both are http-only, same-site cookies. `secure` flag toggles when `NODE_ENV=production`.
- Refresh tokens are stored in Redis (`refresh_token:<userId>`) and validated on refresh; invalidated on logout.

## Caching
- Featured products cached in Redis under `featured_products`.
- Cache refreshed when toggling featured products or deleting a featured product.

## Payments Flow
1) Client calls `/api/payments/create-checkout-session` with products and optional coupon.
2) API builds Stripe line items, applies coupon discount, and returns session ID.
3) After successful payment, client calls `/api/payments/checkout-success` with `sessionId` to create the Order and deactivate coupon (if used). A new coupon is auto-issued for carts totaling `$200`+ (in cents: `>= 20000`).

## Development Notes
- Routes are mounted in `server/server.js` under `/api/*` paths.
- Requests expect JSON bodies; body size limited to 10mb.
- Ensure MongoDB, Redis, Stripe, and Cloudinary credentials are present before running.
- Consider adding validation/middleware (e.g., input validation) and automated tests for production use.


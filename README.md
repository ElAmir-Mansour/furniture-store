# Modern Furniture E-Commerce App

A premium, modern e-commerce platform for furniture, built with the latest full-stack web technologies.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4 (Global layout & utility styling)
- **Language**: TypeScript
- **Database / ORM**: PostgreSQL & Prisma ORM
- **Authentication**: NextAuth.js
- **Payment Gateway**: Paymob (Integrated for Egypt cards/wallets)
- **Internationalization**: `next-intl` (English & Arabic support)
- **Caching / Session**: Redis
- **Mailing**: Gmail API Service Account

## ✨ Key Features

- **Premium UI/UX**: Designed with modern grids, smooth transitions, and responsive components via Tailwind CSS.
- **Optimized Performance**: Next.js Server Components, `next/image` lazy-loading, and SEO-friendly metadata (`generateMetadata`).
- **Full E-Commerce Flow**: Cart management, dynamic checkout state, wishlist support, and webhook-handled Paymob transactions.
- **Admin Dashboard**: Comprehensive CMS to manage products, categories, orders, and promotional codes.
- **Multi-language**: Built-in support for multiple locales.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Redis Server
- Paymob Account (for payments)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy the example environment variables:
```bash
cp .env.example .env
```
Update `.env` with your precise database credentials, Paymob API keys, NextAuth secrets, etc.

3. Push Prisma schema to your database:
```bash
npx prisma db push
# or npx prisma migrate dev
```

4. Run the development server:
```bash
npm run dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

## 🛠️ Project Architecture Highlights
- `src/app/[locale]`: Core application routing, with `layout.tsx` handling server-rendered metadata and i18n wrapping.
- `src/app/api`: Backend integrations including auth logic, cart, category querying, product fetching, and webhook callbacks (`/api/v1/checkout/callback`).
- `src/components`: Reusable UI elements decoupled for modular maintenance.
- `src/services`: Decoupled server-side logic (Paymob Service, Email Service, Checkout Service).

## 🌐 Deployment
This project is optimized for deployment on Vercel or any standard Node.js environment. Ensure all production environment variables are properly configured in your deployment platform's dashboard, particularly `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`.

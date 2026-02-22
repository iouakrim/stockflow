# 📦 StockFlow Pro

A premium, production-ready SaaS application for inventory management, point-of-sale (POS), and business analytics. Built with modern web technologies for both desktop and mobile-first experiences.

## ✨ Features

- **Dashboard Analytics** – Real-time insights into sales, inventory, and customer data
- **Inventory Management** – Track stock levels, manage products, and receive low-stock alerts
- **Point-of-Sale (POS)** – Fast, intuitive sales system with cart management
- **Customer Management** – Track customers, manage credit, and payment history
- **Credit System** – Customer credit management with balance tracking
- **Reporting & Insights** – Comprehensive reports for sales, inventory, and performance
- **Receipt Printing** – 80mm thermal printer-optimized receipts
- **Role-Based Access Control** – Secure multi-user support with configurable permissions
- **Mobile-Optimized** – Fully responsive design that feels like a native app
- **PWA Support** – Install on home screen for app-like experience
- **Dark Mode** – Eye-friendly dark theme by default

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: TailwindCSS, ShadCN UI components
- **Backend**: Supabase (PostgreSQL), Row Level Security (RLS)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Internationalization**: next-intl
- **Notifications**: Sonner
- **Command Palette**: cmdk

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop** – Full sidebar navigation, data tables, charts
- **Tablet** – Adaptive layouts with optimized spacing
- **Mobile** – Bottom navigation, stacked cards, mobile-friendly interactions

### Mobile Navigation
- Dashboard
- Sales (POS)
- Products
- Customers
- More (Reports, Settings)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iouakrim/stockflow.git
   cd stockflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Set up database**
   - Run migrations in Supabase console
   - Apply RLS policies for security

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📂 Project Structure

```
stockflow/
├── app/               # Next.js routes (App Router)
├── components/        # Reusable React components
├── lib/              # Utilities and helpers
├── types/            # TypeScript type definitions
├── supabase/         # Database schema and RLS policies
├── messages/         # i18n translations
├── public/           # Static assets
├── scripts/          # Build and utility scripts
└── README.md         # This file
```

## 🔐 Security

- **Authentication**: Supabase Auth
- **Row Level Security (RLS)**: Database-level access control
- **Multi-tenant**: Isolated data per warehouse/organization
- **Type Safety**: Full TypeScript coverage

## 📊 Business Rules

- ✅ Stock cannot go negative
- ✅ Sales immediately reduce inventory
- ✅ Credit increases customer balance
- ✅ Payments reduce customer balance
- ✅ Low stock triggers alerts

## 🎯 Performance

- Fast sale creation (< 1 second)
- Optimized database queries with indexing
- Pagination for large datasets
- Lazy loading for reports
- Mobile-optimized performance
- Code splitting for reduced bundle size

## 🌐 PWA Features

- Installable on mobile home screen
- Custom app icon and splash screen
- Offline fallback support
- Fast startup time
- App-like experience without native code

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build & Deploy
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 📝 Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## 🚧 Development Status

StockFlow Pro is in active development. Core features are functional and ready for testing.

## 📄 License

Proprietary. All rights reserved.

## 👨‍💻 Author

Ismail Ouakrim – [GitHub](https://github.com/iouakrim)

---

**Built with ❤️ for modern inventory management.**

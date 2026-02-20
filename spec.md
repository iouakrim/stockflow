Build a premium SaaS web application named StockFlow Pro.

This must be a production-ready, scalable, modern SaaS.

The application must be fully responsive and provide a premium mobile experience,
so that no native mobile app is required.

The web app must behave like a mobile app on smartphones.

---

# STACK

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI components
- Supabase (PostgreSQL)
- Row Level Security
- Multi-tenant ready architecture
- PWA support (installable on mobile)

---

# RESPONSIVE & MOBILE REQUIREMENTS (CRITICAL)

The application must be fully responsive across:

- Desktop
- Tablet
- Mobile devices

On mobile:

- Replace sidebar with a bottom navigation bar
- Bottom navigation must include:
  - Dashboard
  - Sales
  - Products
  - Customers
  - More (Reports / Settings)

- Sticky bottom navigation
- Thumb-friendly large tap areas
- Optimized spacing for small screens
- Touch-friendly buttons
- No horizontal scrolling
- Optimized forms for mobile keyboards
- Fast loading and smooth transitions

Each page must adapt to mobile layout:

- Cards stack vertically
- Tables become mobile-friendly list views
- Charts resize properly
- Modals become full-screen sheets on mobile
- Sale (POS) page redesigned for mobile with:
  - Full-width product search
  - Cart as slide-up panel or stacked layout
  - Large confirm button fixed at bottom

Mobile experience must feel like:
- A native application
- Smooth
- Minimal
- Premium
- Fast

The goal is to eliminate the need for a native iOS/Android app.

---

# DESIGN REQUIREMENTS

- Dark mode default
- Clean component system
- Reusable UI components
- Modern dashboard layout
- Professional data tables (desktop)
- Mobile-friendly list layouts
- Skeleton loading states
- Error boundaries
- Clear visual hierarchy
- Smooth transitions

---

# CORE FEATURES

1. Authentication (Supabase)
2. Role-based access control
3. Dashboard analytics
4. Product management
5. Stock entry
6. Sales system (POS-like)
7. Credit management
8. Reporting
9. Receipt printing (80mm CSS optimized)

---

# ARCHITECTURE

- Modular folder structure
- Feature-based organization
- Services layer for business logic
- API routes separated
- Hooks for data fetching
- Optimistic updates for sales
- Database transactions for stock operations
- Mobile-first component strategy

---

# BUSINESS RULES

- Stock cannot go negative
- Sale reduces stock immediately
- Credit increases customer balance
- Payment reduces balance
- Low stock triggers alert

---

# DATABASE

Generate:

- Full SQL schema
- Indexing strategy
- RLS policies per warehouse
- Multi-tenant ready design

---

# PERFORMANCE

- Sale creation < 1 second
- Indexed queries
- Pagination
- Lazy loading for reports
- Mobile optimized performance
- Minimal bundle size
- Code splitting enabled

---

# PWA REQUIREMENTS

- Installable on mobile home screen
- App icon
- Splash screen
- Offline fallback page
- Proper viewport handling
- Fast startup

---

# OUTPUT

Generate:

- Complete folder structure
- Responsive layout system
- Mobile bottom navigation component
- Core pages (desktop + mobile optimized)
- API routes
- Supabase schema
- RLS policies
- Receipt template
- Seed data
- PWA configuration
- Production-ready structure

Code must be scalable, responsive, and ready for SaaS expansion.

The mobile experience must feel like a premium native app, without building one.
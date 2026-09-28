# Torque Two-Wheelers — Premium Pre-Owned Motorcycle Dealership

A modern, high-performance web platform built with Next.js App Router for discovering, exploring, and purchasing certified pre-owned motorcycles.

## Features

- **Architectural Editorial Hero**: GSAP-driven interactive spotlight switcher with live specs and fluid multi-layer parallax animation.
- **Curated Bike Inventory**: Full inventory browsing with dynamic search, brand & body type filtering, price range sorting, and high-resolution galleries.
- **Interactive Workflows**:
  - **"I'm Interested" Enquiries**: Direct customer enquiry modal connected to the dedicated database.
  - **Test Ride Bookings**: Seamless booking system with preferred date and time-slot selection.
  - **Sell Your Bike Valuation**: Multi-step valuation and inspection request submission.
  - **Contact & Support**: Integrated messaging and showroom visit booking.
- **Admin Dashboard**:
  - Secure JWT authentication with protected routes.
  - Inventory management (Add, Edit, Toggle Availability, Delete).
  - Workflow tracking for Enquiries, Test Rides, Sell Requests, and Contact Messages with real-time status updates and filtering.
- **Typography System**:
  - Display & Headings: `Space Grotesk`
  - Body & UI: `DM Sans`
- **Architecture**:
  - Next.js App Router with Server Components & API route handlers.
  - MongoDB via Mongoose with standalone database configuration (`used_bikes`).
  - Strict TypeScript with zero errors.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database**: MongoDB with Mongoose (with fallback in-memory capability for dev/testing)
- **Animation**: GSAP (GreenSock Animation Platform)
- **Authentication**: `jose` (JWT) & `bcryptjs`
- **Styling**: Vanilla CSS Modules with custom design tokens

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Vansh-7454/bike_dealership.git
cd bike_dealership
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

### 3. Seed Database & Admin (Optional)

```bash
npm run seed:admin
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## License

Private Project - All rights reserved.

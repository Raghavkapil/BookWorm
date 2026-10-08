# Online Bookstore — AI Specialist Capstone Project

A full-stack e-commerce bookstore built with React, Vite, Tailwind CSS, Node.js/Express, Prisma ORM, and PostgreSQL/SQLite.

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Getting Started](#getting-started)
- [Database & Seed Data](#database--seed-data)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## Project Overview

The Online Bookstore is a modular monolithic web application allowing customers to browse books across categories and publishers, search and filter catalogues, manage carts, apply gift points, complete mock checkouts with simulated payment options, view order histories with immutable price snapshots, re-order past items using "Buy Again", and cancel orders within the 48-hour eligibility window.

---

## Key Features

- **Authentication**: JWT-based login, registration, and session restore (`/api/auth/me`).
- **Catalogue & Search**: Comprehensive book listings with categories, brands, price filters, search queries, pagination, and sorting.
- **Recommendations**: Deterministic rule-based recommendations factoring in user category/brand history, ratings, and inventory status.
- **Cart Management**: Real-time basket updates, stock checks, and subtotal calculations.
- **Address Management**: Multiple delivery addresses with default selection.
- **Checkout & Gift Points**: Pre-order validation, gift-point balance redemption with validation and transaction logging.
- **Payments**: Mock payment gateway with simulated success/failure flows and idempotency.
- **Order Lifecycle**: Order placement, immutable snapshot records, historical price preservation, 48-hour cancellation policy, and quick "Buy Again" basket re-population.

---

## Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Data Fetching / State**: TanStack Query (React Query) + Axios
- **Form Handling & Validation**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Runtime & Framework**: Node.js + Express.js
- **Database & ORM**: PostgreSQL / SQLite + Prisma ORM
- **Security & Middleware**: Helmet, CORS, Express Rate Limit, bcrypt, JWT
- **Validation**: Zod request schema validation
- **Logging**: Pino structured logger

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 2. Setup Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Demo Accounts (Seeded)
- `customer1@bookstore.com` / `Password123!` (Balance: 500 Gift Points)
- `customer2@bookstore.com` / `Password123!` (Balance: 300 Gift Points)
- `customer3@bookstore.com` / `Password123!` (Balance: 1000 Gift Points)

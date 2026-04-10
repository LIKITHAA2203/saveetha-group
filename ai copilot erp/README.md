# ProcureMind – AI-Powered Procurement ERP

ProcureMind is an AI-powered procurement ERP platform designed to automate the procurement lifecycle for SMEs and enterprises.

## Features

- **AI Quote Extraction**: Simulated AI extraction from uploaded quotations.
- **Explainable Vendor Recommendation**: Weighted scoring engine (Cost, Delivery, Quality, Trust, Risk).
- **Vendor Trust Score**: Real-time performance tracking.
- **Procurement Risk Engine**: Automated risk assessment for every quote.
- **Stock Prediction**: Low-stock alerts based on usage trends and lead times.
- **Full Lifecycle Management**: Vendors, RFQs, Quotes, Purchase Orders, and Inventory.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide React, Framer Motion.
- **Backend**: Node.js (Express), SQLite-like JSON store, AI scoring logic.
- **Design**: Technical Dashboard / Data Grid aesthetic (Recipe 1).

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the App**:
   Open `http://localhost:3000` in your browser.

## Demo Accounts

- **Admin**: `admin@procuremind.com`
- **Procurement**: `proc@procuremind.com`
- **Manager**: `manager@procuremind.com`

## Project Structure

- `server.ts`: Full-stack entry point with Express and Vite middleware.
- `src/App.tsx`: Main React entry with routing and auth state.
- `src/layouts/`: Dashboard layout with sidebar and header.
- `src/pages/`: Individual module pages (Dashboard, Vendors, RFQs, etc.).
- `src/lib/utils.ts`: Utility functions for Tailwind class merging.

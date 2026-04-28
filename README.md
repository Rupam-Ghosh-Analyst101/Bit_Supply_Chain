# Bit~Supply Client Portal

**Bit~Supply Client Portal** is a premium, mission-critical logistics and asset intelligence platform. It provides a unified interface for tracking global shipments, managing inventory levels, and analyzing market signals with real-time AI-powered insights.

Built for transparency and operational efficiency, the platform bridges the gap between high-level market intelligence and granular supply chain execution.

---

## 🚀 Key Features

### 1. Unified Logistics Dashboard
- **Global Visibility**: Interactive World Map visualizing real-time shipment movements across continents via `react-simple-maps`.
- **Status Telemetry**: Deep tracking of shipment lifecycles from manufacturing to final delivery.

### 2. Dual-Role Operational Core
- **Client Portal**: Transparent view for customers to track their assets, documents, and requests.
- **Operator View**: High-level management suite for logistics professionals to oversee the entire ecosystem.
- **Dynamic Context Switching**: Seamless transition between roles without data loss.

### 3. Intelligence & Market Explorer
- **Market Pulse**: Real-time stock telemetry with high-fidelity charts using `Recharts`.
- **Historical Analysis**: Customizable timeframes (Daily, Weekly, Monthly, Yearly) with integrated volume analysis.
- **AI Predictions**: Neural node integration for predictive asset movement (simulated and AI-assisted).

### 4. Advanced Inventory Management
- **Replenishment Intelligence**: Automatic priority flagging for low-stock items.
- **Audit Trails**: Detailed history of stock movements and operator actions.
- **Detailed Insights**: Deep dive into individual asset health, including news and historical volatility.

---

## 🛠 Tech Stack

- **Frontend**: [React 18+](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Backend Framework**: [Express](https://expressjs.com/) (Node.js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Premium "Glassmorphism" & Cyberpunk aesthetics)
- **Real-time Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Visualization**: [Recharts](https://recharts.org/), [Lucide](https://lucide.dev/), & [react-simple-maps](https://www.react-simple-maps.io/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- Firebase Account (for Real-time telemetry)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Place your `firebase-applet-config.json` file in the project root. This file is required for real-time telemetry and authentication.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

- `src/components/`: Reusable UI components (Dashboard, WorldMap, MarketExplorer, etc.)
- `src/data/`: Static market data and configuration constants.
- `src/lib/`: Utility functions and helper classes.
- `src/AuthContext.tsx`: Global authentication and role management state.
- `server.ts`: Express server handling development middleware and production serving.

---

## 🛡 Security & Reliability
- **Role-Based Access Control (RBAC)**: Enforced through Firebase Security Rules to ensure data isolation.
- **Serverless Real-time**: Optimized Firestore listeners for minimal latency and high cost-efficiency.
- **Responsive Mastery**: Designed for ultra-wide desktop monitors with mobile-ready adaptive layouts.

---

© 2026 Bit~Supply Inc. | Advanced Asset Intelligence Platform.

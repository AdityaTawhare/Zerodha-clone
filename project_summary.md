# Project Summary: Zerodha Kite Clone (Full-Stack Stock Trading Terminal)

This document provides a comprehensive technical overview and description of the **Zerodha Kite Clone** project. It is structured to serve as an reference for portfolio websites, interview preparation, and resume building.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js (Single Page Application), React Router, Context API (Centralized State Management), Vanilla CSS (Custom Kite UI Design System), Chart.js (Historical & Live Charts), Material-UI (Tooltips & Animations).
- **Backend**: Node.js, Express.js (REST API Endpoints), WebSockets (`ws` library for live tick streaming).
- **Database**: MongoDB, Mongoose ODM (Data modeling for Users, Orders, Holdings, Positions, and Funds).
- **External Feeds**: Yahoo Finance API integration (via `yahoo-finance2`).

---

## 🚀 Key Features & Technical Accomplishments

### 1. Real-Time Price Distribution Engine (WebSockets)
- **Hybrid Feed Strategy**: Solved public API rate-limiting issues by designing a hybrid price engine. It queries real-world stock prices from Yahoo Finance once every 5 minutes and runs a local random-walk simulation every 2 seconds during market hours to stream live ticks to clients.
- **State-Aware Locking**: Implemented timezone-aware constraints that pause simulation ticks when the Indian Stock Market is closed (Mon-Fri 9:15 AM - 3:30 PM IST), keeping stock closing prices completely static, mimicking real exchange behavior.
- **Multi-Client Streaming**: Leveraged a WebSocket server to broadcast real-time stock/index updates to all active sessions simultaneously, achieving low-latency updates.

### 2. Advanced Order Execution & OCO GTT Bracket Orders
- **Order Type Support**: Implemented order routing for Market, Limit, SL (Stoploss Limit), and SL-M (Stoploss Market) transactions.
- **One-Cancels-Other (OCO) Bracket Orders**: Allowed users to place orders with Stoploss % and Target % options (GTT).
- **Trigger Checking Engine**: Developed a background worker in the price engine that scans `PENDING` orders every 2 seconds. When the live price hits a user-defined trigger price or target, it executes the trade, recalculates the average price, adjusts holding/position quantities, and releases or deducts dummy cash margins.

### 3. Dynamic Historical & Live Visualizations
- **Full-Screen Charting**: Developed a dedicated charting terminal matching the TradingView style inside Zerodha, complete with floating Buy/Sell action controls.
- **Live Data Stitching**: Designed a Chart.js view that fetches the last 30-40 calendar days of Yahoo Finance historical prices on page load, and seamlessly appends real-time WebSocket ticks to the final point of the active chart series.

### 4. Pixel-Perfect Portfolio Dashboard UI/UX
- **Summary**: Equity and Holdings metric card widgets with split balance grids.
- **Holdings & Positions**: Real-time total portfolio evaluation, buy/sell average calculators, Day P&L trackers, and responsive hover actions.
- **Orders Book**: Tabbed execution logs with status badges (`PENDING`, `EXECUTED`, `REJECTED`).
- **Funds**: Interactive modal-based deposit/withdrawal system with instant margin updates and simulated segment activation (e.g., Commodity activation).

---

## 📝 Example Resume Bullet Points

- **Developed a high-fidelity Zerodha Kite clone** utilizing a React.js SPA frontend, Node.js/Express.js backend, and MongoDB database, matching the pixel-perfect layouts of the official trading terminal.
- **Architected a real-time price tick engine using WebSockets** that streams live price updates every 2 seconds to connected clients; implemented timezone constraints to pause tick simulations outside Indian Market hours.
- **Built a hybrid data-fetching pipeline** utilizing Yahoo Finance API to fetch historical quotes on startup while avoiding strict rate limits by using an in-memory random-walk simulator for real-time ticks.
- **Implemented bracket (GTT) and OCO (One-Cancels-Other) order execution logic** in Node.js, storing pending trigger prices and automatically executing orders when live prices breached user-defined targets/stoplosses.
- **Designed dynamic stock charts** using Chart.js that fetch 40 days of historical closing prices and append incoming live WebSocket ticks to the chart series in real-time.
- **Managed state sharing across detached top navigation and dashboard sub-components** by restructuring the React Context API provider hierarchy, solving state-desynchronization issues.

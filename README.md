# PortfolioOS — Personal Finance Dashboard

A full-stack personal finance dashboard for tracking investment holdings across US and Indonesian (IDX) markets, managing transactions, visualizing performance, maintaining a double-entry general ledger, and estimating tax liability.

---

## Features

### Navigation tabs

| Tab | Contents |
| --- | --- |
| **Dashboard** | Portfolio overview — hero stats, market breakdown (US / IDX), asset allocation donut, top movers, recent activity |
| **Holdings** | Full position table with market filter (All / US / IDX), type filter (Stock / ETF / Crypto), sortable columns, gain/loss tracking — plus an embedded **Transactions** toggle (buy/sell history with summary banner) |
| **Performance** | Portfolio vs S&P 500 area chart (12-month trailing), alpha/drawdown stat cards, monthly breakdown table — plus an embedded **General Ledger** toggle (double-entry bookkeeping: chart of accounts, journal entries, income/expense summary) |
| **Tax Calc** | Estimated tax liability per tax year — IDX final tax (0.1% of gross proceeds), US capital gains with selectable bracket (0 / 15 / 20 / custom %), unrealized gains reference table |
| **Data Entry** | CRUD forms for all collections: Holdings, Transactions, Price Cache, Ledger Accounts, Journal Entries, Settings — with pencil (edit) and trash (delete) icon buttons |

### Global UI

- **Glassmorphism cards** — `backdrop-filter` blur + semi-transparent backgrounds throughout
- **Animated bubble background** — canvas-based floating glass orbs with pulse/wobble physics
- **Hide numbers** — toggle to mask all monetary values (privacy mode)
- **Night / Day theme** — smooth animated switching with localStorage persistence
- **Currency toggle** — USD / IDR with live conversion via `usdToIdr` setting
- **Market status** — real-time open/closed indicator for NYSE/NASDAQ and IDX
- **Responsive** — mobile hamburger menu, responsive grids down to 320 px

---

## Tech Stack

### Frontend

| | |
| --- | --- |
| Framework | React 18 |
| Charts | Recharts |
| HTTP client | Axios |
| Styling | Plain CSS with CSS custom properties (no CSS framework) |
| State management | React Context API (`ThemeContext`, `HideNumbersContext`, `CurrencyContext`) |
| Build tool | Create React App |

### Backend

| | |
| --- | --- |
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MongoDB via Mongoose 8 |
| Dev server | nodemon |

### Database collections

| Collection | Purpose |
| --- | --- |
| `holdings` | Positions with shares, avg cost, type, market |
| `pricecaches` | Current price + previous close per ticker |
| `transactions` | Buy / sell history |
| `ledgeraccounts` | Chart of accounts |
| `journalentries` | Double-entry journal entries with lines |
| `settings` | Key-value config (e.g. `usdToIdr`) |

---

## Project Structure

```text
WebSite1/
├── client/                        # React frontend (Create React App)
│   └── src/
│       ├── api/                   # portfolioApi.js — all Axios calls + CRUD
│       ├── components/
│       │   ├── BubbleBackground.js  # Canvas animated bubble background
│       │   ├── layout/            # Navbar
│       │   ├── pages/
│       │   │   ├── Dashboard/
│       │   │   ├── Holdings/      # Holdings table + embedded Transactions view
│       │   │   ├── Performance/   # Chart + embedded General Ledger view
│       │   │   ├── TaxCalc/       # Tax liability calculator
│       │   │   ├── Ledger/        # Ledger sub-components (AccountsTable, JournalTable, LedgerSummary)
│       │   │   └── DataEntry/     # CRUD forms + Icons.js
│       │   └── shared/            # LoadingScreen, ErrorScreen
│       ├── constants/             # ui.js (TABS, TYPE_BADGE, MARKET_FLAG, ALLOCATION_COLORS)
│       ├── context/               # ThemeContext, HideNumbersContext, CurrencyContext
│       ├── hooks/                 # usePortfolio, useHoldings, useTransactions, usePerformance, useLedger
│       └── utils/                 # formatters, marketHours
│
└── server/                        # Express backend
    ├── helpers/                   # enrichHoldings, computeBalances
    ├── models/                    # Mongoose models
    │   ├── Holding.js
    │   ├── Transaction.js
    │   ├── PriceCache.js
    │   ├── LedgerAccount.js
    │   ├── JournalEntry.js
    │   └── Setting.js
    ├── routes/                    # Express routers (holdings, transactions, portfolio, prices, ledger, settings, performance)
    ├── scripts/
    │   └── seed.js                # One-time DB seed script
    ├── services/                  # Business logic (transactionsService, etc.)
    ├── db.js                      # Mongoose connection
    └── server.js                  # Entry point
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- A MongoDB instance — either:
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available), **or**
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd WebSite1
```

### 2. Configure the server environment

Create `server/.env`:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=5000
```

> For a **local** MongoDB instance: `MONGODB_URI=mongodb://localhost:27017/portfoliodb`

### 3. Install all dependencies

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 4. Seed the database

```bash
cd server
node server/scripts/seed.js
```

Expected output:

```text
Connected to MongoDB
Cleared existing collections
Inserted 14 holdings
Inserted 14 price cache entries
Inserted 14 transactions
Inserted 16 ledger accounts
Inserted 40 journal entries
Seed complete.
```

### 5. Start both server and client

From the root:

```bash
npm run dev
```

This runs `server` (nodemon on port 5000) and `client` (CRA on port 3000) concurrently.

The app opens at `http://localhost:3000`. API requests are proxied to `http://localhost:5000` automatically.

---

## API Reference

### Holdings

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/holdings` | All holdings enriched with computed metrics |
| `POST` | `/api/holdings` | Insert a new holding |
| `PATCH` | `/api/holdings/:ticker` | Update shares / avgCost / name / type / market |
| `DELETE` | `/api/holdings/:ticker` | Remove a holding |

### Transactions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/transactions` | All transactions (newest first) |
| `POST` | `/api/transactions` | Insert a transaction |
| `DELETE` | `/api/transactions/:id` | Remove a transaction |

### Portfolio

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/portfolio` | Aggregated summary (totals, allocation, movers, market breakdown, recent activity) |

### Price Cache

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/price-cache` | All cached prices |
| `POST` | `/api/price-cache` | Upsert price `{ ticker, currentPrice, previousClose }` |
| `DELETE` | `/api/price-cache/:ticker` | Remove a cached price |

### Ledger

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/ledger/accounts` | All accounts with computed balances |
| `POST` | `/api/ledger/accounts` | Insert a new account |
| `PATCH` | `/api/ledger/accounts/:id` | Update an account |
| `GET` | `/api/ledger/entries` | All journal entries enriched with account names |
| `POST` | `/api/ledger/entries` | Insert a journal entry with lines |
| `DELETE` | `/api/ledger/entries/:id` | Remove a journal entry |
| `GET` | `/api/ledger/summary` | Income/expense summary + monthly trend |

### Settings

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/settings` | All settings as a flat key-value object |
| `PATCH` | `/api/settings/:key` | Upsert a setting value |

### Performance

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/performance` | Monthly portfolio vs benchmark data |

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Server port (default: `5000`) |

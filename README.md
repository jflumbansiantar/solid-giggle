# PortfolioOS — Personal Finance Dashboard

A full-stack personal finance dashboard for tracking investment holdings across US and Indonesian (IDX) markets, managing transactions, visualizing performance, and maintaining a double-entry general ledger.

---

## Features

- **Dashboard** — Portfolio overview with hero stats, market breakdown (US / IDX), recent activity, asset allocation, and top movers
- **Holdings** — Full position table with market filter (All / US / IDX), type filter (Stock / ETF / Crypto), and gain/loss tracking
- **Performance** — Portfolio vs benchmark chart over time with monthly return breakdown
- **Transactions** — Buy/sell history with market and type badges
- **General Ledger** — Double-entry bookkeeping with chart of accounts, journal entries, income/expense summary, and monthly trend
- **Hide numbers** — Toggle to mask all monetary values (privacy mode)
- **Night / Day mode** — Smooth animated theme switching with localStorage persistence
- **Market status** — Real-time open/closed indicator for NYSE/NASDAQ and IDX
- **Responsive** — Mobile hamburger menu, responsive grids down to 320px

---

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 18 |
| Charts | Recharts |
| HTTP client | Axios |
| Styling | Plain CSS with CSS custom properties (no CSS framework) |
| State management | React Context API (`ThemeContext`, `HideNumbersContext`) |
| Build tool | Create React App |

### Backend
| | |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MongoDB (via Mongoose) |
| Environment | dotenv |
| Dev server | nodemon |

### Database
| | |
|---|---|
| Database | MongoDB Atlas (cloud) or local MongoDB Community |
| ODM | Mongoose 8 |
| Collections | `holdings`, `transactions`, `pricecaches`, `ledgeraccounts`, `journalentries` |

---

## Project Structure

```
WebSite1/
├── client/                        # React frontend (Create React App)
│   └── src/
│       ├── api/                   # Axios API calls
│       ├── components/
│       │   ├── layout/            # Navbar
│       │   ├── pages/             # Dashboard, Holdings, Performance, Transactions, Ledger
│       │   └── shared/            # LoadingScreen, ErrorScreen
│       ├── constants/             # UI constants, allocation colours
│       ├── context/               # ThemeContext, HideNumbersContext
│       ├── hooks/                 # usePortfolio, useHoldings, etc.
│       └── utils/                 # formatters, marketHours
│
└── server/                        # Express backend
    ├── data/                      # Static seed data (holdings, transactions, ledger)
    ├── helpers/                   # enrichHoldings, computeBalances
    ├── models/                    # Mongoose models
    │   ├── Holding.js
    │   ├── Transaction.js
    │   ├── PriceCache.js
    │   ├── LedgerAccount.js
    │   └── JournalEntry.js
    ├── routes/                    # Express routers
    ├── scripts/
    │   └── seed.js                # One-time DB seed script
    ├── services/                  # Business logic
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

Create the `.env` file inside the `server/` folder (already exists as a placeholder):

```bash
# server/.env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=5000
```

> For a **local** MongoDB instance use: `MONGODB_URI=mongodb://localhost:27017/portfoliodb`

### 3. Install server dependencies

```bash
cd server
npm install
```

### 4. Seed the database

Run the seed script once to populate MongoDB with the sample data:

```bash
node scripts/seed.js
```

Expected output:
```
Connected to MongoDB
Cleared existing collections
Inserted 14 holdings
Inserted 14 price cache entries
Inserted 14 transactions
Inserted 16 ledger accounts
Inserted 40 journal entries
Seed complete.
```

### 5. Start the server

```bash
npm run dev        # development (nodemon, auto-restarts on changes)
# or
npm start          # production
```

The API will be available at `http://localhost:5000`.

### 6. Install client dependencies

Open a **new terminal**:

```bash
cd client
npm install
```

### 7. Start the client

```bash
npm start
```

The app will open at `http://localhost:3000`. API requests are proxied to `http://localhost:5000` automatically (configured in `client/package.json`).

---

## API Reference

### Holdings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/holdings` | All holdings (enriched with computed metrics) |
| `POST` | `/api/holdings` | Insert a new holding |
| `PATCH` | `/api/holdings/:ticker` | Update shares / avgCost |
| `DELETE` | `/api/holdings/:ticker` | Remove a holding |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | All transactions (newest first) |
| `POST` | `/api/transactions` | Insert a transaction |
| `DELETE` | `/api/transactions/:id` | Remove a transaction |

### Portfolio
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/portfolio` | Aggregated portfolio summary (totals, allocation, movers, market breakdown, recent activity) |

### Price Cache
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/price-cache` | All cached prices |
| `POST` | `/api/price-cache` | Upsert price for a ticker `{ ticker, currentPrice, previousClose }` |
| `DELETE` | `/api/price-cache/:ticker` | Remove a cached price |

### Ledger
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ledger/accounts` | All accounts with computed balances |
| `POST` | `/api/ledger/accounts` | Insert a new account |
| `PATCH` | `/api/ledger/accounts/:id` | Update an account |
| `GET` | `/api/ledger/entries` | All journal entries (enriched with account names) |
| `POST` | `/api/ledger/entries` | Insert a journal entry with lines |
| `POST` | `/api/ledger/entries/:id/lines` | Add a line to an existing entry |
| `DELETE` | `/api/ledger/entries/:id` | Remove a journal entry |
| `GET` | `/api/ledger/summary` | Income/expense summary + monthly trend |

### Performance
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/performance` | Monthly portfolio vs benchmark data |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Server port (default: `5000`) |

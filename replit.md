# GigoloMeet.in — Landing Page + Member Platform

Dark-luxury registration and membership platform for **Gigolomeet.in**, India's gigolo job platform.

## Tech Stack

- **React 19** + **TypeScript** (frontend)
- **Vite 7** (dev server, port 5000)
- **Tailwind CSS v4** (dark/gold theme)
- **Wouter** (client-side routing)
- **Framer Motion** (animations)
- **Express.js** (API server, port 3001)
- **SQLite** via `better-sqlite3` (database at `./data/gigolo.db`)
- **bcryptjs** (password hashing)
- **express-session** (user sessions)

## Running the Project

```bash
npm run dev        # Starts both Vite (port 5000) and Express API (port 3001)
```

Vite proxies `/api/*` to Express on port 3001.

## Routes

| URL | Description |
|---|---|
| `/` | Landing page (register, how it works, pricing, FAQ) |
| `/login` | Member login |
| `/dashboard` | Member dashboard (step wizard + profile management) |
| `/admin` | Admin panel (view submissions, create login credentials) |

## Admin Panel

- URL: `/admin`
- Default password: `admin@gigolo2024`
- Change via env var: `ADMIN_PASSWORD`

## Flow

1. User fills registration form on landing page → saved to DB + Telegram notification sent
2. Admin logs in at `/admin`, sees submission, clicks "Set Login" to create credentials
3. User logs in at `/login` with mobile number + password set by admin
4. User dashboard shows 3-step wizard: Account Activated → Update Profile → Submit for Review
5. Admin reviews submitted profiles and approves/rejects them

## Project Structure

```
server/
├── index.js        # Express API server (port 3001)
└── db.js           # SQLite schema & connection
src/
├── App.tsx         # Router (wouter)
├── main.tsx        # Entry point
├── index.css       # Tailwind v4 + CSS variables
├── pages/
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Member login
│   ├── Dashboard.tsx   # Member dashboard + profile
│   ├── Admin.tsx       # Admin panel
│   └── not-found.tsx   # 404
├── components/
│   ├── sections/       # All landing page sections
│   └── ui/             # shadcn-style UI components
├── hooks/
└── lib/utils.ts
data/
└── gigolo.db       # SQLite database (created on first run)
```

## Environment Variables / Secrets

| Variable | Purpose | Default |
|---|---|---|
| `SESSION_SECRET` | Session signing key | set in Replit Secrets |
| `ADMIN_PASSWORD` | Admin panel password | `admin@gigolo2024` |
| `TG_TOKEN` | Telegram bot token | hardcoded in server/index.js |
| `TG_CHAT` | Telegram chat ID | hardcoded in server/index.js |

## User Preferences

- Keep the dark/gold luxury theme throughout all new pages
- Admin panel and user dashboard should match the same design language as the landing page
- Mobile number is always the username — admin sets the password

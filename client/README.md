# TransFast Client — React + Vite Frontend

Modern React frontend for the TransFast International Remittance Platform.

## Tech Stack

- **Build Tool**: Vite 5
- **UI**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **State**: React Context + Zustand
- **Forms**: React Hook Form
- **Charts**: Recharts
- **HTTP**: Axios
- **Toast**: React Hot Toast
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## Project Structure

```
client/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx               # App entry
    ├── App.jsx                # Router + layout setup
    ├── index.css              # Global styles + Tailwind
    ├── context/
    │   └── AuthContext.jsx    # Auth state management
    ├── utils/
    │   └── api.js             # Axios instance + all API calls
    ├── components/
    │   └── layout/
    │       ├── UserLayout.jsx  # Sidebar layout for users
    │       └── AdminLayout.jsx # Sidebar layout for admins
    └── pages/
        ├── LandingPage.jsx     # Public home page
        ├── auth/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── ForgotPasswordPage.jsx
        ├── user/
        │   ├── DashboardPage.jsx
        │   ├── SendMoneyPage.jsx       # 4-step transfer wizard
        │   ├── TransactionsPage.jsx
        │   ├── TransactionDetailPage.jsx
        │   ├── BeneficiariesPage.jsx
        │   ├── KYCPage.jsx
        │   ├── ProfilePage.jsx
        │   └── RatesPage.jsx
        └── admin/
            ├── AdminDashboard.jsx      # Charts + stats
            ├── AdminUsers.jsx          # User management
            ├── AdminTransactions.jsx   # Transaction monitoring
            ├── AdminKYC.jsx            # KYC review
            └── AdminAuditLogs.jsx      # Audit trail
```

---

## Quick Start

### 1. Prerequisites

- Node.js >= 18
- The TransFast Server running at `http://localhost:5000`

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (optional)

Create `.env` in the client root:

```env
VITE_API_URL=http://localhost:5000/api
```

> If not set, Vite proxy automatically forwards `/api` requests to `localhost:5000`

### 4. Start Development Server

```bash
npm run dev
```

Opens at: `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

Output in `dist/` folder.

---

## Pages Overview

### Public Pages
| Route | Page |
|-------|------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset |

### User Pages (requires login)
| Route | Page |
|-------|------|
| `/dashboard` | Overview + quick actions |
| `/send-money` | 4-step transfer wizard |
| `/transactions` | Transaction history |
| `/transactions/:id` | Transfer tracking detail |
| `/beneficiaries` | Manage recipients |
| `/kyc` | Identity verification |
| `/rates` | Live exchange rates |
| `/profile` | Account settings |

### Admin Pages (requires admin/compliance role)
| Route | Page |
|-------|------|
| `/admin` | Dashboard with charts |
| `/admin/users` | User management |
| `/admin/transactions` | Transaction monitoring + fraud flags |
| `/admin/kyc` | KYC review queue |
| `/admin/audit-logs` | System audit trail |

---

## Demo Credentials

```
User:   john@example.com  /  User@12345
Admin:  admin@transfast.com  /  Admin@123456
```

(Run the server seed script first: `npm run seed`)

---

## Flutter Integration

This app exposes a REST API at `/api`. The same backend can be used with a Flutter mobile app:

- Base URL: `https://your-domain.com/api`
- Auth: `Authorization: Bearer <JWT_TOKEN>`
- All responses are JSON: `{ success: true, data: ... }`

---

## Customization

- **Colors**: Edit `tailwind.config.js` → `theme.extend.colors`
- **API URL**: Edit `src/utils/api.js` → `baseURL`
- **Countries/Rates**: Integrate real FX API in server `exchange.controller.js`

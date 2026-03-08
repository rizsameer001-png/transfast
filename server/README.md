# TransFast Server — Backend API

Node.js + Express + MongoDB REST API for the TransFast International Remittance Platform.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, express-rate-limit, bcryptjs
- **Validation**: express-validator

---

## Project Structure

```
server/
├── index.js                   # Main entry point
├── config/
│   └── db.js                  # MongoDB connection
├── models/
│   ├── User.model.js           # User schema
│   ├── Transaction.model.js    # Transaction schema
│   ├── Beneficiary.model.js    # Beneficiary schema
│   ├── KYC.model.js            # KYC document schema
│   └── AuditLog.model.js       # Audit trail schema
├── controllers/
│   ├── auth.controller.js      # Register, login, password reset
│   ├── transfer.controller.js  # Initiate, track, cancel transfers
│   ├── beneficiary.controller.js
│   ├── kyc.controller.js
│   ├── admin.controller.js     # Dashboard, user/txn management
│   └── exchange.controller.js  # FX rates, supported countries
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── transfer.routes.js
│   ├── beneficiary.routes.js
│   ├── kyc.routes.js
│   ├── admin.routes.js
│   └── exchange.routes.js
├── middleware/
│   └── auth.middleware.js      # JWT protect, authorize, requireKYC
├── utils/
│   └── seed.js                 # Database seeder
└── .env.example
```

---

## Quick Start

### 1. Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/transfast
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Seed the Database (optional)

```bash
npm run seed
```

This creates:
- Admin: `admin@transfast.com` / `Admin@123456`
- User: `john@example.com` / `User@12345`
- Sample beneficiary and transactions

### 5. Start Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| PUT | `/api/auth/change-password` | Change password |
| GET | `/api/auth/verify-email/:token` | Verify email |

### Transfers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transfers/quote` | Get transfer quote |
| POST | `/api/transfers` | Initiate transfer (KYC required) |
| GET | `/api/transfers` | Get user's transfers |
| GET | `/api/transfers/:id` | Get single transfer |
| PUT | `/api/transfers/:id/cancel` | Cancel transfer |

### Beneficiaries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beneficiaries` | List beneficiaries |
| POST | `/api/beneficiaries` | Add beneficiary |
| PUT | `/api/beneficiaries/:id` | Update beneficiary |
| DELETE | `/api/beneficiaries/:id` | Remove beneficiary |

### KYC
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kyc/submit` | Submit KYC docs |
| GET | `/api/kyc/status` | Get KYC status |

### Exchange
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exchange/rates` | Get FX rates |
| GET | `/api/exchange/countries` | Supported countries |

### Admin (requires admin/compliance role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/status` | Suspend/activate user |
| GET | `/api/admin/transactions` | All transactions |
| PUT | `/api/admin/transactions/:id/status` | Update status |
| GET | `/api/admin/kyc` | KYC submissions |
| PUT | `/api/admin/kyc/:id/review` | Approve/reject KYC |
| GET | `/api/admin/audit-logs` | Audit trail |

---

## Flutter / Mobile Integration

All endpoints return JSON. Use `Authorization: Bearer <token>` header for protected routes.

Base URL for Flutter: `https://your-server-domain.com/api`

---

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Set strong `JWT_SECRET`
4. Use PM2 or Docker for process management
5. Put behind Nginx reverse proxy

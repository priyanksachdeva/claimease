# ClaimEase Full-Stack Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 16 (via Docker recommended)
- Docker & Docker Compose (for database)

### Step 1: Setup Database

Start PostgreSQL locally using Docker:

```bash
docker-compose up -d
```

This starts:

- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379 (for future caching)

Verify connection:

```bash
psql -U claimease -d claimease -h localhost -p 5432
# Password: claimease123
```

### Step 2: Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Update `.env` if needed (defaults work with Docker setup).

Start backend:

```bash
npm run dev
```

Backend runs at: **http://localhost:3001**

**Demo Credentials Created Automatically:**

- Patient: `patient@example.com` / `patient123`
- Hospital Admin: `admin@cityhospital.com` / `hospital123`
- Insurance Admin: `admin@healthcareplus.com` / `insurance123`

### Step 3: Setup Hospital Portal

```bash
cd frontend/hospital
npm install
npm run dev
```

Runs at: **http://localhost:3002**

### Step 4: Setup Insurance Portal

```bash
cd frontend/insurance
npm install
npm run dev
```

Runs at: **http://localhost:3003**

### Step 5: Setup Patient PWA (Original)

```bash
cd frontend/patient
npm install
npm run dev
```

Runs at: **http://localhost:5173**

## 🏗️ Architecture

### Backend Structure

```
backend/src/
├── db/
│   ├── connection.ts      # Database connection pool
│   └── migrations.ts      # Schema initialization
├── middleware/
│   └── auth.ts            # JWT authentication
├── controllers/           # Business logic handlers
│   ├── auth.controller.ts
│   ├── bills.controller.ts
│   └── claims.controller.ts
├── services/              # Reusable business logic
│   ├── auth.service.ts
│   └── organization.service.ts
├── routes/                # API endpoints
│   ├── auth.ts
│   ├── bills.ts
│   └── claims.ts
├── types/
│   └── index.ts           # TypeScript interfaces
├── utils/
│   ├── jwt.ts            # JWT utilities
│   └── password.ts       # Hashing utilities
└── server.ts             # Express app entry point
```

### Frontend Structure (All Three)

```
frontend/{patient|hospital|insurance}/src/
├── pages/                 # Route-level components
├── components/            # Reusable components
├── lib/                   # Utilities (API calls, helpers)
├── hooks/                 # Custom React hooks
├── stores/                # Zustand state management
├── App.tsx               # Router setup
└── main.tsx              # Entry point
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)

```
POST   /register          # Create new user
POST   /login             # Login user
GET    /me                # Get current user (requires auth)
```

### Bills (`/api/bills`)

```
POST   /                  # Create bill
GET    /:id               # Get bill details
GET    /user/my-bills     # Get user's bills
GET    /hospital/bills    # Get hospital's bills (hospital role)
PATCH  /:id/status        # Update bill status
```

### Claims (`/api/claims`)

```
POST   /                  # Create claim
GET    /:id               # Get claim details
GET    /user/my-claims    # Get user's claims
GET    /insurance/pending # Get pending claims (insurance role)
PATCH  /:id/approve       # Approve claim (insurance role)
PATCH  /:id/reject        # Reject claim (insurance role)
GET    /:claimId/events   # Get claim timeline events
```

## 🔐 Authentication

All protected endpoints require an `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

JWT Token contains:

- `userId`: User's UUID
- `email`: User's email
- `role`: "patient" | "hospital" | "insurance"
- `orgId`: Organization ID (for hospital/insurance)
- `exp`: Expiration time

## 📊 Database Schema

### Key Tables

- **users**: Patient, Hospital Admin, Insurance Admin
- **organizations**: Hospital and Insurance Company details
- **bills**: Medical bills with amounts and categories
- **claims**: Insurance claims with status tracking
- **claim_events**: Timeline of claim status changes
- **insurance_policies**: Coverage information
- **messages**: Communication between entities

## 🧪 Testing

### Test Patient Workflow

1. **Login as Patient**

   ```bash
   POST http://localhost:3001/api/auth/login
   {
     "email": "patient@example.com",
     "password": "patient123"
   }
   ```

2. **Create a Bill**

   ```bash
   POST http://localhost:3001/api/bills
   Headers: Authorization: Bearer <token>
   {
     "title": "CT Scan",
     "category": "diagnostic",
     "amount": 5000,
     "billDate": "2026-03-25",
     "hospitalOrgId": "demo-hospital-001",
     "documentUrls": []
   }
   ```

3. **Login as Hospital Admin**

   ```bash
   POST http://localhost:3001/api/auth/login
   {
     "email": "admin@cityhospital.com",
     "password": "hospital123"
   }
   ```

4. **Create Claim**

   ```bash
   POST http://localhost:3001/api/claims
   Headers: Authorization: Bearer <hospital_token>
   {
     "billId": "<bill_id_from_step_2>",
     "insuranceOrgId": "demo-insurance-001"
   }
   ```

5. **Login as Insurance Admin**

   ```bash
   POST http://localhost:3001/api/auth/login
   {
     "email": "admin@healthcareplus.com",
     "password": "insurance123"
   }
   ```

6. **Approve Claim**
   ```bash
   PATCH http://localhost:3001/api/claims/<claim_id>/approve
   Headers: Authorization: Bearer <insurance_token>
   ```

## 🛠️ Development Tools

### VSCode Extensions Recommended

- REST Client - Test API endpoints
- Thunder Client - Alternative to Postman
- PostgreSQL - Database management
- Tailwind CSS IntelliSense

### Useful Commands

**Backend**

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript
npm run migrate   # Run database migrations
npm run lint      # Check TypeScript errors
```

**Frontend (Hospital/Insurance)**

```bash
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check TypeScript errors
```

## 📝 Creating New Features

### Adding a New API Endpoint

1. **Create Controller** (`src/controllers/feature.controller.ts`)
2. **Create Route** (`src/routes/feature.ts`)
3. **Update Server** (import route in `server.ts`)
4. **Test with cURL/REST Client**

### Example:

Controller:

```typescript
export async function getFeature(req: Request, res: Response): Promise<void> {
  // Implementation
  res.json({
    /* response */
  });
}
```

Route:

```typescript
import { Router } from "express";
import * as controller from "../controllers/feature.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.get("/:id", authenticate, controller.getFeature);
export default router;
```

Server:

```typescript
import featureRoutes from "./routes/feature.js";
app.use("/api/feature", featureRoutes);
```

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure Docker container is running: `docker-compose up -d`

### Port Already in Use

```
Error: listen EADDRINUSE :::3001
```

**Solution**: Kill process on port or change PORT in .env

### Token Invalid

Ensure token is passed correctly:

```
Authorization: Bearer <token_without_quotes>
```

## 📚 Next Steps

1. ✅ Setup complete
2. ⏭️ Implement authentication UI in all three frontends
3. ⏭️ Create data fetching hooks (React Query/SWR)
4. ⏭️ Build dashboard UIs for Hospital and Insurance
5. ⏭️ Implement real-time notifications (WebSocket)
6. ⏭️ Add file upload functionality
7. ⏭️ Create comprehensive testing suite
8. ⏭️ Deploy to production (Docker/Azure/AWS)

## 🤝 Contributing

When adding features:

1. Follow the MVC pattern
2. Add proper error handling
3. Use TypeScript strictly
4. Test all endpoints
5. Document API changes
6. Keep commits atomic

## 📞 Support

For issues or questions:

1. Check this guide first
2. Review error messages carefully
3. Check database schema matches code
4. Verify environment variables are set

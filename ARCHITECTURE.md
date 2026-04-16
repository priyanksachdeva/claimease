# ClaimEase Full-Stack Architecture

## 🏗️ System Overview

ClaimEase is evolving into a three-tier healthcare ecosystem:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLAIMEASE FULL STACK                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PATIENT PWA    │  │  HOSPITAL ADMIN  │  │  INSURANCE ADMIN │
│   (Mobile-First) │  │   (Web Portal)   │  │   (Web Portal)   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                    │
         └─────────────────────┼────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   UNIFIED API       │
                    │   (Express.js)      │
                    │                     │
                    │  - Auth & JWT       │
                    │  - User Management  │
                    │  - Claims Workflow  │
                    │  - Bill Management  │
                    │  - Notifications    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   DATABASE          │
                    │   (PostgreSQL)      │
                    │                     │
                    │  - Users            │
                    │  - Claims           │
                    │  - Bills            │
                    │  - Hospitals        │
                    │  - Insurance Cos.   │
                    │  - Communications   │
                    └─────────────────────┘
```

## 📂 New Project Structure

```
claimease/
├── backend/                    # Unified Express API
│   ├── src/
│   │   ├── middleware/        # Auth, logging, error handling
│   │   ├── routes/
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── claims.ts      # Claims management
│   │   │   ├── bills.ts       # Bill management
│   │   │   ├── users.ts       # User management
│   │   │   ├── hospitals.ts   # Hospital-specific endpoints
│   │   │   └── insurance.ts   # Insurance-specific endpoints
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database schemas
│   │   ├── services/          # Reusable services
│   │   ├── utils/             # Helper functions
│   │   ├── types/             # TypeScript interfaces
│   │   └── server.ts          # Entry point
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── patient/               # Patient PWA (enhanced)
│   │   ├── src/              # Existing code structure
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── hospital/              # Hospital admin portal
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ClaimsManagement.tsx
│   │   │   │   ├── BillsManagement.tsx
│   │   │   │   ├── PatientDirectory.tsx
│   │   │   │   └── Messages.tsx
│   │   │   ├── components/
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── insurance/             # Insurance admin portal
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── ClaimsApproval.tsx
│       │   │   ├── CustomerManagement.tsx
│       │   │   ├── Messages.tsx
│       │   │   └── Reports.tsx
│       │   ├── components/
│       │   └── main.tsx
│       ├── vite.config.ts
│       └── package.json
│
├── docker-compose.yml        # Local development with PostgreSQL
├── ARCHITECTURE.md           # This file
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles

- **Patient**: Uploads bills, tracks claims, views insurance policies
- **Hospital Admin**: Manages bills, generates claims, communicates with patients
- **Insurance Admin**: Reviews and approves/rejects claims, manages policies

### JWT Token Strategy

```
{
  "userId": "uuid",
  "role": "patient" | "hospital" | "insurance",
  "orgId": "uuid",        // Hospital ID or Insurance Company ID
  "permissions": [...]
}
```

## 📊 Database Schema (PostgreSQL)

### Core Tables

- `users`: Patient, Hospital Admin, Insurance Admin users
- `organizations`: Hospital and Insurance Company details
- `insurance_policies`: Coverage info and limits
- `bills`: Medical bills with amounts and categories
- `claims`: Insurance claims with status tracking
- `claim_events`: Timeline of claim status changes
- `messages`: Communication between entities
- `documents`: Uploaded files (bills, receipts, documents)

## 🔄 Workflow

### Claim Creation Flow

1. **Patient** uploads medical bill
2. **Hospital Admin** validates bill → creates insurance claim
3. **Insurance Admin** reviews claim details
4. Insurance Admin **approves/rejects** claim
5. **Patient** receives notification of claim status
6. **Hospital** receives payment status from insurance

### Communication Flow

- Hospital → Patient: Bill updates, claim status
- Hospital → Insurance: Claims with supporting docs
- Insurance → Patient: Claim decision
- Insurance → Hospital: Payment confirmation

## 🛠️ Tech Stack Expansion

### Backend

- **Express.js**: REST API framework
- **PostgreSQL**: Primary database
- **TypeScript**: Type safety
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **pg**: PostgreSQL driver
- **cors**: Cross-origin requests

### Frontend (All Three)

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Routing
- **Axios/Fetch**: API calls
- **Zustand/Context API**: State management

## 📱 Key Enhancements for Patient PWA

1. **Real-time notifications** - WebSocket support
2. **Offline support** - Service worker improvements
3. **Document viewer** - PDF and image renderer
4. **Chat interface** - Direct messaging with hospital
5. **Better UX** - Loading states, error boundaries
6. **Data sync** - Automatic sync when online

## 🚀 Implementation Phases

### Phase 1: Backend Foundation

- Set up PostgreSQL database
- Create user management & authentication
- Build core API endpoints
- Implement claim workflow logic

### Phase 2: Hospital Portal

- Create hospital admin interface
- Bill management and claim creation
- Patient communication dashboard

### Phase 3: Insurance Portal

- Insurance admin interface
- Claims approval workflow
- Communication with hospitals

### Phase 4: Patient PWA Enhancement

- Integrate with new backend
- Real-time notifications
- Enhanced UI/UX

### Phase 5: Inter-system Communication

- WebSocket for real-time updates
- Email notifications
- System-wide notifications

## 📝 Next Steps

1. Review this architecture
2. Set up PostgreSQL database
3. Initialize backend structure
4. Create database models and migrations
5. Build authentication system
6. Implement core APIs
7. Create hospital and insurance portals
8. Integrate with patient PWA

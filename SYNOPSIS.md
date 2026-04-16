# 🏥 ClaimEase - Full-Stack Healthcare Platform

## 📋 What is ClaimEase?

ClaimEase is a comprehensive healthcare claims management system with three integrated applications:

1. **Patients** 📱 - Upload medical bills and track insurance claims in real-time via a mobile-first PWA
2. **Hospitals** 🏥 - Manage patient bills, generate insurance claims, and communicate with insurance companies
3. **Insurance Companies** 💼 - Review and approve/reject claims with detailed documentation and timelines

---

## ✨ Key Features

### 👥 Patient PWA (Mobile-First)

- 📱 Mobile-optimized progressive web app
- 📊 Dashboard with bills and claims overview
- 🧾 Bill wallet organized by category
- 📸 Smart bill upload with camera integration
- 🛡️ Real-time claims tracker with timeline
- 👤 Profile with insurance policies
- 🔔 Push notifications for claim updates

### 🏥 Hospital Admin Portal

- 📋 Bill management (create, view, manage)
- 📤 Claims generation from bills
- 👥 Patient directory
- 💬 Messaging system with insurance companies
- 📊 Dashboard with pending items
- 🔍 Real-time claim tracking

### 💼 Insurance Admin Portal

- ⏳ Claims processing queue
- ✅ Approval workflow
- 📊 Dashboard with analytics
- 🏥 Hospital management
- 💬 Direct messaging
- 📈 Claims reports and trends

---

## 🛠️ Tech Stack

### Frontend (All Three)

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build
- **Tailwind CSS v4** - Styling
- **Zustand** - State management
- **Axios** - HTTP client

### Backend

- **Express.js** - REST API
- **TypeScript** - Type safety
- **Node.js 18+** - Runtime
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Database & Infrastructure

- **PostgreSQL 16** - Relational database
- **Redis 7** - Caching (optional)
- **Docker** - Containerization
- **Docker Compose** - Orchestration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone repository**

```bash
git clone <repo-url>
cd claimease
```

2. **Start Database**

```bash
docker-compose up -d
```

3. **Setup Backend**

```bash
cd backend
npm install
npm run dev
```

Backend: **http://localhost:3001**

4. **Setup Hospital Portal**

```bash
cd frontend/hospital
npm install
npm run dev
```

Hospital Portal: **http://localhost:3002**

5. **Setup Insurance Portal**

```bash
cd frontend/insurance
npm install
npm run dev
```

Insurance Portal: **http://localhost:3003**

6. **Setup Patient PWA** (Optional)

```bash
cd frontend/patient
npm install
npm run dev
```

Patient PWA: **http://localhost:5173**

### Demo Credentials

| Role            | Email                      | Password       |
| --------------- | -------------------------- | -------------- |
| Patient         | `patient@example.com`      | `patient123`   |
| Hospital Admin  | `admin@cityhospital.com`   | `hospital123`  |
| Insurance Admin | `admin@healthcareplus.com` | `insurance123` |

---

## 📊 Database Tables

| Table                  | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| **users**              | System users (patient, hospital, insurance) |
| **organizations**      | Hospitals and insurance companies           |
| **bills**              | Medical bills with categories and amounts   |
| **claims**             | Insurance claims linked to bills            |
| **claim_events**       | Audit trail of claim status changes         |
| **insurance_policies** | Patient insurance coverage                  |
| **messages**           | Inter-organizational communication          |

---

## 🔐 Security Features

- ✅ JWT Authentication - Token-based secure endpoints
- ✅ Password Hashing - bcryptjs for password security
- ✅ Role-Based Access Control - Different permissions per role
- ✅ CORS Protection - Cross-origin request validation
- ✅ Input Validation - Schema validation ready
- ✅ HTTPS Ready - Production-ready setup

---

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login user
GET    /api/auth/me           # Get current user
```

### Bills

```
POST   /api/bills             # Create bill
GET    /api/bills/:id         # Get bill details
GET    /api/bills/user/my-bills      # User's bills
GET    /api/bills/hospital/bills     # Hospital's bills
PATCH  /api/bills/:id/status  # Update bill status
```

### Claims

```
POST   /api/claims            # Create claim
GET    /api/claims/:id        # Get claim
GET    /api/claims/user/my-claims   # User's claims
GET    /api/claims/insurance/pending # Pending claims
PATCH  /api/claims/:id/approve      # Approve claim
PATCH  /api/claims/:id/reject       # Reject claim
GET    /api/claims/:claimId/events  # Claim timeline
```

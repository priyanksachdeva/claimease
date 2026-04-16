# 🏥 ClaimEase - Full-Stack Healthcare Platform

ClaimEase is a comprehensive healthcare claims management system built as a **full-stack application** with three integrated components:

## 🎯 What is ClaimEase?

ClaimEase streamlines the entire insurance claim lifecycle by connecting three key stakeholders:

1. **Patients** 📱 - Upload medical bills and track insurance claims in real-time via a mobile-first PWA
2. **Hospitals** 🏥 - Manage patient bills, generate insurance claims, and communicate with insurance companies
3. **Insurance Companies** 💼 - Review and approve/reject claims with detailed documentation and timelines

## ✨ Key Features

### 👥 Patient PWA (Mobile-First)

- 📱 **Mobile-Optimized**: Touch-friendly interface with bottom navigation
- 📥 **Progressive Web App**: Install directly on Android/iOS browsers
- 📊 **Dashboard**: Quick overview of bills, claims, and policies
- 🧾 **Bill Wallet**: Organize medical expenses by category
- 📸 **Smart Upload**: Camera integration for bill scanning
- 🛡️ **Claims Tracker**: Real-time status tracking with timeline events
- 👤 **Profile**: View insurance policies and account settings
- 🔔 **Notifications**: Real-time updates on claim status changes

### 🏥 Hospital Admin Portal (Web)

- 📋 **Bill Management**: Create and manage patient bills
- 📤 **Claims Generation**: Submit bills as insurance claims
- 👥 **Patient Directory**: View and manage patient information
- 💬 **Messaging**: Direct communication with insurance companies
- 📊 **Dashboard**: Overview of pending bills and claims
- 🔍 **Claim Tracking**: Monitor claim status with insurance companies

### 💼 Insurance Admin Portal (Web)

- ⏳ **Claims Queue**: Review pending claims for approval
- ✅ **Approval Workflow**: Approve/reject claims with detailed reasons
- 📊 **Dashboard**: Analytics on processing times and approval rates
- 🏥 **Hospital Management**: View and manage connected hospitals
- 💬 **Communication**: Direct messaging with hospitals
- 📈 **Reports**: Generate claims analytics and trends

## 🛠️ Tech Stack

### Backend

- **Express.js** - REST API framework
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe backend
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing

### Frontend (All Three)

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client

### Infrastructure

- **Docker** - Containerization
- **PostgreSQL 16** - Database
- **Redis** - Caching (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone repository** (if using git)

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

Backend runs at: **http://localhost:3001**

4. **Setup Hospital Portal**

```bash
cd frontend/hospital
npm install
npm run dev
```

Hospital Portal at: **http://localhost:3002**

5. **Setup Insurance Portal**

```bash
cd frontend/insurance
npm install
npm run dev
```

Insurance Portal at: **http://localhost:3003**

6. **Setup Patient PWA** (Optional - for existing frontend)

```bash
cd frontend/patient
npm install
npm run dev
```

Patient PWA at: **http://localhost:5173**

### Demo Credentials (Auto-Created)

| Role            | Email                      | Password       |
| --------------- | -------------------------- | -------------- |
| Patient         | `patient@example.com`      | `patient123`   |
| Hospital Admin  | `admin@cityhospital.com`   | `hospital123`  |
| Insurance Admin | `admin@healthcareplus.com` | `insurance123` |

## 📁 Project Structure

```
claimease/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, logging
│   │   ├── db/                # Database & migrations
│   │   ├── utils/             # Helpers
│   │   └── server.ts          # Entry point
│   └── package.json
│
├── frontend/
│   ├── patient/               # Patient PWA (Mobile-First)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── vite.config.ts
│   │
│   ├── hospital/              # Hospital Admin Portal
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── vite.config.ts
│   │
│   └── insurance/             # Insurance Admin Portal
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── lib/
│       └── vite.config.ts
│
├── docker-compose.yml         # Local development setup
├── ARCHITECTURE.md            # System design
├── DEVELOPMENT.md             # Development guide
└── README.md                  # This file
```

## 🔄 Claim Workflow

```
Patient                Hospital               Insurance
  |                      |                        |
  ├─→ Upload Bill ────→  |                        |
  |                      ├─→ Create Claim ─────→  |
  |                      |                        ├─→ Review
  |                      |                        ├─→ Verify
  |                      |                        ├─→ Approve/Reject
  |                      |  ←─ Update Status ─────┤
  |  ←─ Notification ────|                        |
  |                      |                        |
```

## 📊 Database Schema Highlights

### Core Entities

- **users** - All system users (patient, hospital, insurance)
- **organizations** - Hospital and Insurance company details
- **bills** - Medical bills from hospitals
- **claims** - Insurance claims with status tracking
- **claim_events** - Timeline/audit trail of claim status changes
- **insurance_policies** - Patient insurance coverage
- **messages** - Inter-organizational communication

## 🔐 Security Features

- ✅ **JWT Authentication** - Token-based secure endpoints
- ✅ **Password Hashing** - bcryptjs for password security
- ✅ **Role-Based Access Control** - Different permissions per role
- ✅ **CORS Protection** - Cross-origin request validation
- ✅ **Input Validation** - Schema validation with Zod
- ✅ **HTTPS Ready** - Production-ready setup

## 📖 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and data flow
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Complete development guide and API reference

## 🚀 Deployment

### Building for Production

Backend:

```bash
cd backend
npm run build
npm run start
```

Frontend (Hospital):

```bash
cd frontend/hospital
npm run build
# Static files in dist/
```

Frontend (Insurance):

```bash
cd frontend/insurance
npm run build
# Static files in dist/
```

### Deployment Platforms

- **Azure App Service** - Host backend and frontends
- **Azure Database for PostgreSQL** - Managed database
- **Docker Hub** - Container registry
- **Vercel/Netlify** - Static frontend hosting

## 🧪 Testing Workflow

1. **Create Patient Account** - Register or use demo credentials
2. **Login as Patient** - Upload a medical bill
3. **Login as Hospital Admin** - Create insurance claim for bill
4. **Login as Insurance Admin** - Review and approve/reject claim
5. **Check Patient Dashboard** - View claim status in real-time

## 🎨 UI/UX Highlights

- **Mobile-First Design** - Optimized for all screen sizes
- **Smooth Animations** - Framer Motion for delightful interactions
- **Tailwind CSS v4** - Modern, responsive styling
- **Accessible Components** - WCAG 2.1 compliant
- **Dark Mode Ready** - Easy to implement theme switching

## 🔗 API Documentation

All API endpoints are RESTful and require JWT authentication (except login/register).

**Base URL**: `http://localhost:3001/api`

### Authentication Endpoints

```
POST   /auth/register     # Register new user
POST   /auth/login        # Login user
GET    /auth/me           # Get current user profile
```

### Bills Endpoints

```
POST   /bills             # Create new bill
GET    /bills/:id         # Get bill details
GET    /bills/user/my-bills     # Get user's bills
GET    /bills/hospital/bills    # Get hospital's bills
PATCH  /bills/:id/status  # Update bill status
```

### Claims Endpoints

```
POST   /claims            # Create new claim
GET    /claims/:id        # Get claim details
GET    /claims/user/my-claims   # Get user's claims
GET    /claims/insurance/pending # Get pending claims (insurance only)
PATCH  /claims/:id/approve      # Approve claim (insurance only)
PATCH  /claims/:id/reject       # Reject claim (insurance only)
GET    /claims/:claimId/events  # Get claim timeline
```

## 📱 PWA Features

The Patient PWA includes:

- ✅ Service Worker for offline support
- ✅ Installable on mobile devices
- ✅ App manifest for native-like experience
- ✅ Push notifications capability
- ✅ Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support & Issues

For bugs, feature requests, or questions:

1. Check existing issues
2. Create a detailed issue with steps to reproduce
3. Provide screenshots/logs if applicable

## 📄 License

This project is licensed under the MIT License.

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## 🙏 Acknowledgments

Built with ❤️ for streamlining healthcare claims management.

---

**Happy coding! �**

For detailed development setup, see [DEVELOPMENT.md](./DEVELOPMENT.md)

- The app is strictly constrained to a mobile viewport using `h-[100dvh]`, `max-w-md`, and `overflow-hidden` in `MobileLayout.tsx` to simulate a native app environment on desktop browsers.

### API Integration

- Currently, the app fetches data from a mock Express endpoint (`/api/dashboard`) defined in `server.ts`.
- When connecting to a real backend or database (like Firebase or Supabase), replace the `fetch` calls in the `useEffect` hooks within the page components.

### PWA Configuration

- The PWA settings (Manifest, Theme Colors, Icons) are configured inside `vite.config.ts` using `vite-plugin-pwa`.
- Meta tags for mobile optimization (disabling zoom, setting theme colors) are located in `index.html`.

## 📝 Next Steps for Development

1. **Database Integration**: Replace the mock `/api/dashboard` in `server.ts` with a real database connection (e.g., PostgreSQL, MongoDB, or Firebase).
2. **Authentication**: Replace the `localStorage` auth guard with a robust authentication provider (e.g., Firebase Auth, Auth0, or NextAuth).
3. **OCR Integration**: Connect the `/upload` page to an OCR API (like Google Cloud Vision or AWS Textract) to automatically extract data from uploaded bill images.

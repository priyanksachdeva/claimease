# 🏥 ClaimEase - Full-Stack Healthcare Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)

ClaimEase is a modern, full-stack healthcare claims management ecosystem designed to streamline the interaction between patients, hospitals, and insurance providers.

## 🌟 Overview

ClaimEase simplifies the complex insurance claim lifecycle by providing dedicated portals for three key stakeholders:

- **📱 Patient PWA**: A mobile-first experience for patients to upload bills and track claims.
- **🏥 Hospital Portal**: An administrative dashboard for healthcare providers to manage billing and submit claims.
- **💼 Insurance Portal**: A robust interface for insurance adjusters to review, approve, or reject claims.

---

## ✨ Key Features

### 👤 Patient Experience (Mobile-First PWA)
- **Smart Bill Wallet**: Categorize and organize medical expenses digitally.
- **Real-Time Tracking**: Interactive timeline for every claim status update.
- **Instant Messaging**: Direct communication with healthcare providers.
- **Progressive Web App**: Installable on iOS and Android for a native-like experience.

### 🏥 Hospital Management
- **Efficient Billing**: Create and manage patient bills with ease.
- **Automated Claims**: One-click submission of bills to insurance companies.
- **Status Monitoring**: Track the progress of all submitted claims in real-time.

### 💼 Insurance Operations
- **Decision Engine**: Streamlined workflow for approving or rejecting claims.
- **Audit Trails**: Detailed event history for every claim action.
- **Analytics Dashboard**: Insights into claim volumes and processing times.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT + bcryptjs
- **File Handling**: Multer

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd claimease
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend/` directory using `.env.example` as a template:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3001
```

### 3. Run the Ecosystem
Open four terminal windows or use a process manager:

| Service | Command | URL |
| :--- | :--- | :--- |
| **Backend API** | `cd backend && npm run dev` | `http://localhost:3001` |
| **Patient PWA** | `npm run dev` | `http://localhost:3000` |
| **Hospital Portal** | `cd frontend/hospital && npm run dev` | `http://localhost:3002` |
| **Insurance Portal** | `cd frontend/insurance && npm run dev` | `http://localhost:3003` |

---

## 📂 Project Structure

```text
claimease/
├── backend/            # Express API & MongoDB Logic
├── frontend/
│   ├── hospital/      # Hospital Admin Portal
│   └── insurance/     # Insurance Admin Portal
├── src/                # Patient PWA Source
└── README.md           # Main Documentation
```

---

## 🔐 Security

- **JWT Auth**: Secure, stateless authentication for all API endpoints.
- **RBAC**: Role-Based Access Control ensuring users only see what they should.
- **Data Integrity**: Input validation and sanitized database queries.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by the ClaimEase Team.

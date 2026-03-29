# 🏥 ClaimEase

ClaimEase is a mobile-first Progressive Web Application (PWA) designed to be your stress-free companion for managing hospital bills and tracking insurance claims. It features a modern, touch-friendly UI, seamless animations, and native-like interactions.

## ✨ Features

- **📱 Mobile-First Design**: Optimized for mobile screens with a persistent bottom navigation bar and touch-friendly targets.
- **📥 Progressive Web App (PWA)**: Installable on Android and iOS devices directly from the browser.
- **📊 Dashboard**: Quick overview of recent bills, claim statuses, and quick actions.
- **🧾 Bill Wallet**: Manage medical expenses, filter by category (Lab, Medicine, Consultation), and view receipts (supports both Images and PDFs in a full-screen viewer).
- **📸 Smart Upload**: Camera integration for scanning and uploading new bills.
- **🛡️ Claims Tracker**: Real-time vertical timeline tracking for insurance claims (Submitted -> Verification -> Processing -> Approval).
- **👤 User Profile**: Beautifully designed profile section displaying active insurance policies and account settings.

## 🛠️ Tech Stack

**Frontend:**
- **React 18**: UI Library
- **TypeScript**: Static typing
- **Vite**: Extremely fast frontend tooling and bundler
- **Tailwind CSS (v4)**: Utility-first styling
- **Framer Motion**: Fluid, physics-based animations and page transitions
- **React Router DOM**: Client-side routing
- **Lucide React**: Beautiful, consistent iconography
- **Vite PWA Plugin**: Service worker and manifest generation for PWA support

**Backend (Current Mock Setup):**
- **Express.js**: Node.js web framework serving the API and production build
- **tsx**: TypeScript execution environment for the server

## 📁 Project Structure

```text
.
├── public/                 # Static assets (PWA icons, manifest assets)
│   └── icon.svg            # Scalable PWA app icon
├── src/
│   ├── components/         # Reusable UI components
│   │   └── MobileLayout.tsx# Main app shell with bottom navigation
│   ├── pages/              # Route-level components
│   │   ├── Dashboard.tsx   # Home screen
│   │   ├── Bills.tsx       # Bill wallet and receipt viewer
│   │   ├── Claims.tsx      # Claim status tracker
│   │   ├── Upload.tsx      # Camera/File upload interface
│   │   ├── Profile.tsx     # User settings and policy details
│   │   └── Onboarding.tsx  # Welcome screens
│   ├── App.tsx             # Main React Router configuration
│   ├── main.tsx            # React DOM entry point
│   └── index.css           # Global CSS and Tailwind imports
├── server.ts               # Express server (Mock APIs & static serving)
├── vite.config.ts          # Vite configuration (Plugins, PWA setup)
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project folder.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally (Development)

To start the development server (which runs both the Express backend and the Vite frontend):

```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```
This will compile the TypeScript, build the Vite frontend into the `dist/` directory, and prepare the assets.

To run the production build:
```bash
npm run start
```

## 💻 Development Guidelines

### Routing & Authentication
- The app uses `react-router-dom`.
- A simple `localStorage` check (`claimEase_onboarded`) is used in `App.tsx` to guard the main application routes and redirect new users to the `/onboarding` screen.

### Styling
- All styling is done via **Tailwind CSS**.
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

# Getting Started with ClaimEase

Welcome to ClaimEase! Follow these steps to get the full-stack application running on your local machine.

## 🎯 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** (optional, for cloning)
- **A REST Client** (for testing APIs):
  - VS Code: REST Client extension
  - Postman or Thunder Client
  - Or use curl

## 🚀 Step-by-Step Setup

### Step 1️⃣: Start the Database

Open a terminal and run:

```bash
docker-compose up -d
```

This starts:

- PostgreSQL database (localhost:5432)
- Redis cache (localhost:6379)

**Verify connection** (optional):

```bash
docker ps
```

You should see two running containers: `claimease-db` and `claimease-cache`

### Step 2️⃣: Setup & Run Backend (API Server)

Open a new terminal:

```bash
cd backend
npm install
```

Create `.env` file from example:

```bash
cp .env.example .env
```

Start the backend server:

```bash
npm run dev
```

You should see:

```
✅ Database connected
✅ All migrations completed
🌱 Seeding demo data...
✅ Demo data seeded successfully
✅ Server running on http://localhost:3001

Demo Credentials:
Patient: patient@example.com / patient123
Hospital Admin: admin@cityhospital.com / hospital123
Insurance Admin: admin@healthcareplus.com / insurance123
```

**Backend is ready!** Keep this terminal open.

### Step 3️⃣: Setup & Run Hospital Portal

Open a new terminal:

```bash
cd frontend/hospital
npm install
npm run dev
```

Hospital Portal will open at **http://localhost:3002** ✨

### Step 4️⃣: Setup & Run Insurance Portal

Open another new terminal:

```bash
cd frontend/insurance
npm install
npm run dev
```

Insurance Portal will open at **http://localhost:3003** ✨

### Step 5️⃣ (Optional): Setup & Run Patient PWA

Open another terminal:

```bash
cd frontend/patient
npm install
npm run dev
```

Patient PWA will open at **http://localhost:5173** ✨

## 📋 Access Points

| Application          | URL                   | Demo Credentials                        |
| -------------------- | --------------------- | --------------------------------------- |
| **Backend API**      | http://localhost:3001 | N/A                                     |
| **Hospital Portal**  | http://localhost:3002 | admin@cityhospital.com / hospital123    |
| **Insurance Portal** | http://localhost:3003 | admin@healthcareplus.com / insurance123 |
| **Patient PWA**      | http://localhost:5173 | patient@example.com / patient123        |

## 🧪 Test the Full Workflow

Follow these steps to test the entire claim approval process:

### 1. Login as Patient

```
URL: http://localhost:5173
Email: patient@example.com
Password: patient123
```

### 2. Upload a Bill

- Go to "Upload" section
- Fill in bill details:
  - Title: "CT Scan"
  - Amount: 5000
  - Category: "Diagnostic"
  - Date: Today's date
- Click Submit

### 3. Get Bill ID (via Backend API)

Use your REST client or curl:

```bash
curl -X GET http://localhost:3001/api/bills/user/my-bills \
  -H "Authorization: Bearer <patient_token>"
```

Copy the bill ID from response.

### 4. Login as Hospital Admin

```
URL: http://localhost:3002
Email: admin@cityhospital.com
Password: hospital123
```

Navigate to "Create Claim" and:

- Select the patient's bill
- Select insurance company
- Submit claim

### 5. Login as Insurance Admin

```
URL: http://localhost:3003
Email: admin@healthcareplus.com
Password: insurance123
```

- View pending claims
- Click "Review" on the claim
- Click "Approve" or "Reject"

### 6. Check Patient Dashboard

Go back to Patient PWA (http://localhost:5173)

- View the claim status update in real-time ✅

## 🔥 Stopping Everything

To stop all services:

```bash
# Stop all running servers (Ctrl+C in each terminal)

# Stop Docker containers
docker-compose down

# Optional: Remove volumes (be careful - deletes data)
docker-compose down -v
```

## 🐛 Troubleshooting

### Port Already in Use

```
Error: listen EADDRINUSE :::3001
```

**Solution**: Change port in `.env` file or kill the process:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3001
kill -9 <PID>
```

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure Docker is running and containers are active:

```bash
docker-compose up -d
docker ps
```

### Cannot Connect to API

```
Error: Cannot POST /api/auth/login
```

**Solution**:

1. Check backend is running: http://localhost:3001/health should return `{"status":"ok"}`
2. Check CORS is enabled
3. Ensure token is in Authorization header: `Authorization: Bearer <token>`

### Module Not Found

```
Error: Cannot find module 'express'
```

**Solution**:

```bash
cd backend  # or frontend/{hospital|insurance|patient}
npm install
```

### TypeScript Errors

```
error TS1005: ',' expected
```

**Solution**: Run type checking:

```bash
npm run lint
```

## 📚 API Examples

### Register New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "secure123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "patient123"
  }'
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "patient@example.com",
    "firstName": "Aarav",
    "lastName": "Sharma",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

### Create a Bill

```bash
curl -X POST http://localhost:3001/api/bills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Blood Test",
    "category": "lab",
    "amount": 1500,
    "billDate": "2026-03-25",
    "hospitalOrgId": "demo-hospital-001"
  }'
```

## 📖 More Information

- **Architecture Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Development Guide**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Full API Docs**: See [DEVELOPMENT.md#api-endpoints](./DEVELOPMENT.md#api-endpoints)

## 🎉 You're All Set!

Now you have the complete ClaimEase platform running locally. Start exploring and testing!

### What to Try Next:

1. ✅ Test the patient workflow (upload bill → create claim → approve claim)
2. ✅ Explore Hospital Portal features
3. ✅ Review Insurance Portal dashboard
4. ✅ Check the API endpoints in DEVELOPMENT.md
5. ✅ Look at the codebase and understand the architecture

## 🤝 Need Help?

- Check the [Troubleshooting](#-troubleshooting) section above
- Review [DEVELOPMENT.md](./DEVELOPMENT.md) for more details
- Check Docker logs: `docker logs claimease-db`
- Check Node terminal output for error messages

---

**Happy coding! 🚀**

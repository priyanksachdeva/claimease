import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db/migrations.js";
import { OrganizationService } from "./services/organization.service.js";
import { AuthService } from "./services/auth.service.js";

// Routes
import authRoutes from "./routes/auth.js";
import billsRoutes from "./routes/bills.js";
import claimsRoutes from "./routes/claims.js";
import organizationsRoutes from "./routes/organizations.js";
import messagesRoutes from "./routes/messages.js";
import notificationsRoutes from "./routes/notifications.js";
import settingsRoutes from "./routes/settings.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Root route
app.get("/", (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;
  
  res.json({
    message: "Welcome to ClaimEase API",
    documentation: `${baseUrl}/api`,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/settings", settingsRoutes);

// Basic API info
app.get("/api", (req, res) => {
  res.json({
    name: "ClaimEase API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      organizations: "/api/organizations",
      bills: "/api/bills",
      claims: "/api/claims",
      messages: "/api/messages",
    },
  });
});

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Seed demo data if needed
    await seedDemoData();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`API documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

async function seedDemoData() {
  try {
    // Demo data seeding is now handled in migrations.ts
    // This function is kept for backward compatibility but does nothing
    return;
  } catch (error) {
    console.error("⚠️ Demo data seeding error:", error);
  }
}

startServer();

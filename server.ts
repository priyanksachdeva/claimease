import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock Database ---
  const db = {
    user: {
      name: "Aarav Sharma",
      policyNumber: "STAR-HLTH-9823",
      totalCoverage: 500000,
      usedCoverage: 124500,
    },
    bills: [
      { id: "b1", title: "Blood Test & CBC", category: "Lab", amount: 1500, date: "2026-03-20", status: "Approved", receiptUrl: "https://picsum.photos/seed/receipt1/400/600?grayscale&blur=1" },
      { id: "b2", title: "Cardiology Consultation", category: "Consultation", amount: 2000, date: "2026-03-22", status: "Pending", receiptUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "b3", title: "Pharmacy - Dolo & Antibiotics", category: "Medicine", amount: 450, date: "2026-03-24", status: "Action Required", receiptUrl: "https://picsum.photos/seed/receipt3/400/600?grayscale&blur=1" },
    ],
    claims: [
      { id: "c1", title: "March Routine Checkup", totalAmount: 4950, status: "Processing", progress: 60 }
    ]
  };

  // --- API Routes ---
  app.get("/api/dashboard", (req, res) => {
    res.json(db);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

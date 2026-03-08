import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("keys.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS license_keys (
    key TEXT PRIMARY KEY,
    expires TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/keys", (req, res) => {
    const keys = db.prepare("SELECT * FROM license_keys").all();
    res.json(keys);
  });

  app.post("/api/keys", (req, res) => {
    const { key, expires } = req.body;
    try {
      db.prepare("INSERT INTO license_keys (key, expires) VALUES (?, ?)").run(key, expires);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(400).json({ error: "Key already exists or invalid data" });
    }
  });

  app.delete("/api/keys/:key", (req, res) => {
    const { key } = req.params;
    db.prepare("DELETE FROM license_keys WHERE key = ?").run(key);
    res.json({ success: true });
  });

  app.post("/api/login", (req, res) => {
    const { key } = req.body;
    const upperKey = key.toUpperCase();
    
    // Hardcoded keys for backup (optional, but good for admin)
    const MASTER_KEY = "ADMIN-HYPER-2026";
    const HARDCODED_KEYS = ["ADMIN-ACCESS", "HYPER-PRO-2026"];

    if (upperKey === MASTER_KEY) {
      return res.json({ type: "ADMIN" });
    }

    if (HARDCODED_KEYS.includes(upperKey)) {
      // Hardcoded keys expire in 1 year
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      return res.json({ type: "USER", key: upperKey, expires: expiry.toISOString() });
    }

    const foundKey = db.prepare("SELECT * FROM license_keys WHERE key = ?").get(upperKey) as { key: string, expires: string } | undefined;

    if (foundKey) {
      const expiryDate = new Date(foundKey.expires);
      if (expiryDate > new Date()) {
        res.json({ type: "USER", key: foundKey.key, expires: foundKey.expires });
      } else {
        res.status(401).json({ error: "This key has expired." });
      }
    } else {
      res.status(401).json({ error: "Invalid license key." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cron = require("node-cron");
const db = require("./config/db");
const upload = require("./middleware/multer");
const app = express();
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const allowedOrigins = ["https://calidro.vercel.app"];
// Place this ABOVE your route definitions
app.all("/api/bookings/webhook/paymongo", (req, res, next) => {
  console.log(`🔍 DEBUG: Webhook hit with method: ${req.method}`);
  next();
});
// --- 1. CORS CONFIG (MUST BE AT THE TOP) ---
app.use(
  cors({
    origin: "https://calidro.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  }),
);
// In server.js, add this middleware near your CORS settings
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  //res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
// --- 2. BODY PARSERS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Calidro Backend is running!");
});

// --- 3. ROUTES REGISTRATION ---
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// --- 4. GLOBAL DEBUGGER ---
app.use((req, res, next) => {
  console.log(
    `[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`,
  );
  next();
});
// --- DATABASE PERSISTENCE ROUTES ---

// GET: Fetch the current image
app.get("/api/settings/virtual-tour", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT image_url FROM site_assets WHERE asset_name = 'virtual_tour_image' LIMIT 1",
    );
    // If no row exists, return null instead of crashing
    res.status(200).json({ imageUrl: rows[0]?.image_url || null });
  } catch (error) {
    console.error("DB Fetch Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST: Update the image record after Cloudinary upload
app.post("/api/settings/virtual-tour", async (req, res) => {
  const { imageUrl, adminId } = req.body;
  try {
    const sql = `
      UPDATE site_assets 
      SET image_url = ?, updated_by = ? 
      WHERE asset_name = 'virtual_tour_image'
    `;
    const [result] = await db.query(sql, [imageUrl, adminId || null]);

    if (result.affectedRows === 0) {
      // If the row doesn't exist, create it
      await db.query(
        "INSERT INTO site_assets (asset_name, image_url, updated_by) VALUES (?, ?, ?)",
        ["virtual_tour_image", imageUrl, adminId || null],
      );
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("DB Update Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// --- BOOK ASSET ROUTES ---

// GET: Fetch Book Image
app.get("/api/settings/book-asset", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT image_url FROM site_assets WHERE asset_name = 'book_image' LIMIT 1",
    );
    res.status(200).json({ imageUrl: rows[0]?.image_url || null });
  } catch (error) {
    console.error("Fetch Book Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST: Update Book Image
app.post("/api/settings/book-asset", async (req, res) => {
  const { imageUrl, adminId } = req.body;
  try {
    const sql = `
      INSERT INTO site_assets (asset_name, image_url, updated_by)
      VALUES ('book_image', ?, ?)
      ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), updated_by = VALUES(updated_by)
    `;
    await db.query(sql, [imageUrl, adminId || null]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update Book Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/api/images/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("[UPLOAD ERROR] No file received in req.file");
      return res.status(400).json({ message: "No file uploaded" });
    }

    // req.file.path is the URL returned by Cloudinary (via multer-storage-cloudinary)
    console.log("✅ Uploaded to Cloudinary:", req.file.path);

    res.status(200).json({
      message: "Upload successful",
      imageUrl: req.file.path,
    });
  } catch (error) {
    // This stops the 500 [object Object] and gives you a real error in the terminal
    console.error("❌ CLOUDINARY/UPLOAD CRASH:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Check if this file exists in /routes/
// --- 5. TEST ENDPOINTS ---
app.get("/api/test-direct", (req, res) => {
  res.status(200).json({ message: "Backend is alive and reaching server.js" });
});

// --- 6. SERVER SETUP ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Database Connection
db.getConnection()
  .then((connection) => {
    console.log("✅ Successfully connected to MySQL database!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MySQL database:", err);
  });

// Socket Logic
let activeUserRooms = new Set();
let messageHistory = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_chat", (room) => {
    socket.join(room);
    if (messageHistory[room]) {
      socket.emit("load_history", { room, history: messageHistory[room] });
    }
  });

  socket.on("send_message", (data) => {
    const { room, sender } = data;
    if (!room) return;

    if (sender === "user") {
      activeUserRooms.add(room);
      io.emit("update_user_list", Array.from(activeUserRooms));
    }

    if (!messageHistory[room]) messageHistory[room] = [];
    if (!messageHistory[room].find((m) => m.id === data.id)) {
      messageHistory[room].push(data);
    }

    io.to(room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

cron.schedule("0 0 * * *", async () => {
  console.log("🕒 Running daily booking cleanup task...");

  try {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Update status to 'completed' if the event date has passed
    const sql = `
      UPDATE booking 
      SET status = 'completed' 
      WHERE event_date < ? 
      AND status IN ('pending', 'confirmed')
    `;

    const [result] = await db.query(sql, [today]);

    console.log(
      `✅ Automated cleanup: ${result.affectedRows} bookings marked as completed.`,
    );
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
});

app.post("/api/bookings/checkout-balance", async (req, res) => {
  console.log("🔥 HIT HARDCODED ROUTE");
  res.json({ message: "Hardcoded route is working!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.use((req, res) => {
  console.log(`[404 ERROR] Path not found: ${req.method} ${req.originalUrl}`);
  res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

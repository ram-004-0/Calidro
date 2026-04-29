require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cron = require("node-cron");
const db = require("./config/db");
const app = express();
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const allowedOrigins = ["https://calidro.vercel.app"];

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const bookingRoutes = require("./routes/bookingRoutes"); // Load the file
app.use("/api/bookings", bookingRoutes); // Use it with the prefix

app.use((req, res) => {
  console.log(`[404 ERROR] Path not found: ${req.method} ${req.originalUrl}`);
  res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

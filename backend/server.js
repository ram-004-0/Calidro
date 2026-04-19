require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();

// 1. CLEAN MIDDLEWARE
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// 3. SERVER SETUP
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Socket Logic
let activeUserRooms = new Set();
let messageHistory = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("join_chat", (room) => {
    socket.join(room);
    if (messageHistory[room])
      socket.emit("load_history", { room, history: messageHistory[room] });
  });
  socket.on("send_message", (data) => {
    const { room, sender } = data;
    if (!room) return;
    if (sender === "user") {
      activeUserRooms.add(room);
      io.emit("update_user_list", Array.from(activeUserRooms));
    }
    if (!messageHistory[room]) messageHistory[room] = [];
    if (!messageHistory[room].find((m) => m.id === data.id))
      messageHistory[room].push(data);
    io.to(room).emit("receive_message", data);
  });
  socket.on("disconnect", () => console.log("User disconnected"));
});

// 5. START SERVER
const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

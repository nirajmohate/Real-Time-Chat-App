const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.js");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
const User = require("./models/userModel");
const { verifySocketToken } = require("./middleware/auth");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://real-time-chat-app-6y6v.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ FIX: Provide a default port in case process.env.PORT is undefined
const PORT = process.env.PORT || 5000;

// ✅ FIX: Ensure MongoDB URL is correctly loaded from .env
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => console.log("DB Connection Error:", err.message));

app.get("/ping", (_req, res) => res.json({ msg: "Ping Successful" }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

const io = socket(server, {
  cors: {
    origin: ["http://localhost:5173", "https://your-frontend.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ FIX: Ensure global variable is properly initialized
global.onlineUsers = new Map();

// 🔒 Every socket connection must present the same login token used for
// the REST API. This is what the userId comes from — a client can no
// longer just claim to be any user by passing an id in "add-user".
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const payload = verifySocketToken(token);
    socket.userId = payload.id;
    next();
  } catch (err) {
    next(new Error("Not authenticated"));
  }
});

io.on("connection", (socket) => {
  global.chatSocket = socket;
  onlineUsers.set(socket.userId, socket.id);

  socket.on("send-msg", async (data) => {
    try {
      // 🔒 Only relay the message if sender and recipient are actually
      // connected contacts — mirrors the same check used by the REST
      // /api/messages/addmsg route, so the socket layer can't be used
      // to bypass it.
      const me = await User.findById(socket.userId).select("friends");
      const isFriend = me?.friends?.some((f) => f.toString() === data.to);
      if (!isFriend) return;

      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-receive", data.msg);
      }
    } catch (err) {
      // silently drop malformed events
    }
  });

  // ✅ Handle user disconnection
  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
  });
});

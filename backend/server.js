const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const uploadRoute = require("./routes/uploadRoute");

// -------------------- INIT DIRECTORIES --------------------
const dirsToCreate = ["uploads", "outputs"];

dirsToCreate.forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`[Init] Created directory: ${dir}`);
    }
});

// -------------------- APP + SERVER --------------------
const app = express();
const server = http.createServer(app);

// -------------------- ENV --------------------
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// allow multiple origins if needed (comma-separated in env)
const allowedOrigins = CLIENT_URL.split(",");

// -------------------- CORS (EXPRESS) --------------------
app.use(cors({
    origin: function (origin, callback) {
        // allow server-to-server / Postman
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS blocked"));
    },
    credentials: true
}));

app.use(express.json());

// -------------------- SOCKET.IO CORS --------------------
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// make io accessible globally
app.set("io", io);

// -------------------- ROUTES --------------------
app.use("/api", uploadRoute);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server Running"
    });
});

// -------------------- SOCKET EVENTS --------------------
io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
});

// -------------------- ERROR HANDLING --------------------
process.on("uncaughtException", (error) => {
    console.error("[FATAL] Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[FATAL] Unhandled Rejection at:", promise, "reason:", reason);
});

// -------------------- START SERVER --------------------
server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
    console.log(`[CORS] Allowed Origins: ${allowedOrigins}`);
});
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const uploadRoute = require("./routes/uploadRoute");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 5001;

// make io accessible everywhere
app.set("io", io);

app.use(cors({
    origin: "*"
}));
app.use(express.json());

app.use("/api", uploadRoute);

app.get("/", (req, res) => {
    res.send("Server Running");
});

// socket connection
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
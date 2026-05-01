// server/index.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envCandidates = [
    path.join(__dirname, ".env.local"),
    path.join(__dirname, ".env"),
    path.join(__dirname, "env"),
];
const activeEnvPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(activeEnvPath ? { path: activeEnvPath } : undefined);
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const residentRoutes = require("./routes/resident");
const certificateRoutes = require("./routes/certificates");

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://certifast-two.vercel.app",
        ],
        credentials: true,
    }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/certificates", certificateRoutes);
// Keep /api/admin for backwards compatibility (if any existing clients still call it)
app.use("/api/admin", require("./routes/admin"));

// Health check
app.get("/", (req, res) => res.json({ message: "CertiFast API is running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const reportsRoutes = require("./routes/reports");
app.use("/api/reports", reportsRoutes);

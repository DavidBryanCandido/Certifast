const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const dotEnvPath = path.join(__dirname, "..", ".env");
const fallbackEnvPath = path.join(__dirname, "..", "env");
dotenv.config({
    path: fs.existsSync(dotEnvPath) ? dotEnvPath : fallbackEnvPath,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Supabase
});

module.exports = pool;

const { Pool } = require("pg");

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const shouldUseSsl =
    process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

const pool = new Pool(
    hasDatabaseUrl
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
          }
        : {
              host: process.env.DB_HOST || "localhost",
              port: Number(process.env.DB_PORT || 5432),
              database: process.env.DB_NAME,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
          }
);

module.exports = pool;

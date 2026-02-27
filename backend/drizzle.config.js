require('dotenv').config();

/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: "./api/schema.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};

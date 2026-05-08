const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,

    waitForConnections: true,
    connectionLimit: 10,

    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.log("DB connection failed ❌", err);
    } else {
        console.log("DB connected ✅");
        connection.release();
    }
});

module
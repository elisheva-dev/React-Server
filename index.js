import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// PostgreSQL connection
const connectionString = process.env.DATABASE_URL || "";
const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// create tables on startup
async function initDb() {
    await pool.query(`CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        data JSONB
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        datetime TEXT UNIQUE NOT NULL,
        info JSONB
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS business_data (
        id INTEGER PRIMARY KEY DEFAULT 1,
        name TEXT,
        address TEXT,
        phone TEXT,
        owners TEXT,
        logo TEXT
    );`);

    const res = await pool.query("SELECT COUNT(*) FROM business_data");
    if (parseInt(res.rows[0].count) === 0) {
        await pool.query(
            `INSERT INTO business_data (id, name, address, phone, owners, logo)
             VALUES (1, $1, $2, $3, $4, $5)`,
            ["Respira", "Yafo - Jerusalem", "02-6442222", "owners: 45921", "/images/logo.png"]
        );
    }
}

initDb().then(() => console.log("DB initialized")).catch(err => console.error("DB init error:", err));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// login (unchanged)
app.post("/login", (req, res) => {
    const body = req.body;
    if (body.name === "admin" && body.password === "123456") {
        res.status(200).send("Login success!");
    } else {
        res.status(401).send("Login failed!");
    }
});

// appointments
app.post("/appointment", async (req, res) => {
    const { dateTime, ...rest } = req.body;
    try {
        const exists = await pool.query("SELECT 1 FROM appointments WHERE datetime = $1", [dateTime]);
        if (exists.rowCount > 0) {
            return res.status(400).send("Appointment is not available!");
        }
        const result = await pool.query(
            "INSERT INTO appointments (datetime, info) VALUES ($1, $2) RETURNING *",
            [dateTime, rest]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/appointments", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM appointments ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// services
app.post("/service", async (req, res) => {
    const { name, ...rest } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO services (name, data) VALUES ($1, $2) RETURNING *",
            [name, rest]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        if (err.code === "23505") { // unique_violation
            return res.status(400).send("Service already exists!");
        }
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/services", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, data FROM services ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// business data
app.post("/businessData", async (req, res) => {
    const { name, address, phone, owners, logo } = req.body;
    try {
        const result = await pool.query(
            `UPDATE business_data SET name=$1, address=$2, phone=$3, owners=$4, logo=$5 WHERE id=1 RETURNING *`,
            [name, address, phone, owners, logo]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/businessData", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM business_data WHERE id=1");
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

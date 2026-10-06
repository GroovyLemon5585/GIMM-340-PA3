const express = require("express");
const mysql = require("mysql2/promise");

const path = require("path");

const app = express();

const db = mysql.createPool({
    host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "HUNTERANDERSON753"
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latest = { distance: null, inches: null, time: null };

const toInches = (cm) => Math.round((cm / 2.54) * 10) / 10;

app.post("/api/sensor", async (req, res) => {
    console.log(req.body);
    const distance = Math.round(Number(req.body.distance));
    if (!Number.isFinite(distance)) {
        return res.status(400).json({ message: "distance must be a number" });
    }

    latest = { distance, inches: toInches(distance), time: Date.now() };

    try {
        await db.execute("INSERT INTO distance (distance) VALUES (?)", [distance]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
    }

    res.json({
        message: "Sensor data received"
    });
});

app.get("/api/sensor", (req, res) => {
    res.json(latest);
});

app.get("/api/readings", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT distance_id, distance FROM distance ORDER BY distance_id DESC LIMIT 1000"
        );
        res.json(rows.map((r) => ({
            id: r.distance_id,
            inches: toInches(r.distance)
        })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});

[3000, 8080].forEach((p) => {
    app.listen(p, "0.0.0.0", () => {
        console.log(`Server running on port ${p}`);
    });
});

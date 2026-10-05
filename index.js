const express = require("express");

const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latest = { distance: null, time: null };

app.post("/api/sensor", (req, res) => {
    console.log(req.body);
    latest = { distance: req.body.distance, time: Date.now() };
    res.json({
        message: "Sensor data received"
    });
});

app.get("/api/sensor", (req, res) => {
    res.json(latest);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

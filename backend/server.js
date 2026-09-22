// ============================================================
// FLEETFLOW SERVER
// ============================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();

const authRoutes =
    require("./routes/authRoutes");

const driverRoutes =
    require("./routes/driverRoutes");

const vehicleRoutes =
    require("./routes/vehicleRoutes");

const customerRoutes =
    require("./routes/customerRoutes");

const deliveryRoutes =
    require("./routes/deliveryRoutes");


const app = express();

const PORT =
    process.env.PORT || 5000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================================
// FRONTEND
// ============================================================

const frontendPath =
    path.join(
        __dirname,
        "..",
        "frontend"
    );


// ============================================================
// DISABLE CACHE
// ============================================================

app.use((req, res, next) => {

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
        "Pragma",
        "no-cache"
    );

    res.setHeader(
        "Expires",
        "0"
    );

    next();

});


app.use(
    express.static(
        frontendPath
    )
);


// ============================================================
// MONGODB CONNECTION
// ============================================================

const MONGODB_URI =
    process.env.MONGODB_URI;


async function connectDatabase() {

    if (!MONGODB_URI) {

        console.error(
            "❌ MONGODB_URI is not configured."
        );

        return false;

    }


    try {

        await mongoose.connect(
            MONGODB_URI
        );

        console.log(
            "✅ MongoDB Atlas connected"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ MongoDB connection failed:",
            error.message
        );

        return false;

    }

}


// ============================================================
// AUTH ROUTES
// ============================================================
//
// Login:
//
// POST /api/auth/login
//
// Logout:
//
// POST /api/auth/logout
//
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);


// ============================================================
// DRIVER ROUTES
// ============================================================
//
// Driver API:
//
// GET    /api/drivers
// GET    /api/drivers/:id
// POST   /api/drivers
// PUT    /api/drivers/:id
// DELETE /api/drivers/:id
//
// ============================================================

app.use(
    "/api/drivers",
    driverRoutes
);


// ============================================================
// VEHICLE ROUTES
// ============================================================
//
// Vehicle API:
//
// GET    /api/vehicles
// GET    /api/vehicles/:id
// POST   /api/vehicles
// PUT    /api/vehicles/:id
// DELETE /api/vehicles/:id
//
// ============================================================

app.use(
    "/api/vehicles",
    vehicleRoutes
);


// ============================================================
// CUSTOMER ROUTES
// ============================================================
//
// Customer API:
//
// GET    /api/customers
// GET    /api/customers/:id
// POST   /api/customers
// PUT    /api/customers/:id
// DELETE /api/customers/:id
//
// ============================================================

app.use(
    "/api/customers",
    customerRoutes
);


// ============================================================
// DELIVERY ROUTES
// ============================================================
//
// Delivery API:
//
// GET    /api/deliveries
// GET    /api/deliveries/:id
// POST   /api/deliveries
// PUT    /api/deliveries/:id
// DELETE /api/deliveries/:id
//
// ============================================================

app.use(
    "/api/deliveries",
    deliveryRoutes
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "FleetFlow API is running",

            database:
                mongoose.connection.readyState === 1
                    ? "connected"
                    : "not connected"

        });

    }
);


// ============================================================
// FRONTEND ROOT
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                frontendPath,
                "pages",
                "login.html"
            )
        );

    }
);


// ============================================================
// API 404
// ============================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }
);


// ============================================================
// GENERAL ERROR HANDLER
// ============================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "❌ Server error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);


// ============================================================
// START SERVER
// ============================================================

async function startServer() {

    const databaseConnected =
        await connectDatabase();


    app.listen(
        PORT,
        () => {

            console.log("");

            console.log(
                "========================================"
            );

            console.log(
                "        🚚 FLEETFLOW SERVER"
            );

            console.log(
                "========================================"
            );

            console.log(
                `Server:   http://localhost:${PORT}`
            );

            console.log(
                `Login:    http://localhost:${PORT}/`
            );

            console.log(
                `API:      http://localhost:${PORT}/api/health`
            );

            console.log(
                `Drivers:  http://localhost:${PORT}/api/drivers`
            );

            console.log(
                `Vehicles: http://localhost:${PORT}/api/vehicles`
            );

            console.log(
                `Customers: http://localhost:${PORT}/api/customers`
            );

            console.log(
                `Deliveries: http://localhost:${PORT}/api/deliveries`
            );

            console.log(
                `DB:       ${
                    databaseConnected
                        ? "Connected"
                        : "Not connected"
                }`
            );

            console.log(
                "========================================"
            );

            console.log("");

        }
    );

}


// ============================================================
// START
// ============================================================

startServer();
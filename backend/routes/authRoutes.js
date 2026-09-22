const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();


// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;


        // --------------------------------------------------------
        // VALIDATE INPUT
        // --------------------------------------------------------

        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });

        }


        // --------------------------------------------------------
        // FIND USER
        // --------------------------------------------------------

        const user = await User.findOne({
            username: username.trim()
        });


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });

        }


        // --------------------------------------------------------
        // CHECK ACCOUNT STATUS
        // --------------------------------------------------------

        if (!user.isActive) {

            return res.status(403).json({
                success: false,
                message: "This account is inactive."
            });

        }


        // --------------------------------------------------------
        // COMPARE PASSWORD
        // --------------------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });

        }


        // --------------------------------------------------------
        // SUCCESSFUL LOGIN
        // --------------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

});


// ============================================================
// LOGOUT
// POST /api/auth/logout
// ============================================================
//
// Current FleetFlow authentication uses localStorage on the
// frontend, so there is no server session to destroy yet.
//
// This endpoint provides a proper backend logout endpoint and
// can be expanded later when authentication is moved to
// server-side sessions or secure cookies.
// ============================================================

router.post("/logout", async (req, res) => {

    try {

        console.log(
            "FleetFlow: Logout request received."
        );


        return res.status(200).json({

            success: true,

            message:
                "Logout successful."

        });

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during logout."

        });

    }

});


module.exports = router;
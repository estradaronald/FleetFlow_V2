const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {

    try {

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ Connected to MongoDB Atlas");

        const existingUser = await User.findOne({
            username: "admin"
        });

        if (existingUser) {

            console.log("⚠️ Admin account already exists.");

            await mongoose.connection.close();

            return;
        }

        const hashedPassword = await bcrypt.hash(
            "admin123",
            10
        );

        const admin = await User.create({
            username: "admin",
            password: hashedPassword,
            fullName: "FleetFlow Administrator",
            role: "Dispatcher",
            isActive: true
        });

        console.log("✅ Admin account created");
        console.log(`Username: ${admin.username}`);
        console.log("Password: admin123");

        await mongoose.connection.close();

    } catch (error) {

        console.error(
            "❌ Failed to create admin:",
            error.message
        );

        process.exit(1);
    }
}

createAdmin();
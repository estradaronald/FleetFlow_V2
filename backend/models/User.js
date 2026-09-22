// ============================================================
// FLEETFLOW USER MODEL
// ============================================================

const mongoose = require("mongoose");


// ============================================================
// USER SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },

        password: {
            type: String,
            required: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        role: {
            type: String,
            enum: ["Dispatcher"],
            default: "Dispatcher"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


// ============================================================
// EXPORT MONGOOSE MODEL
// ============================================================

const User = mongoose.model("User", userSchema);

module.exports = User;
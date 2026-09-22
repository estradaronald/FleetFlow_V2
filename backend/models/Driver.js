// ============================================================
// FLEETFLOW DRIVER MODEL
// ============================================================

const mongoose = require("mongoose");


// ============================================================
// DRIVER SCHEMA
// ============================================================

const driverSchema = new mongoose.Schema(

    {

        // ----------------------------------------------------
        // DRIVER ID
        // ----------------------------------------------------
        // Human-readable FleetFlow driver identifier.
        // Example: DRV-0001
        //

        driverId: {

            type: String,

            required: true,

            unique: true,

            trim: true,

            uppercase: true,

            maxlength: 20

        },


        // ----------------------------------------------------
        // FULL NAME
        // ----------------------------------------------------

        fullName: {

            type: String,

            required: true,

            trim: true,

            maxlength: 100

        },


        // ----------------------------------------------------
        // PHONE
        // ----------------------------------------------------

        phone: {

            type: String,

            required: true,

            trim: true,

            maxlength: 20

        },


        // ----------------------------------------------------
        // LICENSE NUMBER
        // ----------------------------------------------------

        licenseNumber: {

            type: String,

            required: true,

            unique: true,

            trim: true,

            uppercase: true,

            maxlength: 50

        },


        // ----------------------------------------------------
        // LICENSE EXPIRY
        // ----------------------------------------------------

        licenseExpiry: {

            type: Date,

            required: true

        },


        // ----------------------------------------------------
        // DRIVER STATUS
        // ----------------------------------------------------

        status: {

            type: String,

            enum: [

                "Available",

                "On Delivery",

                "Off Duty",

                "Inactive"

            ],

            default: "Available"

        },


        // ----------------------------------------------------
        // ACTIVE DRIVER
        // ----------------------------------------------------
        //
        // This allows us to disable a driver without deleting
        // the actual driver record.
        //

        isActive: {

            type: Boolean,

            default: true

        }

    },


    // ========================================================
    // TIMESTAMPS
    // ========================================================

    {

        timestamps: true

    }

);


// ============================================================
// INDEXES
// ============================================================

driverSchema.index({
    fullName: 1
});

driverSchema.index({
    status: 1
});


// ============================================================
// MODEL
// ============================================================

const Driver =
    mongoose.model(
        "Driver",
        driverSchema
    );


// ============================================================
// EXPORT
// ============================================================

module.exports = Driver;
// ============================================================
// FLEETFLOW VEHICLE MODEL
// ============================================================

const mongoose = require("mongoose");


// ============================================================
// VEHICLE SCHEMA
// ============================================================

const vehicleSchema = new mongoose.Schema(

    {

        // ----------------------------------------------------
        // VEHICLE ID
        // ----------------------------------------------------
        // Human-readable FleetFlow vehicle identifier.
        //
        // Example:
        // VH-0001
        // VH-0002
        //

        vehicleId: {

            type: String,

            required: true,

            unique: true,

            trim: true,

            uppercase: true,

            maxlength: 20

        },


        // ----------------------------------------------------
        // PLATE NUMBER
        // ----------------------------------------------------
        // Vehicle registration / plate number.
        //
        // Example:
        // ABC-1234
        //

        plateNumber: {

            type: String,

            required: true,

            unique: true,

            trim: true,

            uppercase: true,

            maxlength: 20

        },


        // ----------------------------------------------------
        // VEHICLE TYPE
        // ----------------------------------------------------
        //
        // Examples:
        // Van
        // Truck
        // Motorcycle
        // Pickup
        //

        vehicleType: {

            type: String,

            required: true,

            enum: [

                "Van",

                "Truck",

                "Motorcycle",

                "Pickup"

            ]

        },


        // ----------------------------------------------------
        // MAKE / MODEL
        // ----------------------------------------------------
        //
        // Example:
        // Toyota Hiace
        // Isuzu N-Series
        //

        makeModel: {

            type: String,

            required: true,

            trim: true,

            maxlength: 100

        },


        // ----------------------------------------------------
        // CAPACITY
        // ----------------------------------------------------
        // Maximum cargo capacity.
        //
        // Stored as a number in kilograms.
        //
        // Example:
        // 1000 = 1,000 kg
        //

        capacity: {

            type: Number,

            required: true,

            min: 0

        },


        // ----------------------------------------------------
        // VEHICLE STATUS
        // ----------------------------------------------------

        status: {

            type: String,

            enum: [

                "Available",

                "On Delivery",

                "Maintenance",

                "Inactive"

            ],

            default: "Available"

        },


        // ----------------------------------------------------
        // ACTIVE VEHICLE
        // ----------------------------------------------------
        //
        // Allows FleetFlow to disable a vehicle without
        // permanently deleting the database record.
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


// ------------------------------------------------------------
// SEARCH INDEX
// ------------------------------------------------------------

vehicleSchema.index({

    makeModel: 1

});


// ------------------------------------------------------------
// STATUS INDEX
// ------------------------------------------------------------

vehicleSchema.index({

    status: 1

});


// ------------------------------------------------------------
// VEHICLE TYPE INDEX
// ------------------------------------------------------------

vehicleSchema.index({

    vehicleType: 1

});


// ============================================================
// MODEL
// ============================================================

const Vehicle =
    mongoose.model(
        "Vehicle",
        vehicleSchema
    );


// ============================================================
// EXPORT
// ============================================================

module.exports = Vehicle;
// ============================================================
// FLEETFLOW DELIVERY MODEL
// ============================================================

const mongoose = require("mongoose");


// ============================================================
// DELIVERY SCHEMA
// ============================================================

const deliverySchema = new mongoose.Schema(
    {
        deliveryId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: 30
        },


        // ====================================================
        // CUSTOMER
        // ====================================================

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },


        // ====================================================
        // DRIVER
        // ====================================================

        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            default: null
        },


        // ====================================================
        // VEHICLE
        // ====================================================

        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            default: null
        },


        // ====================================================
        // PICKUP ADDRESS
        // ====================================================

        pickupAddress: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250
        },


        // ====================================================
        // DELIVERY ADDRESS
        // ====================================================

        deliveryAddress: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250
        },


        // ====================================================
        // SCHEDULED DATE
        // ====================================================

        scheduledDate: {
            type: Date,
            required: true
        },


        // ====================================================
        // DELIVERY STATUS
        // ====================================================

        status: {
            type: String,
            enum: [
                "Pending",
                "Assigned",
                "In Transit",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending"
        },


        // ====================================================
        // PRIORITY
        // ====================================================

        priority: {
            type: String,
            enum: [
                "Normal",
                "High",
                "Urgent"
            ],
            default: "Normal"
        },


        // ====================================================
        // NOTES
        // ====================================================

        notes: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
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

deliverySchema.index({
    deliveryId: 1
});

deliverySchema.index({
    customer: 1
});

deliverySchema.index({
    driver: 1
});

deliverySchema.index({
    vehicle: 1
});

deliverySchema.index({
    status: 1
});

deliverySchema.index({
    priority: 1
});

deliverySchema.index({
    scheduledDate: 1
});


// ============================================================
// DELIVERY MODEL
// ============================================================

const Delivery =
    mongoose.model(
        "Delivery",
        deliverySchema
    );


// ============================================================
// EXPORT
// ============================================================

module.exports = Delivery;
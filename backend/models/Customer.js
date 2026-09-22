// ============================================================
// FLEETFLOW CUSTOMER MODEL
// ============================================================

const mongoose = require("mongoose");


// ============================================================
// CUSTOMER SCHEMA
// ============================================================

const customerSchema = new mongoose.Schema(
    {
        customerId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: 20
        },

        companyName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        contactPerson: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 150
        },

        address: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250
        },

        status: {
            type: String,
            enum: [
                "Active",
                "Inactive"
            ],
            default: "Active"
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
// INDEXES
// ============================================================

customerSchema.index({
    companyName: 1
});

customerSchema.index({
    contactPerson: 1
});

customerSchema.index({
    status: 1
});


// ============================================================
// CUSTOMER MODEL
// ============================================================

const Customer =
    mongoose.model(
        "Customer",
        customerSchema
    );


// ============================================================
// EXPORT
// ============================================================

module.exports = Customer;
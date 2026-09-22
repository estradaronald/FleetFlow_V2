// ============================================================
// FLEETFLOW DELIVERY ROUTES
//
// Endpoints:
// GET    /api/deliveries
// GET    /api/deliveries/:id
// POST   /api/deliveries
// PUT    /api/deliveries/:id
// DELETE /api/deliveries/:id
//
// Features:
// - Delivery CRUD
// - Search
// - Status filtering
// - Priority filtering
// - Customer / Driver / Vehicle population
// ============================================================

const express = require("express");

const Delivery =
    require("../models/Delivery");

const Customer =
    require("../models/Customer");

const Driver =
    require("../models/Driver");

const Vehicle =
    require("../models/Vehicle");


const router = express.Router();


// ============================================================
// CONSTANTS
// ============================================================

const VALID_STATUSES = [
    "Pending",
    "Assigned",
    "In Transit",
    "Delivered",
    "Cancelled"
];

const VALID_PRIORITIES = [
    "Normal",
    "High",
    "Urgent"
];


// ============================================================
// HELPER: ESCAPE REGEX
// ============================================================

function escapeRegex(value) {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


// ============================================================
// GET ALL DELIVERIES
//
// GET /api/deliveries
//
// Optional query parameters:
// ?search=
// ?status=
// ?priority=
// ============================================================

router.get("/", async (req, res) => {
    try {
        const {
            search,
            status,
            priority
        } = req.query;


        const filter = {};


        // ====================================================
        // STATUS FILTER
        // ====================================================

        if (status && status !== "all") {
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid delivery status."
                });
            }

            filter.status = status;
        }


        // ====================================================
        // PRIORITY FILTER
        // ====================================================

        if (priority && priority !== "all") {
            if (!VALID_PRIORITIES.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid delivery priority."
                });
            }

            filter.priority = priority;
        }


        // ====================================================
        // SEARCH
        //
        // Search:
        // - Delivery ID
        // - Customer ID
        // - Company name
        // - Contact person
        // - Driver ID
        // - Driver name
        // - Vehicle ID
        // - Plate number
        // ====================================================

        if (search && search.trim()) {
            const searchValue =
                search.trim();

            const regex =
                new RegExp(
                    escapeRegex(searchValue),
                    "i"
                );


            // -----------------------------------------------
            // Find matching customers
            // -----------------------------------------------

            const matchingCustomers =
                await Customer.find({
                    $or: [
                        {
                            customerId: regex
                        },
                        {
                            companyName: regex
                        },
                        {
                            contactPerson: regex
                        }
                    ]
                })
                    .select("_id")
                    .lean();


            // -----------------------------------------------
            // Find matching drivers
            // -----------------------------------------------

            const matchingDrivers =
                await Driver.find({
                    $or: [
                        {
                            driverId: regex
                        },
                        {
                            fullName: regex
                        }
                    ]
                })
                    .select("_id")
                    .lean();


            // -----------------------------------------------
            // Find matching vehicles
            // -----------------------------------------------

            const matchingVehicles =
                await Vehicle.find({
                    $or: [
                        {
                            vehicleId: regex
                        },
                        {
                            plateNumber: regex
                        },
                        {
                            makeModel: regex
                        }
                    ]
                })
                    .select("_id")
                    .lean();


            // -----------------------------------------------
            // Build search conditions
            // -----------------------------------------------

            const searchConditions = [
                {
                    deliveryId: regex
                }
            ];


            if (matchingCustomers.length > 0) {
                searchConditions.push({
                    customer: {
                        $in: matchingCustomers.map(
                            item => item._id
                        )
                    }
                });
            }


            if (matchingDrivers.length > 0) {
                searchConditions.push({
                    driver: {
                        $in: matchingDrivers.map(
                            item => item._id
                        )
                    }
                });
            }


            if (matchingVehicles.length > 0) {
                searchConditions.push({
                    vehicle: {
                        $in: matchingVehicles.map(
                            item => item._id
                        )
                    }
                });
            }


            filter.$or = searchConditions;
        }


        // ====================================================
        // GET DELIVERIES
        // ====================================================

        const deliveries =
            await Delivery.find(filter)
                .populate(
                    "customer",
                    "customerId companyName contactPerson phone email"
                )
                .populate(
                    "driver",
                    "driverId fullName phone licenseNumber status"
                )
                .populate(
                    "vehicle",
                    "vehicleId plateNumber vehicleType makeModel capacity status"
                )
                .sort({
                    scheduledDate: 1,
                    createdAt: -1
                })
                .lean();


        res.status(200).json({
            success: true,
            count: deliveries.length,
            data: deliveries
        });

    } catch (error) {
        console.error(
            "GET /api/deliveries error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch deliveries.",
            error: error.message
        });
    }
});


// ============================================================
// GET SINGLE DELIVERY
//
// GET /api/deliveries/:id
// ============================================================

router.get("/:id", async (req, res) => {
    try {
        const delivery =
            await Delivery.findById(
                req.params.id
            )
                .populate(
                    "customer",
                    "customerId companyName contactPerson phone email address status"
                )
                .populate(
                    "driver",
                    "driverId fullName phone licenseNumber licenseExpiry status"
                )
                .populate(
                    "vehicle",
                    "vehicleId plateNumber vehicleType makeModel capacity status"
                );


        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found."
            });
        }


        res.status(200).json({
            success: true,
            data: delivery
        });

    } catch (error) {
        console.error(
            "GET /api/deliveries/:id error:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery ID."
            });
        }


        res.status(500).json({
            success: false,
            message: "Failed to fetch delivery.",
            error: error.message
        });
    }
});


// ============================================================
// CREATE DELIVERY
//
// POST /api/deliveries
// ============================================================

router.post("/", async (req, res) => {
    try {
        const {
            deliveryId,
            customer,
            driver,
            vehicle,
            pickupAddress,
            deliveryAddress,
            scheduledDate,
            status,
            priority,
            notes
        } = req.body;


        // ====================================================
        // REQUIRED FIELDS
        // ====================================================

        if (
            !deliveryId ||
            !customer ||
            !pickupAddress ||
            !deliveryAddress ||
            !scheduledDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Delivery ID, customer, pickup address, delivery address, and scheduled date are required."
            });
        }


        // ====================================================
        // VALIDATE DELIVERY ID
        // ====================================================

        const normalizedDeliveryId =
            deliveryId
                .trim()
                .toUpperCase();


        const existingDelivery =
            await Delivery.findOne({
                deliveryId:
                    normalizedDeliveryId
            });


        if (existingDelivery) {
            return res.status(409).json({
                success: false,
                message:
                    "A delivery with this Delivery ID already exists."
            });
        }


        // ====================================================
        // VALIDATE STATUS
        // ====================================================

        if (
            status &&
            !VALID_STATUSES.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery status."
            });
        }


        // ====================================================
        // VALIDATE PRIORITY
        // ====================================================

        if (
            priority &&
            !VALID_PRIORITIES.includes(priority)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery priority."
            });
        }


        // ====================================================
        // VALIDATE DATE
        // ====================================================

        const parsedDate =
            new Date(scheduledDate);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid scheduled date."
            });
        }


        // ====================================================
        // CHECK CUSTOMER
        // ====================================================

        const customerRecord =
            await Customer.findById(
                customer
            );


        if (!customerRecord) {
            return res.status(404).json({
                success: false,
                message:
                    "Selected customer was not found."
            });
        }


        // ====================================================
        // CHECK DRIVER
        // ====================================================

        if (driver) {
            const driverRecord =
                await Driver.findById(
                    driver
                );


            if (!driverRecord) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Selected driver was not found."
                });
            }
        }


        // ====================================================
        // CHECK VEHICLE
        // ====================================================

        if (vehicle) {
            const vehicleRecord =
                await Vehicle.findById(
                    vehicle
                );


            if (!vehicleRecord) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Selected vehicle was not found."
                });
            }
        }


        // ====================================================
        // CREATE DELIVERY
        // ====================================================

        const delivery =
            await Delivery.create({
                deliveryId:
                    normalizedDeliveryId,

                customer,

                driver:
                    driver || null,

                vehicle:
                    vehicle || null,

                pickupAddress:
                    pickupAddress.trim(),

                deliveryAddress:
                    deliveryAddress.trim(),

                scheduledDate:
                    parsedDate,

                status:
                    status || "Pending",

                priority:
                    priority || "Normal",

                notes:
                    notes
                        ? notes.trim()
                        : ""
            });


        // ====================================================
        // RETURN POPULATED DELIVERY
        // ====================================================

        const populatedDelivery =
            await Delivery.findById(
                delivery._id
            )
                .populate(
                    "customer",
                    "customerId companyName contactPerson phone email"
                )
                .populate(
                    "driver",
                    "driverId fullName phone licenseNumber status"
                )
                .populate(
                    "vehicle",
                    "vehicleId plateNumber vehicleType makeModel capacity status"
                );


        res.status(201).json({
            success: true,
            message:
                "Delivery created successfully.",
            data: populatedDelivery
        });

    } catch (error) {
        console.error(
            "POST /api/deliveries error:",
            error
        );


        // ====================================================
        // DUPLICATE KEY
        // ====================================================

        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A delivery with this Delivery ID already exists."
            });
        }


        // ====================================================
        // VALIDATION ERROR
        // ====================================================

        if (
            error.name ===
            "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please check the delivery information.",
                errors: Object.values(
                    error.errors
                ).map(
                    item => item.message
                )
            });
        }


        res.status(500).json({
            success: false,
            message:
                "Failed to create delivery.",
            error: error.message
        });
    }
});


// ============================================================
// UPDATE DELIVERY
//
// PUT /api/deliveries/:id
// ============================================================

router.put("/:id", async (req, res) => {
    try {
        const {
            deliveryId,
            customer,
            driver,
            vehicle,
            pickupAddress,
            deliveryAddress,
            scheduledDate,
            status,
            priority,
            notes
        } = req.body;


        // ====================================================
        // FIND DELIVERY
        // ====================================================

        const delivery =
            await Delivery.findById(
                req.params.id
            );


        if (!delivery) {
            return res.status(404).json({
                success: false,
                message:
                    "Delivery not found."
            });
        }


        // ====================================================
        // DELIVERY ID
        // ====================================================

        if (
            deliveryId !== undefined
        ) {
            const normalizedDeliveryId =
                deliveryId
                    .trim()
                    .toUpperCase();


            const duplicate =
                await Delivery.findOne({
                    deliveryId:
                        normalizedDeliveryId,

                    _id: {
                        $ne:
                            req.params.id
                    }
                });


            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A delivery with this Delivery ID already exists."
                });
            }


            delivery.deliveryId =
                normalizedDeliveryId;
        }


        // ====================================================
        // CUSTOMER
        // ====================================================

        if (
            customer !== undefined
        ) {
            const customerRecord =
                await Customer.findById(
                    customer
                );


            if (!customerRecord) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Selected customer was not found."
                });
            }


            delivery.customer =
                customer;
        }


        // ====================================================
        // DRIVER
        // ====================================================

        if (
            driver !== undefined
        ) {
            if (driver === null || driver === "") {
                delivery.driver = null;
            } else {
                const driverRecord =
                    await Driver.findById(
                        driver
                    );


                if (!driverRecord) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Selected driver was not found."
                    });
                }


                delivery.driver =
                    driver;
            }
        }


        // ====================================================
        // VEHICLE
        // ====================================================

        if (
            vehicle !== undefined
        ) {
            if (vehicle === null || vehicle === "") {
                delivery.vehicle = null;
            } else {
                const vehicleRecord =
                    await Vehicle.findById(
                        vehicle
                    );


                if (!vehicleRecord) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Selected vehicle was not found."
                    });
                }


                delivery.vehicle =
                    vehicle;
            }
        }


        // ====================================================
        // PICKUP ADDRESS
        // ====================================================

        if (
            pickupAddress !== undefined
        ) {
            if (!pickupAddress.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Pickup address cannot be empty."
                });
            }


            delivery.pickupAddress =
                pickupAddress.trim();
        }


        // ====================================================
        // DELIVERY ADDRESS
        // ====================================================

        if (
            deliveryAddress !== undefined
        ) {
            if (!deliveryAddress.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Delivery address cannot be empty."
                });
            }


            delivery.deliveryAddress =
                deliveryAddress.trim();
        }


        // ====================================================
        // SCHEDULED DATE
        // ====================================================

        if (
            scheduledDate !== undefined
        ) {
            const parsedDate =
                new Date(
                    scheduledDate
                );


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid scheduled date."
                });
            }


            delivery.scheduledDate =
                parsedDate;
        }


        // ====================================================
        // STATUS
        // ====================================================

        if (
            status !== undefined
        ) {
            if (
                !VALID_STATUSES.includes(
                    status
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid delivery status."
                });
            }


            delivery.status =
                status;
        }


        // ====================================================
        // PRIORITY
        // ====================================================

        if (
            priority !== undefined
        ) {
            if (
                !VALID_PRIORITIES.includes(
                    priority
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid delivery priority."
                });
            }


            delivery.priority =
                priority;
        }


        // ====================================================
        // NOTES
        // ====================================================

        if (
            notes !== undefined
        ) {
            delivery.notes =
                notes
                    ? notes.trim()
                    : "";
        }


        // ====================================================
        // SAVE
        // ====================================================

        await delivery.save();


        // ====================================================
        // RETURN POPULATED DELIVERY
        // ====================================================

        const updatedDelivery =
            await Delivery.findById(
                delivery._id
            )
                .populate(
                    "customer",
                    "customerId companyName contactPerson phone email address status"
                )
                .populate(
                    "driver",
                    "driverId fullName phone licenseNumber licenseExpiry status"
                )
                .populate(
                    "vehicle",
                    "vehicleId plateNumber vehicleType makeModel capacity status"
                );


        res.status(200).json({
            success: true,
            message:
                "Delivery updated successfully.",
            data: updatedDelivery
        });

    } catch (error) {
        console.error(
            "PUT /api/deliveries/:id error:",
            error
        );


        // ====================================================
        // INVALID OBJECT ID
        // ====================================================

        if (
            error.name ===
            "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid delivery ID."
            });
        }


        // ====================================================
        // DUPLICATE KEY
        // ====================================================

        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A delivery with this Delivery ID already exists."
            });
        }


        // ====================================================
        // VALIDATION ERROR
        // ====================================================

        if (
            error.name ===
            "ValidationError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please check the delivery information.",
                errors: Object.values(
                    error.errors
                ).map(
                    item => item.message
                )
            });
        }


        res.status(500).json({
            success: false,
            message:
                "Failed to update delivery.",
            error: error.message
        });
    }
});


// ============================================================
// DELETE DELIVERY
//
// DELETE /api/deliveries/:id
// ============================================================

router.delete("/:id", async (req, res) => {
    try {
        const delivery =
            await Delivery.findByIdAndDelete(
                req.params.id
            );


        if (!delivery) {
            return res.status(404).json({
                success: false,
                message:
                    "Delivery not found."
            });
        }


        res.status(200).json({
            success: true,
            message:
                "Delivery deleted successfully."
        });

    } catch (error) {
        console.error(
            "DELETE /api/deliveries/:id error:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid delivery ID."
            });
        }


        res.status(500).json({
            success: false,
            message:
                "Failed to delete delivery.",
            error: error.message
        });
    }
});


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
// ============================================================
// FLEETFLOW VEHICLE ROUTES
// ============================================================

const express = require("express");

const Vehicle = require("../models/Vehicle");

const router = express.Router();


// ============================================================
// GET ALL VEHICLES
// ============================================================
// GET /api/vehicles
//
// Optional query parameters:
//
// ?search=toyota
// ?status=Available
// ?type=Van
//
// Examples:
//
// /api/vehicles
// /api/vehicles?search=toyota
// /api/vehicles?status=Available
// /api/vehicles?type=Van
// /api/vehicles?search=toyota&status=Available
// ============================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const {
                search,
                status,
                type
            } = req.query;


            // ------------------------------------------------
            // BUILD QUERY
            // ------------------------------------------------

            const query = {};


            // ------------------------------------------------
            // SEARCH
            // ------------------------------------------------

            if (
                search &&
                search.trim()
            ) {

                const searchValue =
                    search.trim();


                query.$or = [

                    {
                        vehicleId: {
                            $regex:
                                searchValue,
                            $options: "i"
                        }
                    },

                    {
                        plateNumber: {
                            $regex:
                                searchValue,
                            $options: "i"
                        }
                    },

                    {
                        makeModel: {
                            $regex:
                                searchValue,
                            $options: "i"
                        }
                    },

                    {
                        vehicleType: {
                            $regex:
                                searchValue,
                            $options: "i"
                        }
                    }

                ];

            }


            // ------------------------------------------------
            // STATUS FILTER
            // ------------------------------------------------

            if (
                status &&
                status !== "all"
            ) {

                query.status =
                    status;

            }


            // ------------------------------------------------
            // VEHICLE TYPE FILTER
            // ------------------------------------------------

            if (
                type &&
                type !== "all"
            ) {

                query.vehicleType =
                    type;

            }


            // ------------------------------------------------
            // GET VEHICLES
            // ------------------------------------------------

            const vehicles =
                await Vehicle
                    .find(query)
                    .sort({
                        createdAt: -1
                    });


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.status(200).json({

                success: true,

                count:
                    vehicles.length,

                vehicles

            });

        } catch (error) {

            console.error(
                "Get vehicles error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching vehicles."

            });

        }

    }
);


// ============================================================
// GET SINGLE VEHICLE
// ============================================================
// GET /api/vehicles/:id
// ============================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const vehicle =
                await Vehicle.findById(
                    req.params.id
                );


            if (!vehicle) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Vehicle not found."

                });

            }


            return res.status(200).json({

                success: true,

                vehicle

            });

        } catch (error) {

            console.error(
                "Get vehicle error:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    "Invalid vehicle ID."

            });

        }

    }
);


// ============================================================
// CREATE VEHICLE
// ============================================================
// POST /api/vehicles
// ============================================================

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                vehicleId,
                plateNumber,
                vehicleType,
                makeModel,
                capacity,
                status
            } = req.body;


            // ------------------------------------------------
            // REQUIRED FIELDS
            // ------------------------------------------------

            if (
                !vehicleId ||
                !plateNumber ||
                !vehicleType ||
                !makeModel ||
                capacity === undefined ||
                capacity === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Vehicle ID, plate number, vehicle type, make/model, and capacity are required."

                });

            }


            // ------------------------------------------------
            // NORMALIZE VALUES
            // ------------------------------------------------

            const normalizedVehicleId =
                vehicleId
                    .trim()
                    .toUpperCase();


            const normalizedPlateNumber =
                plateNumber
                    .trim()
                    .toUpperCase();


            const normalizedMakeModel =
                makeModel
                    .trim();


            const normalizedCapacity =
                Number(capacity);


            // ------------------------------------------------
            // VALIDATE CAPACITY
            // ------------------------------------------------

            if (
                Number.isNaN(
                    normalizedCapacity
                ) ||
                normalizedCapacity < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Vehicle capacity must be a valid non-negative number."

                });

            }


            // ------------------------------------------------
            // VALIDATE VEHICLE TYPE
            // ------------------------------------------------

            const allowedVehicleTypes = [

                "Van",

                "Truck",

                "Motorcycle",

                "Pickup"

            ];


            if (
                !allowedVehicleTypes.includes(
                    vehicleType
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid vehicle type."

                });

            }


            // ------------------------------------------------
            // VALIDATE STATUS
            // ------------------------------------------------

            const allowedStatuses = [

                "Available",

                "On Delivery",

                "Maintenance",

                "Inactive"

            ];


            const normalizedStatus =
                status ||
                "Available";


            if (
                !allowedStatuses.includes(
                    normalizedStatus
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid vehicle status."

                });

            }


            // ------------------------------------------------
            // CHECK VEHICLE ID
            // ------------------------------------------------

            const existingVehicle =
                await Vehicle.findOne({

                    vehicleId:
                        normalizedVehicleId

                });


            if (existingVehicle) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A vehicle with this Vehicle ID already exists."

                });

            }


            // ------------------------------------------------
            // CHECK PLATE NUMBER
            // ------------------------------------------------

            const existingPlate =
                await Vehicle.findOne({

                    plateNumber:
                        normalizedPlateNumber

                });


            if (existingPlate) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A vehicle with this plate number already exists."

                });

            }


            // ------------------------------------------------
            // CREATE VEHICLE
            // ------------------------------------------------

            const vehicle =
                await Vehicle.create({

                    vehicleId:
                        normalizedVehicleId,

                    plateNumber:
                        normalizedPlateNumber,

                    vehicleType:
                        vehicleType,

                    makeModel:
                        normalizedMakeModel,

                    capacity:
                        normalizedCapacity,

                    status:
                        normalizedStatus

                });


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Vehicle created successfully.",

                vehicle

            });

        } catch (error) {

            console.error(
                "Create vehicle error:",
                error
            );


            // ------------------------------------------------
            // DUPLICATE KEY
            // ------------------------------------------------

            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Vehicle ID or plate number already exists."

                });

            }


            // ------------------------------------------------
            // VALIDATION ERROR
            // ------------------------------------------------

            if (
                error.name ===
                "ValidationError"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid vehicle data.",

                    errors:
                        error.errors

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while creating vehicle."

            });

        }

    }
);


// ============================================================
// UPDATE VEHICLE
// ============================================================
// PUT /api/vehicles/:id
// ============================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const {
                vehicleId,
                plateNumber,
                vehicleType,
                makeModel,
                capacity,
                status,
                isActive
            } = req.body;


            // ------------------------------------------------
            // BUILD UPDATE DATA
            // ------------------------------------------------

            const updateData = {};


            // ------------------------------------------------
            // VEHICLE ID
            // ------------------------------------------------

            if (
                vehicleId !== undefined
            ) {

                if (
                    !vehicleId.trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Vehicle ID cannot be empty."

                    });

                }


                updateData.vehicleId =
                    vehicleId
                        .trim()
                        .toUpperCase();

            }


            // ------------------------------------------------
            // PLATE NUMBER
            // ------------------------------------------------

            if (
                plateNumber !== undefined
            ) {

                if (
                    !plateNumber.trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Plate number cannot be empty."

                    });

                }


                updateData.plateNumber =
                    plateNumber
                        .trim()
                        .toUpperCase();

            }


            // ------------------------------------------------
            // VEHICLE TYPE
            // ------------------------------------------------

            if (
                vehicleType !== undefined
            ) {

                const allowedVehicleTypes = [

                    "Van",

                    "Truck",

                    "Motorcycle",

                    "Pickup"

                ];


                if (
                    !allowedVehicleTypes.includes(
                        vehicleType
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid vehicle type."

                    });

                }


                updateData.vehicleType =
                    vehicleType;

            }


            // ------------------------------------------------
            // MAKE / MODEL
            // ------------------------------------------------

            if (
                makeModel !== undefined
            ) {

                if (
                    !makeModel.trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Make/model cannot be empty."

                    });

                }


                updateData.makeModel =
                    makeModel.trim();

            }


            // ------------------------------------------------
            // CAPACITY
            // ------------------------------------------------

            if (
                capacity !== undefined
            ) {

                const normalizedCapacity =
                    Number(capacity);


                if (
                    Number.isNaN(
                        normalizedCapacity
                    ) ||
                    normalizedCapacity < 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Vehicle capacity must be a valid non-negative number."

                    });

                }


                updateData.capacity =
                    normalizedCapacity;

            }


            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            if (
                status !== undefined
            ) {

                const allowedStatuses = [

                    "Available",

                    "On Delivery",

                    "Maintenance",

                    "Inactive"

                ];


                if (
                    !allowedStatuses.includes(
                        status
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid vehicle status."

                    });

                }


                updateData.status =
                    status;

            }


            // ------------------------------------------------
            // ACTIVE STATUS
            // ------------------------------------------------

            if (
                isActive !== undefined
            ) {

                updateData.isActive =
                    isActive;

            }


            // ------------------------------------------------
            // UPDATE VEHICLE
            // ------------------------------------------------

            const vehicle =
                await Vehicle.findByIdAndUpdate(

                    req.params.id,

                    updateData,

                    {

                        new: true,

                        runValidators: true

                    }

                );


            // ------------------------------------------------
            // VEHICLE NOT FOUND
            // ------------------------------------------------

            if (!vehicle) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Vehicle not found."

                });

            }


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.status(200).json({

                success: true,

                message:
                    "Vehicle updated successfully.",

                vehicle

            });

        } catch (error) {

            console.error(
                "Update vehicle error:",
                error
            );


            // ------------------------------------------------
            // DUPLICATE KEY
            // ------------------------------------------------

            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Vehicle ID or plate number already exists."

                });

            }


            // ------------------------------------------------
            // VALIDATION ERROR
            // ------------------------------------------------

            if (
                error.name ===
                "ValidationError"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid vehicle data.",

                    errors:
                        error.errors

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while updating vehicle."

            });

        }

    }
);


// ============================================================
// DELETE VEHICLE
// ============================================================
// DELETE /api/vehicles/:id
//
// Currently permanently deletes the vehicle.
//
// Later, once deliveries reference vehicles, we can change
// this to a soft delete using:
//
// isActive = false
//
// This prevents historical delivery records from losing
// their vehicle reference.
// ============================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const vehicle =
                await Vehicle.findByIdAndDelete(
                    req.params.id
                );


            // ------------------------------------------------
            // VEHICLE NOT FOUND
            // ------------------------------------------------

            if (!vehicle) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Vehicle not found."

                });

            }


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.status(200).json({

                success: true,

                message:
                    "Vehicle deleted successfully.",

                vehicle

            });

        } catch (error) {

            console.error(
                "Delete vehicle error:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    "Invalid vehicle ID."

            });

        }

    }
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
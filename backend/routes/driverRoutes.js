// ============================================================
// FLEETFLOW DRIVER ROUTES
// ============================================================

const express = require("express");

const Driver = require("../models/Driver");

const router = express.Router();


// ============================================================
// GET ALL DRIVERS
// ============================================================
// GET /api/drivers
//
// Optional query parameters:
//
// ?search=juan
// ?status=Available
//
// Examples:
//
// /api/drivers
// /api/drivers?search=juan
// /api/drivers?status=Available
// /api/drivers?search=juan&status=Available
// ============================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const {
                search,
                status
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
                        driverId: {
                            $regex:
                                searchValue,
                            $options: "i"
                        }
                    },

                    {
                        fullName: {
                            $regex:
                                searchValue,
                            $options: "i"
                        }
                    },

                    {
                        phone: {
                            $regex:
                                searchValue,
                            $options: "i"
                        }
                    },

                    {
                        licenseNumber: {
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
            // GET DRIVERS
            // ------------------------------------------------

            const drivers =
                await Driver
                    .find(query)
                    .sort({
                        createdAt: -1
                    });


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.status(200).json({

                success: true,

                count: drivers.length,

                drivers

            });

        } catch (error) {

            console.error(
                "Get drivers error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching drivers."

            });

        }

    }
);


// ============================================================
// GET SINGLE DRIVER
// ============================================================
// GET /api/drivers/:id
// ============================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const driver =
                await Driver.findById(
                    req.params.id
                );


            if (!driver) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Driver not found."

                });

            }


            return res.status(200).json({

                success: true,

                driver

            });

        } catch (error) {

            console.error(
                "Get driver error:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    "Invalid driver ID."

            });

        }

    }
);


// ============================================================
// CREATE DRIVER
// ============================================================
// POST /api/drivers
// ============================================================

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                driverId,
                fullName,
                phone,
                licenseNumber,
                licenseExpiry,
                status
            } = req.body;


            // ------------------------------------------------
            // REQUIRED FIELDS
            // ------------------------------------------------

            if (
                !driverId ||
                !fullName ||
                !phone ||
                !licenseNumber ||
                !licenseExpiry
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Driver ID, full name, phone, license number, and license expiry are required."

                });

            }


            // ------------------------------------------------
            // CHECK DRIVER ID
            // ------------------------------------------------

            const existingDriver =
                await Driver.findOne({
                    driverId:
                        driverId.trim()
                            .toUpperCase()
                });


            if (existingDriver) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A driver with this Driver ID already exists."

                });

            }


            // ------------------------------------------------
            // CHECK LICENSE NUMBER
            // ------------------------------------------------

            const existingLicense =
                await Driver.findOne({
                    licenseNumber:
                        licenseNumber
                            .trim()
                            .toUpperCase()
                });


            if (existingLicense) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A driver with this license number already exists."

                });

            }


            // ------------------------------------------------
            // CREATE DRIVER
            // ------------------------------------------------

            const driver =
                await Driver.create({

                    driverId:
                        driverId
                            .trim()
                            .toUpperCase(),

                    fullName:
                        fullName
                            .trim(),

                    phone:
                        phone
                            .trim(),

                    licenseNumber:
                        licenseNumber
                            .trim()
                            .toUpperCase(),

                    licenseExpiry:

                        new Date(
                            licenseExpiry
                        ),

                    status:
                        status || "Available"

                });


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Driver created successfully.",

                driver

            });

        } catch (error) {

            console.error(
                "Create driver error:",
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
                        "Driver ID or license number already exists."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while creating driver."

            });

        }

    }
);


// ============================================================
// UPDATE DRIVER
// ============================================================
// PUT /api/drivers/:id
// ============================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const {
                driverId,
                fullName,
                phone,
                licenseNumber,
                licenseExpiry,
                status,
                isActive
            } = req.body;


            // ------------------------------------------------
            // BUILD UPDATE
            // ------------------------------------------------

            const updateData = {};


            if (
                driverId !== undefined
            ) {

                updateData.driverId =
                    driverId
                        .trim()
                        .toUpperCase();

            }


            if (
                fullName !== undefined
            ) {

                updateData.fullName =
                    fullName.trim();

            }


            if (
                phone !== undefined
            ) {

                updateData.phone =
                    phone.trim();

            }


            if (
                licenseNumber !== undefined
            ) {

                updateData.licenseNumber =
                    licenseNumber
                        .trim()
                        .toUpperCase();

            }


            if (
                licenseExpiry !== undefined
            ) {

                updateData.licenseExpiry =
                    new Date(
                        licenseExpiry
                    );

            }


            if (
                status !== undefined
            ) {

                updateData.status =
                    status;

            }


            if (
                isActive !== undefined
            ) {

                updateData.isActive =
                    isActive;

            }


            // ------------------------------------------------
            // UPDATE
            // ------------------------------------------------

            const driver =
                await Driver.findByIdAndUpdate(

                    req.params.id,

                    updateData,

                    {
                        new: true,
                        runValidators: true
                    }

                );


            if (!driver) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Driver not found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Driver updated successfully.",

                driver

            });

        } catch (error) {

            console.error(
                "Update driver error:",
                error
            );


            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Driver ID or license number already exists."

                });

            }


            if (
                error.name ===
                "ValidationError"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid driver data.",

                    errors:
                        error.errors

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while updating driver."

            });

        }

    }
);


// ============================================================
// DELETE DRIVER
// ============================================================
// DELETE /api/drivers/:id
//
// For now this permanently deletes the driver.
// Later, we can change this to a soft delete using
// isActive = false if deliveries reference the driver.
// ============================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const driver =
                await Driver.findByIdAndDelete(
                    req.params.id
                );


            if (!driver) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Driver not found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Driver deleted successfully.",

                driver

            });

        } catch (error) {

            console.error(
                "Delete driver error:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    "Invalid driver ID."

            });

        }

    }
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
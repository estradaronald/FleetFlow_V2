// ============================================================
// FLEETFLOW CUSTOMER ROUTES
// ============================================================
//
// Customer API:
//
// GET    /api/customers
// GET    /api/customers/:id
// POST   /api/customers
// PUT    /api/customers/:id
// DELETE /api/customers/:id
//
// ============================================================

const express = require("express");

const Customer =
    require("../models/Customer");

const router =
    express.Router();


// ============================================================
// GET ALL CUSTOMERS
// ============================================================
//
// Optional query parameters:
//
// ?search=
// ?status=
//
// Examples:
//
// GET /api/customers
// GET /api/customers?search=ABC
// GET /api/customers?status=Active
//
// ============================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const {
                search,
                status
            } = req.query;


            const filter = {};


            // ====================================================
            // SEARCH
            // ====================================================

            if (search && search.trim()) {

                const searchValue =
                    search.trim();


                filter.$or = [

                    {
                        customerId: {
                            $regex: searchValue,
                            $options: "i"
                        }
                    },

                    {
                        companyName: {
                            $regex: searchValue,
                            $options: "i"
                        }
                    },

                    {
                        contactPerson: {
                            $regex: searchValue,
                            $options: "i"
                        }
                    },

                    {
                        phone: {
                            $regex: searchValue,
                            $options: "i"
                        }
                    },

                    {
                        email: {
                            $regex: searchValue,
                            $options: "i"
                        }
                    }

                ];

            }


            // ====================================================
            // STATUS FILTER
            // ====================================================

            if (status) {

                const validStatuses = [
                    "Active",
                    "Inactive"
                ];


                if (
                    !validStatuses.includes(
                        status
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid customer status."

                    });

                }


                filter.status =
                    status;

            }


            // ====================================================
            // FIND CUSTOMERS
            // ====================================================

            const customers =
                await Customer
                    .find(filter)
                    .sort({
                        createdAt: -1
                    });


            return res.status(200).json({

                success: true,

                count:
                    customers.length,

                customers

            });

        } catch (error) {

            console.error(
                "Get customers error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while retrieving customers."

            });

        }

    }
);


// ============================================================
// GET CUSTOMER BY ID
// ============================================================
//
// GET /api/customers/:id
//
// ============================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const customer =
                await Customer.findById(
                    req.params.id
                );


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer not found."

                });

            }


            return res.status(200).json({

                success: true,

                customer

            });

        } catch (error) {

            console.error(
                "Get customer error:",
                error
            );


            // Invalid MongoDB ObjectId

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid customer ID."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while retrieving customer."

            });

        }

    }
);


// ============================================================
// CREATE CUSTOMER
// ============================================================
//
// POST /api/customers
//
// Required:
//
// customerId
// companyName
// contactPerson
// phone
// email
// address
//
// Optional:
//
// status
//
// ============================================================

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                customerId,
                companyName,
                contactPerson,
                phone,
                email,
                address,
                status
            } = req.body;


            // ====================================================
            // REQUIRED FIELD VALIDATION
            // ====================================================

            if (
                !customerId ||
                !companyName ||
                !contactPerson ||
                !phone ||
                !email ||
                !address
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer ID, company name, contact person, phone, email, and address are required."

                });

            }


            // ====================================================
            // NORMALIZE VALUES
            // ====================================================

            const normalizedCustomerId =
                customerId
                    .trim()
                    .toUpperCase();


            const normalizedCompanyName =
                companyName
                    .trim();


            const normalizedContactPerson =
                contactPerson
                    .trim();


            const normalizedPhone =
                phone
                    .trim();


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const normalizedAddress =
                address
                    .trim();


            // ====================================================
            // EMAIL VALIDATION
            // ====================================================

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    normalizedEmail
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid email address."

                });

            }


            // ====================================================
            // STATUS VALIDATION
            // ====================================================

            const validStatuses = [
                "Active",
                "Inactive"
            ];


            const normalizedStatus =
                status || "Active";


            if (
                !validStatuses.includes(
                    normalizedStatus
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid customer status."

                });

            }


            // ====================================================
            // DUPLICATE CUSTOMER ID
            // ====================================================

            const existingCustomer =
                await Customer.findOne({

                    customerId:
                        normalizedCustomerId

                });


            if (existingCustomer) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Customer ID already exists."

                });

            }


            // ====================================================
            // CREATE CUSTOMER
            // ====================================================

            const customer =
                new Customer({

                    customerId:
                        normalizedCustomerId,

                    companyName:
                        normalizedCompanyName,

                    contactPerson:
                        normalizedContactPerson,

                    phone:
                        normalizedPhone,

                    email:
                        normalizedEmail,

                    address:
                        normalizedAddress,

                    status:
                        normalizedStatus,

                    isActive:
                        normalizedStatus ===
                        "Active"

                });


            await customer.save();


            return res.status(201).json({

                success: true,

                message:
                    "Customer created successfully.",

                customer

            });

        } catch (error) {

            console.error(
                "Create customer error:",
                error
            );


            // ====================================================
            // DUPLICATE KEY ERROR
            // ====================================================

            if (
                error.code === 11000
            ) {

                const duplicateField =
                    Object.keys(
                        error.keyPattern || {}
                    )[0];


                return res.status(409).json({

                    success: false,

                    message:
                        `${duplicateField || "Customer"} already exists.`

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
                        Object.values(
                            error.errors
                        )
                            .map(
                                item =>
                                    item.message
                            )
                            .join(", ")

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while creating customer."

            });

        }

    }
);


// ============================================================
// UPDATE CUSTOMER
// ============================================================
//
// PUT /api/customers/:id
//
// Supports partial updates.
//
// ============================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const {
                customerId,
                companyName,
                contactPerson,
                phone,
                email,
                address,
                status,
                isActive
            } = req.body;


            const updateData = {};


            // ====================================================
            // CUSTOMER ID
            // ====================================================

            if (
                customerId !== undefined
            ) {

                if (
                    !String(
                        customerId
                    ).trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Customer ID cannot be empty."

                    });

                }


                updateData.customerId =
                    String(
                        customerId
                    )
                        .trim()
                        .toUpperCase();

            }


            // ====================================================
            // COMPANY NAME
            // ====================================================

            if (
                companyName !== undefined
            ) {

                if (
                    !String(
                        companyName
                    ).trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Company name cannot be empty."

                    });

                }


                updateData.companyName =
                    String(
                        companyName
                    ).trim();

            }


            // ====================================================
            // CONTACT PERSON
            // ====================================================

            if (
                contactPerson !== undefined
            ) {

                if (
                    !String(
                        contactPerson
                    ).trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Contact person cannot be empty."

                    });

                }


                updateData.contactPerson =
                    String(
                        contactPerson
                    ).trim();

            }


            // ====================================================
            // PHONE
            // ====================================================

            if (
                phone !== undefined
            ) {

                if (
                    !String(
                        phone
                    ).trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Phone cannot be empty."

                    });

                }


                updateData.phone =
                    String(
                        phone
                    ).trim();

            }


            // ====================================================
            // EMAIL
            // ====================================================

            if (
                email !== undefined
            ) {

                const normalizedEmail =
                    String(
                        email
                    )
                        .trim()
                        .toLowerCase();


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(
                        normalizedEmail
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Please provide a valid email address."

                    });

                }


                updateData.email =
                    normalizedEmail;

            }


            // ====================================================
            // ADDRESS
            // ====================================================

            if (
                address !== undefined
            ) {

                if (
                    !String(
                        address
                    ).trim()
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Address cannot be empty."

                    });

                }


                updateData.address =
                    String(
                        address
                    ).trim();

            }


            // ====================================================
            // STATUS
            // ====================================================

            if (
                status !== undefined
            ) {

                const validStatuses = [
                    "Active",
                    "Inactive"
                ];


                if (
                    !validStatuses.includes(
                        status
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid customer status."

                    });

                }


                updateData.status =
                    status;


                updateData.isActive =
                    status === "Active";

            }


            // ====================================================
            // ACTIVE STATUS
            // ====================================================

            if (
                isActive !== undefined &&
                status === undefined
            ) {

                if (
                    typeof isActive !==
                    "boolean"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "isActive must be true or false."

                    });

                }


                updateData.isActive =
                    isActive;


                updateData.status =
                    isActive
                        ? "Active"
                        : "Inactive";

            }


            // ====================================================
            // CHECK CUSTOMER ID DUPLICATE
            // ====================================================

            if (
                updateData.customerId
            ) {

                const duplicate =
                    await Customer.findOne({

                        customerId:
                            updateData.customerId,

                        _id: {
                            $ne:
                                req.params.id
                        }

                    });


                if (duplicate) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "Customer ID already exists."

                    });

                }

            }


            // ====================================================
            // UPDATE
            // ====================================================

            const customer =
                await Customer.findByIdAndUpdate(

                    req.params.id,

                    updateData,

                    {
                        new: true,
                        runValidators: true
                    }

                );


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer not found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Customer updated successfully.",

                customer

            });

        } catch (error) {

            console.error(
                "Update customer error:",
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
                        "Invalid customer ID."

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
                        "Customer ID already exists."

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
                        Object.values(
                            error.errors
                        )
                            .map(
                                item =>
                                    item.message
                            )
                            .join(", ")

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while updating customer."

            });

        }

    }
);


// ============================================================
// DELETE CUSTOMER
// ============================================================
//
// DELETE /api/customers/:id
//
// ============================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const customer =
                await Customer.findByIdAndDelete(
                    req.params.id
                );


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Customer not found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Customer deleted successfully.",

                customer

            });

        } catch (error) {

            console.error(
                "Delete customer error:",
                error
            );


            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid customer ID."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Server error while deleting customer."

            });

        }

    }
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
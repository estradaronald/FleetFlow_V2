// ============================================================
// FLEETFLOW DELIVERIES
//
// Purpose:
// - Delivery management frontend
// - Load deliveries
// - Load customers
// - Load drivers
// - Load vehicles
// - Search deliveries
// - Filter deliveries
// - Create delivery
// - Edit delivery
// - Delete delivery
// - Display delivery statistics
// - Dynamically create delivery modal
// - Dynamically create delete modal
//
// Backend:
//
// GET    /api/deliveries
// GET    /api/deliveries/:id
// POST   /api/deliveries
// PUT    /api/deliveries/:id
// DELETE /api/deliveries/:id
//
// Supporting APIs:
//
// GET /api/customers
// GET /api/drivers
// GET /api/vehicles
// ============================================================


(function () {

    "use strict";


    // ========================================================
    // AUTHENTICATION GUARD
    // ========================================================

    const isLoggedIn =
        localStorage.getItem(
            "fleetflowLoggedIn"
        );

    const storedUser =
        localStorage.getItem(
            "fleetflowUser"
        );


    if (
        isLoggedIn !== "true" ||
        !storedUser
    ) {

        document.documentElement.classList.add(
            "auth-locked"
        );

        window.location.replace(
            "/pages/login.html"
        );

        return;

    }


    // ========================================================
    // API CONFIGURATION
    // ========================================================
    //
    // If FleetFlow frontend is served by Express:
    //
    //     /api/...
    //
    // If frontend is opened through Live Server:
    //
    //     http://localhost:5000/api/...
    //
    // You can also manually set:
    //
    // window.FLEETFLOW_API_BASE
    //
    // before this script if needed.
    // ========================================================

    const API_BASE =
        window.FLEETFLOW_API_BASE ||
        (
            window.location.port === "5500" ||
            window.location.port === "5501" ||
            window.location.port === "5502" ||
            window.location.port === "5503"
                ? "http://localhost:5000"
                : ""
        );


    const DELIVERIES_API =
        `${API_BASE}/api/deliveries`;

    const CUSTOMERS_API =
        `${API_BASE}/api/customers`;

    const DRIVERS_API =
        `${API_BASE}/api/drivers`;

    const VEHICLES_API =
        `${API_BASE}/api/vehicles`;


    console.log(
        "FleetFlow API Base:",
        API_BASE || "same origin"
    );


    // ========================================================
    // APPLICATION STATE
    // ========================================================

    let deliveries = [];

    let customers = [];

    let drivers = [];

    let vehicles = [];

    let editingDeliveryId = null;

    let deletingDeliveryId = null;


    // ========================================================
    // DOM ELEMENTS
    // ========================================================

    let totalDeliveries;
    let pendingDeliveries;
    let inTransitDeliveries;
    let deliveredDeliveries;

    let deliverySearch;
    let statusFilter;
    let priorityFilter;
    let refreshDeliveriesButton;

    let deliveriesTableBody;
    let loadingState;
    let emptyState;
    let errorState;
    let errorMessage;
    let resultsCount;
    let retryDeliveriesButton;

    let createDeliveryButton;
    let emptyCreateButton;

    let deliveryModal;
    let deliveryModalTitle;
    let closeDeliveryModal;
    let cancelDeliveryButton;
    let deliveryForm;
    let saveDeliveryButton;
    let deliveryFormError;

    let deliveryIdInput;
    let customerSelect;
    let driverSelect;
    let vehicleSelect;
    let pickupAddressInput;
    let deliveryAddressInput;
    let scheduledDateInput;
    let deliveryStatusSelect;
    let deliveryPrioritySelect;
    let deliveryNotesInput;

    let deleteDeliveryModal;
    let closeDeleteModal;
    let cancelDeleteButton;
    let confirmDeleteButton;
    let deleteDeliveryName;


    // ========================================================
    // INITIALIZATION
    // ========================================================

    document.addEventListener(
        "DOMContentLoaded",
        initializeDeliveries
    );


    async function initializeDeliveries() {

        console.log(
            "========================================"
        );

        console.log(
            "🚚 FLEETFLOW DELIVERIES"
        );

        console.log(
            "Initializing deliveries page..."
        );

        console.log(
            "========================================"
        );


        // ----------------------------------------------------
        // Find normal page elements
        // ----------------------------------------------------

        cachePageElements();


        // ----------------------------------------------------
        // Create modal HTML
        // ----------------------------------------------------

        createDeliveryModalHTML();

        createDeleteModalHTML();


        // ----------------------------------------------------
        // Find modal elements
        // ----------------------------------------------------

        cacheModalElements();


        // ----------------------------------------------------
        // Setup events
        // ----------------------------------------------------

        setupEventListeners();


        // ----------------------------------------------------
        // User information
        // ----------------------------------------------------

        displayTopbarUser();


        // ----------------------------------------------------
        // Initially populate empty selects
        // ----------------------------------------------------

        populateCustomerSelect();

        populateDriverSelect();

        populateVehicleSelect();


        // ----------------------------------------------------
        // Load supporting APIs
        // ----------------------------------------------------

        await loadSupportingData();


        // ----------------------------------------------------
        // Load deliveries
        // ----------------------------------------------------

        await loadDeliveries();


        console.log(
            "FleetFlow Deliveries initialized."
        );

    }


    // ========================================================
    // CACHE PAGE ELEMENTS
    // ========================================================

    function cachePageElements() {

        totalDeliveries =
            document.getElementById(
                "totalDeliveries"
            );

        pendingDeliveries =
            document.getElementById(
                "pendingDeliveries"
            );

        inTransitDeliveries =
            document.getElementById(
                "inTransitDeliveries"
            );

        deliveredDeliveries =
            document.getElementById(
                "deliveredDeliveries"
            );


        deliverySearch =
            document.getElementById(
                "deliverySearch"
            );

        statusFilter =
            document.getElementById(
                "statusFilter"
            );

        priorityFilter =
            document.getElementById(
                "priorityFilter"
            );

        refreshDeliveriesButton =
            document.getElementById(
                "refreshDeliveriesButton"
            );


        deliveriesTableBody =
            document.getElementById(
                "deliveriesTableBody"
            );

        loadingState =
            document.getElementById(
                "loadingState"
            );

        emptyState =
            document.getElementById(
                "emptyState"
            );

        errorState =
            document.getElementById(
                "errorState"
            );

        errorMessage =
            document.getElementById(
                "errorMessage"
            );

        resultsCount =
            document.getElementById(
                "resultsCount"
            );

        retryDeliveriesButton =
            document.getElementById(
                "retryDeliveriesButton"
            );


        createDeliveryButton =
            document.getElementById(
                "createDeliveryButton"
            );

        emptyCreateButton =
            document.getElementById(
                "emptyCreateButton"
            );

    }


    // ========================================================
    // CREATE DELIVERY MODAL HTML
    // ========================================================

    function createDeliveryModalHTML() {

        if (
            document.getElementById(
                "deliveryModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "deliveryModal";

        modal.className =
            "modal-overlay";

        modal.hidden =
            true;


        modal.innerHTML = `

            <div
                class="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="deliveryModalTitle"
            >

                <!-- ======================================
                     MODAL HEADER
                     ====================================== -->

                <div class="modal-header">

                    <div>

                        <span class="modal-eyebrow">
                            DELIVERY MANAGEMENT
                        </span>

                        <h2 id="deliveryModalTitle">
                            Create Delivery
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="modal-close"
                        id="closeDeliveryModal"
                        aria-label="Close modal"
                    >
                        ×
                    </button>

                </div>


                <!-- ======================================
                     FORM
                     ====================================== -->

                <form
                    id="deliveryForm"
                    novalidate
                >

                    <!-- ==================================
                         BASIC INFORMATION
                         ================================== -->

                    <section class="form-section">

                        <h3 class="form-section-title">
                            Delivery Information
                        </h3>


                        <div class="form-grid">


                            <!-- DELIVERY ID -->

                            <div class="form-group">

                                <label for="deliveryId">

                                    Delivery ID

                                    <span>*</span>

                                </label>

                                <input
                                    type="text"
                                    id="deliveryId"
                                    name="deliveryId"
                                    placeholder="DEL-001"
                                    maxlength="20"
                                    autocomplete="off"
                                    required
                                >

                            </div>


                            <!-- CUSTOMER -->

                            <div class="form-group">

                                <label for="customerSelect">

                                    Customer

                                    <span>*</span>

                                </label>

                                <select
                                    id="customerSelect"
                                    name="customer"
                                    required
                                >

                                    <option value="">
                                        Select customer
                                    </option>

                                </select>

                            </div>


                            <!-- DRIVER -->

                            <div class="form-group">

                                <label for="driverSelect">
                                    Driver
                                </label>

                                <select
                                    id="driverSelect"
                                    name="driver"
                                >

                                    <option value="">
                                        Unassigned
                                    </option>

                                </select>

                            </div>


                            <!-- VEHICLE -->

                            <div class="form-group">

                                <label for="vehicleSelect">
                                    Vehicle
                                </label>

                                <select
                                    id="vehicleSelect"
                                    name="vehicle"
                                >

                                    <option value="">
                                        Unassigned
                                    </option>

                                </select>

                            </div>


                        </div>

                    </section>


                    <!-- ==================================
                         DELIVERY ROUTE
                         ================================== -->

                    <section class="form-section">

                        <h3 class="form-section-title">
                            Delivery Route
                        </h3>


                        <div class="form-grid">


                            <!-- PICKUP -->

                            <div class="form-group form-group-full">

                                <label for="pickupAddress">

                                    Pickup Address

                                    <span>*</span>

                                </label>

                                <input
                                    type="text"
                                    id="pickupAddress"
                                    name="pickupAddress"
                                    placeholder="Enter pickup location"
                                    maxlength="250"
                                    required
                                >

                            </div>


                            <!-- DESTINATION -->

                            <div class="form-group form-group-full">

                                <label for="deliveryAddress">

                                    Delivery Address

                                    <span>*</span>

                                </label>

                                <input
                                    type="text"
                                    id="deliveryAddress"
                                    name="deliveryAddress"
                                    placeholder="Enter destination"
                                    maxlength="250"
                                    required
                                >

                            </div>


                        </div>

                    </section>


                    <!-- ==================================
                         SCHEDULE & STATUS
                         ================================== -->

                    <section class="form-section">

                        <h3 class="form-section-title">
                            Schedule & Status
                        </h3>


                        <div class="form-grid">


                            <!-- DATE -->

                            <div class="form-group">

                                <label for="scheduledDate">

                                    Scheduled Date

                                    <span>*</span>

                                </label>

                                <input
                                    type="datetime-local"
                                    id="scheduledDate"
                                    name="scheduledDate"
                                    required
                                >

                            </div>


                            <!-- STATUS -->

                            <div class="form-group">

                                <label for="deliveryStatus">
                                    Status
                                </label>

                                <select
                                    id="deliveryStatus"
                                    name="status"
                                >

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Assigned">
                                        Assigned
                                    </option>

                                    <option value="In Transit">
                                        In Transit
                                    </option>

                                    <option value="Delivered">
                                        Delivered
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </div>


                            <!-- PRIORITY -->

                            <div class="form-group">

                                <label for="deliveryPriority">
                                    Priority
                                </label>

                                <select
                                    id="deliveryPriority"
                                    name="priority"
                                >

                                    <option value="Normal">
                                        Normal
                                    </option>

                                    <option value="High">
                                        High
                                    </option>

                                    <option value="Urgent">
                                        Urgent
                                    </option>

                                </select>

                            </div>


                        </div>

                    </section>


                    <!-- ==================================
                         ADDITIONAL INFORMATION
                         ================================== -->

                    <section class="form-section">

                        <h3 class="form-section-title">
                            Additional Information
                        </h3>


                        <div class="form-grid">


                            <div class="form-group form-group-full">

                                <label for="deliveryNotes">
                                    Notes
                                </label>

                                <textarea
                                    id="deliveryNotes"
                                    name="notes"
                                    maxlength="500"
                                    placeholder="Optional delivery notes..."
                                ></textarea>

                            </div>


                        </div>

                    </section>


                    <!-- ==================================
                         FORM ERROR
                         ================================== -->

                    <div
                        class="form-error"
                        id="deliveryFormError"
                        hidden
                    ></div>


                    <!-- ==================================
                         MODAL FOOTER
                         ================================== -->

                    <div class="modal-footer">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancelDeliveryButton"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            class="primary-button"
                            id="saveDeliveryButton"
                        >

                            <span class="button-icon">
                                ✓
                            </span>

                            Save Delivery

                        </button>

                    </div>

                </form>

            </div>

        `;


        document.body.appendChild(
            modal
        );

    }


    // ========================================================
    // CREATE DELETE MODAL HTML
    // ========================================================

    function createDeleteModalHTML() {

        if (
            document.getElementById(
                "deleteDeliveryModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "deleteDeliveryModal";

        modal.className =
            "modal-overlay";

        modal.hidden =
            true;


        modal.innerHTML = `

            <div
                class="modal modal-small"
                role="dialog"
                aria-modal="true"
                aria-labelledby="deleteDeliveryTitle"
            >

                <div class="modal-header">

                    <div>

                        <span class="modal-eyebrow">
                            DELIVERY MANAGEMENT
                        </span>

                        <h2 id="deleteDeliveryTitle">
                            Delete Delivery
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="modal-close"
                        id="closeDeleteModal"
                        aria-label="Close delete dialog"
                    >
                        ×
                    </button>

                </div>


                <div class="delete-content">

                    <div class="delete-icon">
                        ×
                    </div>


                    <h3>
                        Delete this delivery?
                    </h3>


                    <p>
                        This action cannot be undone.
                    </p>


                    <strong
                        id="deleteDeliveryName"
                    >
                        Delivery
                    </strong>

                </div>


                <div class="modal-footer">

                    <button
                        type="button"
                        class="secondary-button"
                        id="cancelDeleteButton"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        class="danger-button"
                        id="confirmDeleteButton"
                    >
                        Delete Delivery
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );

    }


    // ========================================================
    // CACHE MODAL ELEMENTS
    // ========================================================

    function cacheModalElements() {

        deliveryModal =
            document.getElementById(
                "deliveryModal"
            );

        deliveryModalTitle =
            document.getElementById(
                "deliveryModalTitle"
            );

        closeDeliveryModal =
            document.getElementById(
                "closeDeliveryModal"
            );

        cancelDeliveryButton =
            document.getElementById(
                "cancelDeliveryButton"
            );

        deliveryForm =
            document.getElementById(
                "deliveryForm"
            );

        saveDeliveryButton =
            document.getElementById(
                "saveDeliveryButton"
            );

        deliveryFormError =
            document.getElementById(
                "deliveryFormError"
            );


        deliveryIdInput =
            document.getElementById(
                "deliveryId"
            );

        customerSelect =
            document.getElementById(
                "customerSelect"
            );

        driverSelect =
            document.getElementById(
                "driverSelect"
            );

        vehicleSelect =
            document.getElementById(
                "vehicleSelect"
            );

        pickupAddressInput =
            document.getElementById(
                "pickupAddress"
            );

        deliveryAddressInput =
            document.getElementById(
                "deliveryAddress"
            );

        scheduledDateInput =
            document.getElementById(
                "scheduledDate"
            );

        deliveryStatusSelect =
            document.getElementById(
                "deliveryStatus"
            );

        deliveryPrioritySelect =
            document.getElementById(
                "deliveryPriority"
            );

        deliveryNotesInput =
            document.getElementById(
                "deliveryNotes"
            );


        deleteDeliveryModal =
            document.getElementById(
                "deleteDeliveryModal"
            );

        closeDeleteModal =
            document.getElementById(
                "closeDeleteModal"
            );

        cancelDeleteButton =
            document.getElementById(
                "cancelDeleteButton"
            );

        confirmDeleteButton =
            document.getElementById(
                "confirmDeleteButton"
            );

        deleteDeliveryName =
            document.getElementById(
                "deleteDeliveryName"
            );

    }


    // ========================================================
    // EVENT LISTENERS
    // ========================================================

    function setupEventListeners() {


        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        if (
            createDeliveryButton
        ) {

            createDeliveryButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    openCreateModal();

                }
            );

        }


        // ----------------------------------------------------
        // EMPTY CREATE
        // ----------------------------------------------------

        if (
            emptyCreateButton
        ) {

            emptyCreateButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openCreateModal();

                }
            );

        }


        // ----------------------------------------------------
        // SEARCH
        // ----------------------------------------------------

        if (
            deliverySearch
        ) {

            let searchTimer = null;


            deliverySearch.addEventListener(
                "input",
                function () {

                    clearTimeout(
                        searchTimer
                    );


                    searchTimer =
                        setTimeout(
                            loadDeliveries,
                            300
                        );

                }
            );

        }


        // ----------------------------------------------------
        // STATUS FILTER
        // ----------------------------------------------------

        if (
            statusFilter
        ) {

            statusFilter.addEventListener(
                "change",
                loadDeliveries
            );

        }


        // ----------------------------------------------------
        // PRIORITY FILTER
        // ----------------------------------------------------

        if (
            priorityFilter
        ) {

            priorityFilter.addEventListener(
                "change",
                loadDeliveries
            );

        }


        // ----------------------------------------------------
        // REFRESH
        // ----------------------------------------------------

        if (
            refreshDeliveriesButton
        ) {

            refreshDeliveriesButton.addEventListener(
                "click",
                async function () {

                    refreshDeliveriesButton.disabled =
                        true;


                    try {

                        await Promise.all([
                            loadSupportingData(),
                            loadDeliveries()
                        ]);

                    } finally {

                        refreshDeliveriesButton.disabled =
                            false;

                    }

                }
            );

        }


        // ----------------------------------------------------
        // RETRY
        // ----------------------------------------------------

        if (
            retryDeliveriesButton
        ) {

            retryDeliveriesButton.addEventListener(
                "click",
                loadDeliveries
            );

        }


        // ----------------------------------------------------
        // CLOSE DELIVERY MODAL
        // ----------------------------------------------------

        if (
            closeDeliveryModal
        ) {

            closeDeliveryModal.addEventListener(
                "click",
                closeDeliveryFormModal
            );

        }


        if (
            cancelDeliveryButton
        ) {

            cancelDeliveryButton.addEventListener(
                "click",
                closeDeliveryFormModal
            );

        }


        // ----------------------------------------------------
        // FORM SUBMIT
        // ----------------------------------------------------

        if (
            deliveryForm
        ) {

            deliveryForm.addEventListener(
                "submit",
                handleDeliverySubmit
            );

        }


        // ----------------------------------------------------
        // CLOSE DELETE
        // ----------------------------------------------------

        if (
            closeDeleteModal
        ) {

            closeDeleteModal.addEventListener(
                "click",
                closeDeleteConfirmation
            );

        }


        if (
            cancelDeleteButton
        ) {

            cancelDeleteButton.addEventListener(
                "click",
                closeDeleteConfirmation
            );

        }


        if (
            confirmDeleteButton
        ) {

            confirmDeleteButton.addEventListener(
                "click",
                confirmDelete
            );

        }


        // ----------------------------------------------------
        // DELIVERY MODAL OVERLAY
        // ----------------------------------------------------

        if (
            deliveryModal
        ) {

            deliveryModal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        deliveryModal
                    ) {

                        closeDeliveryFormModal();

                    }

                }
            );

        }


        // ----------------------------------------------------
        // DELETE MODAL OVERLAY
        // ----------------------------------------------------

        if (
            deleteDeliveryModal
        ) {

            deleteDeliveryModal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        deleteDeliveryModal
                    ) {

                        closeDeleteConfirmation();

                    }

                }
            );

        }


        // ----------------------------------------------------
        // ESCAPE
        // ----------------------------------------------------

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;

                }


                if (
                    deliveryModal &&
                    !deliveryModal.hidden
                ) {

                    closeDeliveryFormModal();

                }


                if (
                    deleteDeliveryModal &&
                    !deleteDeliveryModal.hidden
                ) {

                    closeDeleteConfirmation();

                }

            }
        );

    }


    // ========================================================
    // LOAD SUPPORTING DATA
    // ========================================================

    async function loadSupportingData() {

        console.log(
            "Loading customers, drivers and vehicles..."
        );


        /*
         * IMPORTANT:
         *
         * Use Promise.allSettled so one failed API
         * does not stop the other two.
         */

        const results =
            await Promise.allSettled([
                loadCustomers(),
                loadDrivers(),
                loadVehicles()
            ]);


        console.log(
            "Supporting API results:",
            results
        );

    }


    // ========================================================
    // LOAD CUSTOMERS
    // ========================================================

    async function loadCustomers() {

        try {

            console.log(
                "Fetching customers:",
                CUSTOMERS_API
            );


            const response =
                await fetchWithTimeout(
                    CUSTOMERS_API
                );


            const result =
                await parseJsonResponse(
                    response
                );


            console.log(
                "Customers API response:",
                result
            );


            if (
                !response.ok
            ) {

                throw new Error(
                    result.message ||
                    `HTTP ${response.status}`
                );

            }


            customers =
                extractApiArray(
                    result,
                    [
                        "customers",
                        "data"
                    ]
                );


            console.log(
                `Customers loaded: ${customers.length}`
            );


            populateCustomerSelect();


            return customers;


        } catch (error) {

            console.error(
                "Customers loading failed:",
                error
            );


            customers = [];


            populateCustomerSelect();


            return [];

        }

    }


    // ========================================================
    // LOAD DRIVERS
    // ========================================================

    async function loadDrivers() {

        try {

            console.log(
                "Fetching drivers:",
                DRIVERS_API
            );


            const response =
                await fetchWithTimeout(
                    DRIVERS_API
                );


            const result =
                await parseJsonResponse(
                    response
                );


            console.log(
                "Drivers API response:",
                result
            );


            if (
                !response.ok
            ) {

                throw new Error(
                    result.message ||
                    `HTTP ${response.status}`
                );

            }


            drivers =
                extractApiArray(
                    result,
                    [
                        "drivers",
                        "data"
                    ]
                );


            console.log(
                `Drivers loaded: ${drivers.length}`
            );


            populateDriverSelect();


            return drivers;


        } catch (error) {

            console.error(
                "Drivers loading failed:",
                error
            );


            drivers = [];


            populateDriverSelect();


            return [];

        }

    }


    // ========================================================
    // LOAD VEHICLES
    // ========================================================

    async function loadVehicles() {

        try {

            console.log(
                "Fetching vehicles:",
                VEHICLES_API
            );


            const response =
                await fetchWithTimeout(
                    VEHICLES_API
                );


            const result =
                await parseJsonResponse(
                    response
                );


            console.log(
                "Vehicles API response:",
                result
            );


            if (
                !response.ok
            ) {

                throw new Error(
                    result.message ||
                    `HTTP ${response.status}`
                );

            }


            vehicles =
                extractApiArray(
                    result,
                    [
                        "vehicles",
                        "data"
                    ]
                );


            console.log(
                `Vehicles loaded: ${vehicles.length}`
            );


            populateVehicleSelect();


            return vehicles;


        } catch (error) {

            console.error(
                "Vehicles loading failed:",
                error
            );


            vehicles = [];


            populateVehicleSelect();


            return [];

        }

    }


    // ========================================================
    // EXTRACT API ARRAY
    // ========================================================

    function extractApiArray(
        result,
        preferredKeys = []
    ) {

        if (
            Array.isArray(result)
        ) {

            return result;

        }


        if (
            !result ||
            typeof result !== "object"
        ) {

            return [];

        }


        // ----------------------------------------------------
        // Preferred named keys
        // ----------------------------------------------------

        for (
            const key of preferredKeys
        ) {

            if (
                Array.isArray(
                    result[key]
                )
            ) {

                return result[key];

            }

        }


        // ----------------------------------------------------
        // Common "data"
        // ----------------------------------------------------

        if (
            Array.isArray(
                result.data
            )
        ) {

            return result.data;

        }


        // ----------------------------------------------------
        // Nested data
        // ----------------------------------------------------

        if (
            result.data &&
            typeof result.data ===
            "object"
        ) {

            for (
                const key of preferredKeys
            ) {

                if (
                    Array.isArray(
                        result.data[key]
                    )
                ) {

                    return result.data[key];

                }

            }


            if (
                Array.isArray(
                    result.data.items
                )
            ) {

                return result.data.items;

            }


            if (
                Array.isArray(
                    result.data.results
                )
            ) {

                return result.data.results;

            }

        }


        // ----------------------------------------------------
        // Common result keys
        // ----------------------------------------------------

        if (
            Array.isArray(
                result.items
            )
        ) {

            return result.items;

        }


        if (
            Array.isArray(
                result.results
            )
        ) {

            return result.results;

        }


        console.warn(
            "No array found in API response:",
            result
        );


        return [];

    }


    // ========================================================
    // LOAD DELIVERIES
    // ========================================================

    async function loadDeliveries() {

        showLoadingState();


        try {

            const params =
                new URLSearchParams();


            const search =
                deliverySearch
                    ? deliverySearch.value.trim()
                    : "";


            const status =
                statusFilter
                    ? statusFilter.value
                    : "all";


            const priority =
                priorityFilter
                    ? priorityFilter.value
                    : "all";


            if (
                search
            ) {

                params.set(
                    "search",
                    search
                );

            }


            if (
                status &&
                status !== "all"
            ) {

                params.set(
                    "status",
                    status
                );

            }


            if (
                priority &&
                priority !== "all"
            ) {

                params.set(
                    "priority",
                    priority
                );

            }


            const query =
                params.toString();


            const url =
                query
                    ? `${DELIVERIES_API}?${query}`
                    : DELIVERIES_API;


            console.log(
                "Fetching deliveries:",
                url
            );


            const response =
                await fetchWithTimeout(
                    url
                );


            const result =
                await parseJsonResponse(
                    response
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    result.message ||
                    `HTTP ${response.status}`
                );

            }


            deliveries =
                extractApiArray(
                    result,
                    [
                        "deliveries",
                        "data"
                    ]
                );


            updateSummary();

            renderDeliveries();


        } catch (error) {

            console.error(
                "Deliveries loading failed:",
                error
            );


            showErrorState(
                error.message ||
                "Unable to load deliveries."
            );

        }

    }


    // ========================================================
    // RENDER DELIVERIES
    // ========================================================

    function renderDeliveries() {

        hideAllTableStates();


        if (
            deliveriesTableBody
        ) {

            deliveriesTableBody.innerHTML =
                "";

        }


        if (
            !deliveries.length
        ) {

            if (
                emptyState
            ) {

                emptyState.hidden =
                    false;

            }


            if (
                resultsCount
            ) {

                resultsCount.textContent =
                    "Showing 0 deliveries";

            }


            return;

        }


        deliveries.forEach(
            function (delivery) {

                const row =
                    createDeliveryRow(
                        delivery
                    );


                deliveriesTableBody?.appendChild(
                    row
                );

            }
        );


        if (
            resultsCount
        ) {

            resultsCount.textContent =
                `Showing ${deliveries.length} ${
                    deliveries.length === 1
                        ? "delivery"
                        : "deliveries"
                }`;

        }

    }


    // ========================================================
    // CREATE DELIVERY ROW
    // ========================================================

    function createDeliveryRow(
        delivery
    ) {

        const row =
            document.createElement(
                "tr"
            );


        const customer =
            normalizeReference(
                delivery.customer
            );


        const driver =
            normalizeReference(
                delivery.driver
            );


        const vehicle =
            normalizeReference(
                delivery.vehicle
            );


        const formattedDate =
            formatDateTime(
                delivery.scheduledDate
            );


        const status =
            delivery.status ||
            "Pending";


        const priority =
            delivery.priority ||
            "Normal";


        row.innerHTML = `

            <td>

                <span class="delivery-id">

                    ${escapeHtml(
                        delivery.deliveryId ||
                        "—"
                    )}

                </span>

            </td>


            <td>

                <div class="customer-cell">

                    <span class="customer-name">

                        ${escapeHtml(
                            customer.companyName ||
                            "Unknown Customer"
                        )}

                    </span>

                    <span class="customer-subtext">

                        ${escapeHtml(
                            customer.customerId ||
                            "—"
                        )}

                    </span>

                </div>

            </td>


            <td>

                <div class="route-cell">

                    <div
                        class="route-point"
                        title="${escapeHtml(
                            delivery.pickupAddress ||
                            ""
                        )}"
                    >

                        ${escapeHtml(
                            delivery.pickupAddress ||
                            "No pickup address"
                        )}

                    </div>


                    <div class="route-arrow">
                        ↓
                    </div>


                    <div
                        class="route-point destination"
                        title="${escapeHtml(
                            delivery.deliveryAddress ||
                            ""
                        )}"
                    >

                        ${escapeHtml(
                            delivery.deliveryAddress ||
                            "No destination"
                        )}

                    </div>

                </div>

            </td>


            <td>

                <div class="driver-cell">

                    <span class="driver-name">

                        ${escapeHtml(
                            driver.fullName ||
                            "Unassigned"
                        )}

                    </span>


                    <span class="driver-subtext">

                        ${escapeHtml(
                            driver.driverId ||
                            "—"
                        )}

                    </span>

                </div>

            </td>


            <td>

                <div class="vehicle-cell">

                    <span class="vehicle-number">

                        ${escapeHtml(
                            vehicle.plateNumber ||
                            "Unassigned"
                        )}

                    </span>


                    ${
                        vehicle.vehicleType
                            ? `
                                <span class="vehicle-type">
                                    ${escapeHtml(
                                        vehicle.vehicleType
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>

            </td>


            <td>

                <div class="delivery-date">

                    <span>

                        ${escapeHtml(
                            formattedDate.date
                        )}

                    </span>


                    <span class="delivery-time">

                        ${escapeHtml(
                            formattedDate.time
                        )}

                    </span>

                </div>

            </td>


            <td>

                <span
                    class="
                        priority-badge
                        ${getPriorityClass(
                            priority
                        )}
                    "
                >

                    ${escapeHtml(
                        priority
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        status-badge
                        ${getStatusClass(
                            status
                        )}
                    "
                >

                    ${escapeHtml(
                        status
                    )}

                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="action-button"
                        title="Edit delivery"
                        data-action="edit"
                    >
                        ✎
                    </button>


                    <button
                        type="button"
                        class="action-button delete"
                        title="Delete delivery"
                        data-action="delete"
                    >
                        ×
                    </button>

                </div>

            </td>

        `;


        const editButton =
            row.querySelector(
                '[data-action="edit"]'
            );


        const deleteButton =
            row.querySelector(
                '[data-action="delete"]'
            );


        editButton?.addEventListener(
            "click",
            function () {

                openEditModal(
                    delivery._id
                );

            }
        );


        deleteButton?.addEventListener(
            "click",
            function () {

                openDeleteConfirmation(
                    delivery
                );

            }
        );


        return row;

    }


    // ========================================================
    // NORMALIZE REFERENCE
    // ========================================================

    function normalizeReference(
        reference
    ) {

        if (
            !reference
        ) {

            return {};

        }


        if (
            typeof reference ===
            "string"
        ) {

            return {
                _id: reference
            };

        }


        return reference;

    }


    // ========================================================
    // UPDATE SUMMARY
    // ========================================================

    function updateSummary() {

        const total =
            deliveries.length;


        const pending =
            deliveries.filter(
                delivery =>
                    delivery.status ===
                    "Pending"
            ).length;


        const inTransit =
            deliveries.filter(
                delivery =>
                    delivery.status ===
                    "In Transit"
            ).length;


        const delivered =
            deliveries.filter(
                delivery =>
                    delivery.status ===
                    "Delivered"
            ).length;


        if (
            totalDeliveries
        ) {

            totalDeliveries.textContent =
                total;

        }


        if (
            pendingDeliveries
        ) {

            pendingDeliveries.textContent =
                pending;

        }


        if (
            inTransitDeliveries
        ) {

            inTransitDeliveries.textContent =
                inTransit;

        }


        if (
            deliveredDeliveries
        ) {

            deliveredDeliveries.textContent =
                delivered;

        }

    }


    // ========================================================
    // POPULATE CUSTOMER SELECT
    // ========================================================

    function populateCustomerSelect(
        selectedId = ""
    ) {

        if (
            !customerSelect
        ) {

            return;

        }


        customerSelect.innerHTML = `

            <option value="">
                Select customer
            </option>

        `;


        if (
            !customers.length
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "No customers available";


            option.disabled =
                true;


            customerSelect.appendChild(
                option
            );


            return;

        }


        customers.forEach(
            function (customer) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    customer._id;


                option.textContent =
                    `${customer.customerId || ""} — ${
                        customer.companyName ||
                        customer.contactPerson ||
                        "Customer"
                    }`;


                if (
                    String(
                        customer._id
                    ) ===
                    String(
                        selectedId
                    )
                ) {

                    option.selected =
                        true;

                }


                customerSelect.appendChild(
                    option
                );

            }
        );

    }


    // ========================================================
    // POPULATE DRIVER SELECT
    // ========================================================

    function populateDriverSelect(
        selectedId = ""
    ) {

        if (
            !driverSelect
        ) {

            return;

        }


        driverSelect.innerHTML = `

            <option value="">
                Unassigned
            </option>

        `;


        if (
            !drivers.length
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "No drivers available";


            option.disabled =
                true;


            driverSelect.appendChild(
                option
            );


            return;

        }


        drivers.forEach(
            function (driver) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    driver._id;


                option.textContent =
                    `${driver.driverId || ""} — ${
                        driver.fullName ||
                        "Driver"
                    }`;


                if (
                    String(
                        driver._id
                    ) ===
                    String(
                        selectedId
                    )
                ) {

                    option.selected =
                        true;

                }


                driverSelect.appendChild(
                    option
                );

            }
        );

    }


    // ========================================================
    // POPULATE VEHICLE SELECT
    // ========================================================

    function populateVehicleSelect(
        selectedId = ""
    ) {

        if (
            !vehicleSelect
        ) {

            return;

        }


        vehicleSelect.innerHTML = `

            <option value="">
                Unassigned
            </option>

        `;


        if (
            !vehicles.length
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "No vehicles available";


            option.disabled =
                true;


            vehicleSelect.appendChild(
                option
            );


            return;

        }


        vehicles.forEach(
            function (vehicle) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    vehicle._id;


                option.textContent =
                    `${vehicle.vehicleId || ""} — ${
                        vehicle.plateNumber ||
                        vehicle.makeModel ||
                        "Vehicle"
                    }`;


                if (
                    String(
                        vehicle._id
                    ) ===
                    String(
                        selectedId
                    )
                ) {

                    option.selected =
                        true;

                }


                vehicleSelect.appendChild(
                    option
                );

            }
        );

    }


    // ========================================================
    // OPEN CREATE MODAL
    // ========================================================

    function openCreateModal() {

        console.log(
            "Opening Create Delivery modal..."
        );


        if (
            !deliveryModal
        ) {

            console.error(
                "Delivery modal does not exist."
            );

            return;

        }


        editingDeliveryId =
            null;


        if (
            deliveryModalTitle
        ) {

            deliveryModalTitle.textContent =
                "Create Delivery";

        }


        if (
            deliveryForm
        ) {

            deliveryForm.reset();

        }


        populateCustomerSelect();

        populateDriverSelect();

        populateVehicleSelect();


        if (
            deliveryStatusSelect
        ) {

            deliveryStatusSelect.value =
                "Pending";

        }


        if (
            deliveryPrioritySelect
        ) {

            deliveryPrioritySelect.value =
                "Normal";

        }


        if (
            deliveryIdInput
        ) {

            deliveryIdInput.value =
                generateNextDeliveryId();

            deliveryIdInput.disabled =
                false;

        }


        if (
            deliveryFormError
        ) {

            deliveryFormError.hidden =
                true;

            deliveryFormError.textContent =
                "";

        }


        if (
            saveDeliveryButton
        ) {

            saveDeliveryButton.disabled =
                false;

            saveDeliveryButton.innerHTML = `

                <span class="button-icon">
                    ✓
                </span>

                Save Delivery

            `;

        }


        deliveryModal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );


        setTimeout(
            function () {

                customerSelect?.focus();

            },
            50
        );

    }


    // ========================================================
    // GENERATE NEXT DELIVERY ID
    // ========================================================

    function generateNextDeliveryId() {

        let highest =
            0;


        deliveries.forEach(
            function (delivery) {

                const id =
                    String(
                        delivery.deliveryId ||
                        ""
                    );


                const match =
                    id.match(
                        /(\d+)$/
                    );


                if (
                    match
                ) {

                    highest =
                        Math.max(
                            highest,
                            Number(
                                match[1]
                            )
                        );

                }

            }
        );


        return `DEL-${String(
            highest + 1
        ).padStart(
            3,
            "0"
        )}`;

    }


    // ========================================================
    // OPEN EDIT MODAL
    // ========================================================

    async function openEditModal(
        id
    ) {

        if (
            !id
        ) {

            return;

        }


        try {

            const response =
                await fetchWithTimeout(
                    `${DELIVERIES_API}/${id}`
                );


            const result =
                await parseJsonResponse(
                    response
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    result.message ||
                    "Failed to load delivery."
                );

            }


            const delivery =
                result.data ||
                result.delivery ||
                result;


            editingDeliveryId =
                delivery._id ||
                id;


            deliveryModalTitle.textContent =
                "Edit Delivery";


            deliveryIdInput.value =
                delivery.deliveryId ||
                "";


            deliveryIdInput.disabled =
                false;


            const customer =
                normalizeReference(
                    delivery.customer
                );


            const driver =
                normalizeReference(
                    delivery.driver
                );


            const vehicle =
                normalizeReference(
                    delivery.vehicle
                );


            populateCustomerSelect(
                customer._id ||
                customer
            );


            populateDriverSelect(
                driver._id ||
                driver
            );


            populateVehicleSelect(
                vehicle._id ||
                vehicle
            );


            pickupAddressInput.value =
                delivery.pickupAddress ||
                "";


            deliveryAddressInput.value =
                delivery.deliveryAddress ||
                "";


            scheduledDateInput.value =
                formatDateForInput(
                    delivery.scheduledDate
                );


            deliveryStatusSelect.value =
                delivery.status ||
                "Pending";


            deliveryPrioritySelect.value =
                delivery.priority ||
                "Normal";


            deliveryNotesInput.value =
                delivery.notes ||
                "";


            clearFormError();


            saveDeliveryButton.innerHTML = `

                <span class="button-icon">
                    ✓
                </span>

                Update Delivery

            `;


            deliveryModal.hidden =
                false;


            document.body.classList.add(
                "modal-open"
            );


        } catch (error) {

            console.error(
                "Edit delivery error:",
                error
            );


            showToast(
                error.message ||
                "Unable to load delivery.",
                "error"
            );

        }

    }


    // ========================================================
    // CLOSE DELIVERY MODAL
    // ========================================================

    function closeDeliveryFormModal() {

        if (
            deliveryModal
        ) {

            deliveryModal.hidden =
                true;

        }


        document.body.classList.remove(
            "modal-open"
        );


        editingDeliveryId =
            null;


        clearFormError();

    }


    // ========================================================
    // HANDLE DELIVERY SUBMIT
    // ========================================================

    async function handleDeliverySubmit(
        event
    ) {

        event.preventDefault();


        clearFormError();


        const isEditing =
            Boolean(
                editingDeliveryId
            );


        const payload = {

            deliveryId:
                deliveryIdInput.value.trim(),

            customer:
                customerSelect.value,

            driver:
                driverSelect.value
                    ? driverSelect.value
                    : null,

            vehicle:
                vehicleSelect.value
                    ? vehicleSelect.value
                    : null,

            pickupAddress:
                pickupAddressInput.value.trim(),

            deliveryAddress:
                deliveryAddressInput.value.trim(),

            scheduledDate:
                scheduledDateInput.value,

            status:
                deliveryStatusSelect.value,

            priority:
                deliveryPrioritySelect.value,

            notes:
                deliveryNotesInput.value.trim()

        };


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !payload.deliveryId
        ) {

            showFormError(
                "Delivery ID is required."
            );

            deliveryIdInput.focus();

            return;

        }


        if (
            !payload.customer
        ) {

            showFormError(
                "Please select a customer."
            );

            customerSelect.focus();

            return;

        }


        if (
            !payload.pickupAddress
        ) {

            showFormError(
                "Pickup address is required."
            );

            pickupAddressInput.focus();

            return;

        }


        if (
            !payload.deliveryAddress
        ) {

            showFormError(
                "Delivery address is required."
            );

            deliveryAddressInput.focus();

            return;

        }


        if (
            !payload.scheduledDate
        ) {

            showFormError(
                "Scheduled date is required."
            );

            scheduledDateInput.focus();

            return;

        }


        // ----------------------------------------------------
        // SAVE BUTTON
        // ----------------------------------------------------

        saveDeliveryButton.disabled =
            true;


        saveDeliveryButton.textContent =
            isEditing
                ? "Updating..."
                : "Saving...";


        try {

            const url =
                isEditing
                    ? `${DELIVERIES_API}/${editingDeliveryId}`
                    : DELIVERIES_API;


            const method =
                isEditing
                    ? "PUT"
                    : "POST";


            const response =
                await fetchWithTimeout(
                    url,
                    {
                        method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            const result =
                await parseJsonResponse(
                    response
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    result.message ||
                    `Failed to save delivery. HTTP ${response.status}`
                );

            }


            closeDeliveryFormModal();


            showToast(
                isEditing
                    ? "Delivery updated successfully."
                    : "Delivery created successfully.",
                "success"
            );


            await loadDeliveries();

        } catch (error) {

            console.error(
                "Save delivery error:",
                error
            );


            showFormError(
                error.message ||
                "Unable to save delivery."
            );

        } finally {

            saveDeliveryButton.disabled =
                false;


            saveDeliveryButton.innerHTML =
                isEditing
                    ? `
                        <span class="button-icon">
                            ✓
                        </span>
                        Update Delivery
                      `
                    : `
                        <span class="button-icon">
                            ✓
                        </span>
                        Save Delivery
                      `;

        }

    }


    // ========================================================
    // OPEN DELETE CONFIRMATION
    // ========================================================

    function openDeleteConfirmation(
        delivery
    ) {

        if (
            !deleteDeliveryModal
        ) {

            return;

        }


        deletingDeliveryId =
            delivery._id;


        deleteDeliveryName.textContent =
            delivery.deliveryId ||
            "Delivery";


        deleteDeliveryModal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );

    }


    // ========================================================
    // CLOSE DELETE CONFIRMATION
    // ========================================================

    function closeDeleteConfirmation() {

        if (
            deleteDeliveryModal
        ) {

            deleteDeliveryModal.hidden =
                true;

        }


        document.body.classList.remove(
            "modal-open"
        );


        deletingDeliveryId =
            null;

    }


    // ========================================================
    // CONFIRM DELETE
    // ========================================================

    async function confirmDelete() {

        if (
            !deletingDeliveryId
        ) {

            return;

        }


        confirmDeleteButton.disabled =
            true;


        confirmDeleteButton.textContent =
            "Deleting...";


        try {

            const response =
                await fetchWithTimeout(
                    `${DELIVERIES_API}/${deletingDeliveryId}`,
                    {
                        method: "DELETE"
                    }
                );


            const result =
                await parseJsonResponse(
                    response
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    result.message ||
                    `Failed to delete delivery. HTTP ${response.status}`
                );

            }


            closeDeleteConfirmation();


            showToast(
                "Delivery deleted successfully.",
                "success"
            );


            await loadDeliveries();


        } catch (error) {

            console.error(
                "Delete delivery error:",
                error
            );


            showToast(
                error.message ||
                "Unable to delete delivery.",
                "error"
            );

        } finally {

            confirmDeleteButton.disabled =
                false;

            confirmDeleteButton.textContent =
                "Delete Delivery";

        }

    }


    // ========================================================
    // LOADING STATE
    // ========================================================

    function showLoadingState() {

        if (
            loadingState
        ) {

            loadingState.hidden =
                false;

        }


        if (
            emptyState
        ) {

            emptyState.hidden =
                true;

        }


        if (
            errorState
        ) {

            errorState.hidden =
                true;

        }


        if (
            deliveriesTableBody
        ) {

            deliveriesTableBody.innerHTML =
                "";

        }


        if (
            resultsCount
        ) {

            resultsCount.textContent =
                "Loading deliveries...";

        }

    }


    // ========================================================
    // ERROR STATE
    // ========================================================

    function showErrorState(
        message
    ) {

        if (
            loadingState
        ) {

            loadingState.hidden =
                true;

        }


        if (
            emptyState
        ) {

            emptyState.hidden =
                true;

        }


        if (
            errorState
        ) {

            errorState.hidden =
                false;

        }


        if (
            deliveriesTableBody
        ) {

            deliveriesTableBody.innerHTML =
                "";

        }


        if (
            errorMessage
        ) {

            errorMessage.textContent =
                message;

        }


        if (
            resultsCount
        ) {

            resultsCount.textContent =
                "Unable to load deliveries";

        }

    }


    // ========================================================
    // HIDE ALL TABLE STATES
    // ========================================================

    function hideAllTableStates() {

        loadingState &&
            (loadingState.hidden = true);

        emptyState &&
            (emptyState.hidden = true);

        errorState &&
            (errorState.hidden = true);

    }


    // ========================================================
    // FORM ERROR
    // ========================================================

    function showFormError(
        message
    ) {

        if (
            deliveryFormError
        ) {

            deliveryFormError.textContent =
                message;

            deliveryFormError.hidden =
                false;

        }

    }


    function clearFormError() {

        if (
            deliveryFormError
        ) {

            deliveryFormError.textContent =
                "";

            deliveryFormError.hidden =
                true;

        }

    }


    // ========================================================
    // STATUS CLASS
    // ========================================================

    function getStatusClass(
        status
    ) {

        switch (
            status
        ) {

            case "Assigned":

                return "status-assigned";


            case "In Transit":

                return "status-in-transit";


            case "Delivered":

                return "status-delivered";


            case "Cancelled":

                return "status-cancelled";


            case "Pending":

            default:

                return "status-pending";

        }

    }


    // ========================================================
    // PRIORITY CLASS
    // ========================================================

    function getPriorityClass(
        priority
    ) {

        switch (
            priority
        ) {

            case "High":

                return "priority-high";


            case "Urgent":

                return "priority-urgent";


            case "Normal":

            default:

                return "priority-normal";

        }

    }


    // ========================================================
    // FORMAT DATE / TIME
    // ========================================================

    function formatDateTime(
        value
    ) {

        if (
            !value
        ) {

            return {
                date: "—",
                time: "—"
            };

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return {
                date: "—",
                time: "—"
            };

        }


        return {

            date:
                date.toLocaleDateString(
                    "en-PH",
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    }
                ),

            time:
                date.toLocaleTimeString(
                    "en-PH",
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                )

        };

    }


    // ========================================================
    // FORMAT DATE FOR DATETIME-LOCAL
    // ========================================================

    function formatDateForInput(
        value
    ) {

        if (
            !value
        ) {

            return "";

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        const hours =
            String(
                date.getHours()
            ).padStart(
                2,
                "0"
            );


        const minutes =
            String(
                date.getMinutes()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}T${hours}:${minutes}`;

    }


    // ========================================================
    // FETCH WITH TIMEOUT
    // ========================================================

    async function fetchWithTimeout(
        url,
        options = {},
        timeout = 10000
    ) {

        const controller =
            new AbortController();


        const timeoutId =
            setTimeout(
                function () {

                    controller.abort();

                },
                timeout
            );


        try {

            return await fetch(
                url,
                {
                    ...options,
                    signal:
                        controller.signal
                }
            );

        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                throw new Error(
                    `Request timed out: ${url}`
                );

            }


            throw new Error(
                `Unable to connect to FleetFlow server: ${url}`
            );

        } finally {

            clearTimeout(
                timeoutId
            );

        }

    }


    // ========================================================
    // PARSE JSON RESPONSE
    // ========================================================

    async function parseJsonResponse(
        response
    ) {

        const text =
            await response.text();


        if (
            !text
        ) {

            return {};

        }


        try {

            return JSON.parse(
                text
            );

        } catch (error) {

            console.error(
                "Invalid JSON response:",
                text
            );


            throw new Error(
                "Server returned an invalid response."
            );

        }

    }


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ========================================================
    // DISPLAY TOPBAR USER
    // ========================================================

    function displayTopbarUser() {

        const userName =
            document.getElementById(
                "topbarUserName"
            );

        const userRole =
            document.getElementById(
                "topbarUserRole"
            );

        const avatar =
            document.getElementById(
                "topbarAvatar"
            );


        try {

            const user =
                JSON.parse(
                    localStorage.getItem(
                        "fleetflowUser"
                    )
                );


            if (
                !user
            ) {

                return;

            }


            const name =
                user.name ||
                user.fullName ||
                user.username ||
                "Admin";


            const role =
                user.role ||
                "Dispatcher";


            if (
                userName
            ) {

                userName.textContent =
                    name;

            }


            if (
                userRole
            ) {

                userRole.textContent =
                    formatRole(
                        role
                    );

            }


            if (
                avatar
            ) {

                avatar.textContent =
                    name
                        .charAt(0)
                        .toUpperCase();

            }

        } catch (error) {

            console.error(
                "Unable to display user:",
                error
            );

        }

    }


    // ========================================================
    // FORMAT ROLE
    // ========================================================

    function formatRole(
        role
    ) {

        if (
            !role
        ) {

            return "Dispatcher";

        }


        return String(
            role
        )

            .replace(
                /[-_]/g,
                " "
            )

            .replace(
                /\b\w/g,
                function (letter) {

                    return letter.toUpperCase();

                }
            );

    }


    // ========================================================
    // TOAST
    // ========================================================

    function showToast(
        message,
        type = "success"
    ) {

        let toast =
            document.getElementById(
                "fleetflowToast"
            );


        if (
            !toast
        ) {

            toast =
                document.createElement(
                    "div"
                );


            toast.id =
                "fleetflowToast";


            Object.assign(
                toast.style,
                {

                    position:
                        "fixed",

                    right:
                        "24px",

                    bottom:
                        "24px",

                    zIndex:
                        "5000",

                    maxWidth:
                        "400px",

                    padding:
                        "12px 16px",

                    borderRadius:
                        "8px",

                    fontSize:
                        "12px",

                    fontWeight:
                        "600",

                    lineHeight:
                        "1.5",

                    boxShadow:
                        "0 8px 25px rgba(15,23,42,.15)",

                    transition:
                        "opacity .2s ease, transform .2s ease"

                }
            );


            document.body.appendChild(
                toast
            );

        }


        if (
            type ===
            "error"
        ) {

            toast.style.background =
                "#fef2f2";

            toast.style.color =
                "#dc2626";

            toast.style.border =
                "1px solid #fecaca";

        } else {

            toast.style.background =
                "#ecfdf3";

            toast.style.color =
                "#15803d";

            toast.style.border =
                "1px solid #bbf7d0";

        }


        toast.textContent =
            message;


        toast.style.opacity =
            "1";


        toast.style.transform =
            "translateY(0)";


        clearTimeout(
            showToast.timer
        );


        showToast.timer =
            setTimeout(
                function () {

                    toast.style.opacity =
                        "0";

                    toast.style.transform =
                        "translateY(6px)";

                },
                3500
            );

    }


    // ========================================================
    // PAGE SHOW AUTH CHECK
    // ========================================================

    window.addEventListener(
        "pageshow",
        function () {

            const loggedIn =
                localStorage.getItem(
                    "fleetflowLoggedIn"
                );

            const user =
                localStorage.getItem(
                    "fleetflowUser"
                );


            if (
                loggedIn !== "true" ||
                !user
            ) {

                document.documentElement.classList.add(
                    "auth-locked"
                );


                window.location.replace(
                    "/pages/login.html"
                );

            }

        }
    );


})();
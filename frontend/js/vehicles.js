// ============================================================
// FLEETFLOW VEHICLES
// ============================================================
//
// Purpose:
// - Display vehicles
// - Search vehicles
// - Filter vehicles
// - Add vehicle
// - Edit vehicle
// - Delete vehicle
// - Connect to FleetFlow Vehicle API
//
// API:
//
// GET    /api/vehicles
// GET    /api/vehicles/:id
// POST   /api/vehicles
// PUT    /api/vehicles/:id
// DELETE /api/vehicles/:id
//
// ============================================================


"use strict";


// ============================================================
// AUTH GUARD
// ============================================================

(function checkAuthentication() {

    const storedUser =
        localStorage.getItem("fleetflowUser");

    if (!storedUser) {

        document.documentElement.classList.add(
            "auth-locked"
        );

        window.location.replace(
            "/pages/login.html"
        );

    }

})();


// ============================================================
// API
// ============================================================

const VEHICLES_API =
    "/api/vehicles";


// ============================================================
// STATE
// ============================================================

let allVehicles = [];

let filteredVehicles = [];

let editingVehicleId = null;

let deletingVehicleId = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const tableBody =
    document.getElementById(
        "vehicles-table-body"
    );

const loadingState =
    document.getElementById(
        "loading-state"
    );

const emptyState =
    document.getElementById(
        "empty-state"
    );

const errorState =
    document.getElementById(
        "error-state"
    );

const errorMessage =
    document.getElementById(
        "error-message"
    );

const searchInput =
    document.getElementById(
        "vehicle-search"
    );

const statusFilter =
    document.getElementById(
        "status-filter"
    );

const typeFilter =
    document.getElementById(
        "type-filter"
    );

const refreshButton =
    document.getElementById(
        "refresh-btn"
    );

const retryButton =
    document.getElementById(
        "retry-btn"
    );

const addVehicleButton =
    document.getElementById(
        "add-vehicle-btn"
    );


// Summary

const totalVehicles =
    document.getElementById(
        "total-vehicles"
    );

const availableVehicles =
    document.getElementById(
        "available-vehicles"
    );

const deliveryVehicles =
    document.getElementById(
        "delivery-vehicles"
    );

const maintenanceVehicles =
    document.getElementById(
        "maintenance-vehicles"
    );


// Modal

const vehicleModal =
    document.getElementById(
        "vehicle-modal"
    );

const modalTitle =
    document.getElementById(
        "modal-title"
    );

const modalDescription =
    document.getElementById(
        "modal-description"
    );

const modalCloseButton =
    document.getElementById(
        "modal-close-btn"
    );

const cancelButton =
    document.getElementById(
        "cancel-btn"
    );

const vehicleForm =
    document.getElementById(
        "vehicle-form"
    );

const saveVehicleButton =
    document.getElementById(
        "save-vehicle-btn"
    );

const formError =
    document.getElementById(
        "form-error"
    );


// Form fields

const vehicleIdInput =
    document.getElementById(
        "vehicle-id"
    );

const plateNumberInput =
    document.getElementById(
        "plate-number"
    );

const vehicleTypeInput =
    document.getElementById(
        "vehicle-type"
    );

const makeModelInput =
    document.getElementById(
        "make-model"
    );

const capacityInput =
    document.getElementById(
        "capacity"
    );

const vehicleStatusInput =
    document.getElementById(
        "vehicle-status"
    );


// Delete modal

const deleteModal =
    document.getElementById(
        "delete-modal"
    );

const deleteMessage =
    document.getElementById(
        "delete-message"
    );

const deleteCancelButton =
    document.getElementById(
        "delete-cancel-btn"
    );

const deleteConfirmButton =
    document.getElementById(
        "delete-confirm-btn"
    );


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadVehicles();

        setupEventListeners();

        updateTopbarUser();

    }
);


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {


    // Search

    searchInput.addEventListener(
        "input",
        applyFilters
    );


    // Status filter

    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    // Type filter

    typeFilter.addEventListener(
        "change",
        applyFilters
    );


    // Refresh

    refreshButton.addEventListener(
        "click",
        loadVehicles
    );


    // Retry

    retryButton.addEventListener(
        "click",
        loadVehicles
    );


    // Add

    addVehicleButton.addEventListener(
        "click",
        openAddModal
    );


    // Modal close

    modalCloseButton.addEventListener(
        "click",
        closeVehicleModal
    );


    cancelButton.addEventListener(
        "click",
        closeVehicleModal
    );


    // Form submit

    vehicleForm.addEventListener(
        "submit",
        handleVehicleSubmit
    );


    // Delete modal

    deleteCancelButton.addEventListener(
        "click",
        closeDeleteModal
    );


    deleteConfirmButton.addEventListener(
        "click",
        confirmDeleteVehicle
    );


    // Close modal by clicking overlay

    vehicleModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === vehicleModal
            ) {

                closeVehicleModal();

            }

        }
    );


    deleteModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === deleteModal
            ) {

                closeDeleteModal();

            }

        }
    );


    // Escape key

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeVehicleModal();

                closeDeleteModal();

            }

        }
    );

}


// ============================================================
// LOAD VEHICLES
// ============================================================

async function loadVehicles() {

    showLoadingState();


    try {

        const response =
            await fetch(
                VEHICLES_API,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load vehicles."
            );

        }


        allVehicles =
            Array.isArray(data.vehicles)
                ? data.vehicles
                : [];


        applyFilters();

    } catch (error) {

        console.error(
            "FleetFlow vehicles error:",
            error
        );

        showErrorState(
            error.message ||
            "Unable to load vehicles."
        );

    }

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const selectedType =
        typeFilter.value;


    filteredVehicles =
        allVehicles.filter(
            (vehicle) => {


                // Search

                const matchesSearch =
                    !search ||

                    String(
                        vehicle.vehicleId || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        vehicle.plateNumber || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        vehicle.makeModel || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        vehicle.vehicleType || ""
                    )
                        .toLowerCase()
                        .includes(search);


                // Status

                const matchesStatus =
                    selectedStatus === "all" ||
                    vehicle.status === selectedStatus;


                // Type

                const matchesType =
                    selectedType === "all" ||
                    vehicle.vehicleType === selectedType;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );

            }
        );


    updateSummary();

    renderVehicles();

}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateSummary() {

    const total =
        allVehicles.length;


    const available =
        allVehicles.filter(
            vehicle =>
                vehicle.status === "Available"
        ).length;


    const onDelivery =
        allVehicles.filter(
            vehicle =>
                vehicle.status === "On Delivery"
        ).length;


    const maintenance =
        allVehicles.filter(
            vehicle =>
                vehicle.status === "Maintenance"
        ).length;


    totalVehicles.textContent =
        total;


    availableVehicles.textContent =
        available;


    deliveryVehicles.textContent =
        onDelivery;


    maintenanceVehicles.textContent =
        maintenance;

}


// ============================================================
// RENDER VEHICLES
// ============================================================

function renderVehicles() {

    hideAllStates();

    tableBody.innerHTML = "";


    if (
        filteredVehicles.length === 0
    ) {

        emptyState.hidden = false;

        return;

    }


    filteredVehicles.forEach(
        (vehicle) => {

            const row =
                createVehicleRow(
                    vehicle
                );

            tableBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// CREATE VEHICLE ROW
// ============================================================

function createVehicleRow(vehicle) {

    const row =
        document.createElement(
            "tr"
        );


    const statusClass =
        getStatusClass(
            vehicle.status
        );


    const vehicleIcon =
        getVehicleIcon(
            vehicle.vehicleType
        );


    row.innerHTML = `

        <td>

            <span class="vehicle-id">
                ${escapeHtml(
                    vehicle.vehicleId || "-"
                )}
            </span>

        </td>


        <td>

            <div class="vehicle-info">

                <div class="vehicle-icon">
                    ${vehicleIcon}
                </div>

                <div class="vehicle-name">

                    <strong>
                        ${escapeHtml(
                            vehicle.makeModel || "-"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            vehicle.vehicleType || "-"
                        )}
                    </span>

                </div>

            </div>

        </td>


        <td>

            <span class="plate-number">
                ${escapeHtml(
                    vehicle.plateNumber || "-"
                )}
            </span>

        </td>


        <td>

            <span class="type-badge">
                ${escapeHtml(
                    vehicle.vehicleType || "-"
                )}
            </span>

        </td>


        <td>

            <span class="capacity">
                ${formatNumber(
                    vehicle.capacity
                )}
            </span>

            <span class="capacity-unit">
                kg
            </span>

        </td>


        <td>

            <span
                class="status-badge ${statusClass}"
            >
                ${escapeHtml(
                    vehicle.status || "Inactive"
                )}
            </span>

        </td>


        <td>

            <div class="actions">

                <button
                    type="button"
                    class="action-btn"
                    title="Edit vehicle"
                    data-action="edit"
                    data-id="${vehicle._id}"
                >
                    ✏️
                </button>

                <button
                    type="button"
                    class="action-btn delete"
                    title="Delete vehicle"
                    data-action="delete"
                    data-id="${vehicle._id}"
                >
                    🗑️
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


    editButton.addEventListener(
        "click",
        () => {

            openEditModal(
                vehicle._id
            );

        }
    );


    deleteButton.addEventListener(
        "click",
        () => {

            openDeleteModal(
                vehicle
            );

        }
    );


    return row;

}


// ============================================================
// GET STATUS CLASS
// ============================================================

function getStatusClass(status) {

    switch (status) {

        case "Available":
            return "status-available";

        case "On Delivery":
            return "status-delivery";

        case "Maintenance":
            return "status-maintenance";

        case "Inactive":
            return "status-inactive";

        default:
            return "status-inactive";

    }

}


// ============================================================
// GET VEHICLE ICON
// ============================================================

function getVehicleIcon(type) {

    switch (type) {

        case "Motorcycle":
            return "🏍️";

        case "Van":
            return "🚐";

        case "Truck":
            return "🚛";

        case "Pickup":
            return "🛻";

        default:
            return "🚚";

    }

}


// ============================================================
// OPEN ADD MODAL
// ============================================================

function openAddModal() {

    editingVehicleId = null;

    vehicleForm.reset();


    modalTitle.textContent =
        "Add Vehicle";


    modalDescription.textContent =
        "Add a new vehicle to your fleet.";


    saveVehicleButton.textContent =
        "Save Vehicle";


    vehicleStatusInput.value =
        "Available";


    formError.hidden = true;

    formError.textContent = "";


    vehicleModal.hidden = false;


    setTimeout(
        () => {
            vehicleIdInput.focus();
        },
        50
    );

}


// ============================================================
// OPEN EDIT MODAL
// ============================================================

async function openEditModal(vehicleId) {

    try {

        const response =
            await fetch(
                `${VEHICLES_API}/${vehicleId}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load vehicle."
            );

        }


        const vehicle =
            data.vehicle;


        if (!vehicle) {

            throw new Error(
                "Vehicle not found."
            );

        }


        editingVehicleId =
            vehicle._id;


        modalTitle.textContent =
            "Edit Vehicle";


        modalDescription.textContent =
            "Update the vehicle information.";


        saveVehicleButton.textContent =
            "Update Vehicle";


        vehicleIdInput.value =
            vehicle.vehicleId || "";


        plateNumberInput.value =
            vehicle.plateNumber || "";


        vehicleTypeInput.value =
            vehicle.vehicleType || "";


        makeModelInput.value =
            vehicle.makeModel || "";


        capacityInput.value =
            vehicle.capacity ?? "";


        vehicleStatusInput.value =
            vehicle.status || "Available";


        formError.hidden = true;

        formError.textContent = "";


        vehicleModal.hidden = false;


        setTimeout(
            () => {
                vehicleIdInput.focus();
            },
            50
        );

    } catch (error) {

        console.error(
            "Edit vehicle error:",
            error
        );

        alert(
            error.message ||
            "Unable to load vehicle."
        );

    }

}


// ============================================================
// CLOSE VEHICLE MODAL
// ============================================================

function closeVehicleModal() {

    vehicleModal.hidden = true;

    editingVehicleId = null;

    vehicleForm.reset();

    formError.hidden = true;

    formError.textContent = "";

}


// ============================================================
// HANDLE VEHICLE SUBMIT
// ============================================================

async function handleVehicleSubmit(event) {

    event.preventDefault();


    hideFormError();


    const vehicleId =
        vehicleIdInput.value
            .trim()
            .toUpperCase();


    const plateNumber =
        plateNumberInput.value
            .trim()
            .toUpperCase();


    const vehicleType =
        vehicleTypeInput.value;


    const makeModel =
        makeModelInput.value
            .trim();


    const capacityValue =
        capacityInput.value;


    const status =
        vehicleStatusInput.value;


    // Validation

    if (!vehicleId) {

        showFormError(
            "Vehicle ID is required."
        );

        vehicleIdInput.focus();

        return;

    }


    if (!plateNumber) {

        showFormError(
            "Plate number is required."
        );

        plateNumberInput.focus();

        return;

    }


    if (!vehicleType) {

        showFormError(
            "Please select a vehicle type."
        );

        vehicleTypeInput.focus();

        return;

    }


    if (!makeModel) {

        showFormError(
            "Make / Model is required."
        );

        makeModelInput.focus();

        return;

    }


    if (
        capacityValue === "" ||
        Number(capacityValue) < 0
    ) {

        showFormError(
            "Please enter a valid capacity."
        );

        capacityInput.focus();

        return;

    }


    const capacity =
        Number(capacityValue);


    if (
        !Number.isFinite(capacity)
    ) {

        showFormError(
            "Capacity must be a valid number."
        );

        capacityInput.focus();

        return;

    }


    const payload = {

        vehicleId,
        plateNumber,
        vehicleType,
        makeModel,
        capacity,
        status

    };


    setSaveButtonLoading(
        true
    );


    try {

        const isEditing =
            Boolean(
                editingVehicleId
            );


        const url =
            isEditing
                ? `${VEHICLES_API}/${editingVehicleId}`
                : VEHICLES_API;


        const method =
            isEditing
                ? "PUT"
                : "POST";


        const response =
            await fetch(
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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save vehicle."
            );

        }


        closeVehicleModal();

        await loadVehicles();


    } catch (error) {

        console.error(
            "Save vehicle error:",
            error
        );


        showFormError(
            error.message ||
            "Unable to save vehicle."
        );

    } finally {

        setSaveButtonLoading(
            false
        );

    }

}


// ============================================================
// SAVE BUTTON LOADING
// ============================================================

function setSaveButtonLoading(
    loading
) {

    saveVehicleButton.disabled =
        loading;


    if (loading) {

        saveVehicleButton.textContent =
            editingVehicleId
                ? "Updating..."
                : "Saving...";

    } else {

        saveVehicleButton.textContent =
            editingVehicleId
                ? "Update Vehicle"
                : "Save Vehicle";

    }

}


// ============================================================
// OPEN DELETE MODAL
// ============================================================

function openDeleteModal(vehicle) {

    deletingVehicleId =
        vehicle._id;


    deleteMessage.textContent =
        `Are you sure you want to delete ${vehicle.vehicleId} (${vehicle.plateNumber})? This action cannot be undone.`;


    deleteModal.hidden = false;

}


// ============================================================
// CLOSE DELETE MODAL
// ============================================================

function closeDeleteModal() {

    deleteModal.hidden = true;

    deletingVehicleId = null;

}


// ============================================================
// CONFIRM DELETE
// ============================================================

async function confirmDeleteVehicle() {

    if (
        !deletingVehicleId
    ) {

        return;

    }


    deleteConfirmButton.disabled =
        true;


    deleteConfirmButton.textContent =
        "Deleting...";


    try {

        const response =
            await fetch(
                `${VEHICLES_API}/${deletingVehicleId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete vehicle."
            );

        }


        closeDeleteModal();

        await loadVehicles();


    } catch (error) {

        console.error(
            "Delete vehicle error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete vehicle."
        );

    } finally {

        deleteConfirmButton.disabled =
            false;

        deleteConfirmButton.textContent =
            "Delete Vehicle";

    }

}


// ============================================================
// LOADING STATE
// ============================================================

function showLoadingState() {

    tableBody.innerHTML = "";

    hideAllStates();

    loadingState.hidden = false;

}


// ============================================================
// ERROR STATE
// ============================================================

function showErrorState(
    message
) {

    tableBody.innerHTML = "";

    hideAllStates();

    errorMessage.textContent =
        message;

    errorState.hidden = false;

}


// ============================================================
// HIDE STATES
// ============================================================

function hideAllStates() {

    loadingState.hidden = true;

    emptyState.hidden = true;

    errorState.hidden = true;

}


// ============================================================
// FORM ERROR
// ============================================================

function showFormError(
    message
) {

    formError.textContent =
        message;

    formError.hidden = false;

}


function hideFormError() {

    formError.textContent = "";

    formError.hidden = true;

}


// ============================================================
// UPDATE TOPBAR USER
// ============================================================

function updateTopbarUser() {

    const userName =
        document.getElementById(
            "topbar-user-name"
        );


    if (!userName) {

        return;

    }


    try {

        const storedUser =
            localStorage.getItem(
                "fleetflowUser"
            );


        if (!storedUser) {

            return;

        }


        const user =
            JSON.parse(
                storedUser
            );


        userName.textContent =
            user.fullName ||
            user.username ||
            "Dispatcher";


    } catch (error) {

        console.warn(
            "Unable to read FleetFlow user:",
            error
        );

    }

}


// ============================================================
// FORMAT NUMBER
// ============================================================

function formatNumber(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0";

    }


    return number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

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


// ============================================================
// PAGE VISIBILITY PROTECTION
// ============================================================

window.addEventListener(
    "pageshow",
    () => {

        const storedUser =
            localStorage.getItem(
                "fleetflowUser"
            );


        if (!storedUser) {

            document.documentElement.classList.add(
                "auth-locked"
            );

            window.location.replace(
                "/pages/login.html"
            );

        }

    }
);


// ============================================================
// END OF VEHICLES.JS
// ============================================================
// ============================================================
// FLEETFLOW DRIVERS
// ============================================================


// ============================================================
// AUTHENTICATION GUARD
// ============================================================

(function () {

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

    }

})();


// ============================================================
// CONFIGURATION
// ============================================================

const DRIVERS_API =
    "/api/drivers";


// ============================================================
// STATE
// ============================================================

let allDrivers = [];

let filteredDrivers = [];

let editingDriverId = null;

let pendingDeleteDriverId = null;

let isSavingDriver = false;

let isDeletingDriver = false;


// ============================================================
// ELEMENTS
// ============================================================


// ============================================================
// TABLE ELEMENTS
// ============================================================

const driversTableBody =
    document.getElementById(
        "driversTableBody"
    );


const loadingState =
    document.getElementById(
        "loadingState"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const driverSearch =
    document.getElementById(
        "driverSearch"
    );


const statusFilter =
    document.getElementById(
        "statusFilter"
    );


const refreshDriversButton =
    document.getElementById(
        "refreshDriversButton"
    );


const createDriverButton =
    document.getElementById(
        "createDriverButton"
    );


const emptyCreateButton =
    document.getElementById(
        "emptyCreateButton"
    );


const resultsCount =
    document.getElementById(
        "resultsCount"
    );


// ============================================================
// SUMMARY ELEMENTS
// ============================================================

const totalDrivers =
    document.getElementById(
        "totalDrivers"
    );


const availableDrivers =
    document.getElementById(
        "availableDrivers"
    );


const onDeliveryDrivers =
    document.getElementById(
        "onDeliveryDrivers"
    );


const inactiveDrivers =
    document.getElementById(
        "inactiveDrivers"
    );


// ============================================================
// TOPBAR USER
// ============================================================

const topbarUserName =
    document.getElementById(
        "topbarUserName"
    );


const topbarUserRole =
    document.getElementById(
        "topbarUserRole"
    );


const topbarAvatar =
    document.getElementById(
        "topbarAvatar"
    );


// ============================================================
// DRIVER FORM MODAL
// ============================================================

const driverModal =
    document.getElementById(
        "driverModal"
    );


const driverForm =
    document.getElementById(
        "driverForm"
    );


const driverModalTitle =
    document.getElementById(
        "driverModalTitle"
    );


const driverModalDescription =
    document.getElementById(
        "driverModalDescription"
    );


const closeDriverModalButton =
    document.getElementById(
        "closeDriverModalButton"
    );


const cancelDriverModalButton =
    document.getElementById(
        "cancelDriverModalButton"
    );


const editingDriverIdInput =
    document.getElementById(
        "editingDriverId"
    );


// ============================================================
// DRIVER FORM INPUTS
// ============================================================

const driverIdInput =
    document.getElementById(
        "driverIdInput"
    );


const fullNameInput =
    document.getElementById(
        "fullNameInput"
    );


const phoneInput =
    document.getElementById(
        "phoneInput"
    );


const licenseNumberInput =
    document.getElementById(
        "licenseNumberInput"
    );


const licenseExpiryInput =
    document.getElementById(
        "licenseExpiryInput"
    );


const driverStatusInput =
    document.getElementById(
        "driverStatusInput"
    );


// ============================================================
// FORM ERRORS
// ============================================================

const driverIdError =
    document.getElementById(
        "driverIdError"
    );


const fullNameError =
    document.getElementById(
        "fullNameError"
    );


const phoneError =
    document.getElementById(
        "phoneError"
    );


const licenseNumberError =
    document.getElementById(
        "licenseNumberError"
    );


const licenseExpiryError =
    document.getElementById(
        "licenseExpiryError"
    );


const driverStatusError =
    document.getElementById(
        "driverStatusError"
    );


// ============================================================
// SAVE BUTTON
// ============================================================

const saveDriverButton =
    document.getElementById(
        "saveDriverButton"
    );


const saveDriverButtonText =
    document.getElementById(
        "saveDriverButtonText"
    );


const saveDriverButtonSpinner =
    document.getElementById(
        "saveDriverButtonSpinner"
    );


// ============================================================
// DELETE MODAL
// ============================================================

const deleteDriverModal =
    document.getElementById(
        "deleteDriverModal"
    );


const deleteModalMessage =
    document.getElementById(
        "deleteModalMessage"
    );


const cancelDeleteButton =
    document.getElementById(
        "cancelDeleteButton"
    );


const confirmDeleteButton =
    document.getElementById(
        "confirmDeleteButton"
    );


// ============================================================
// AUTHENTICATED USER
// ============================================================

function getAuthenticatedUser() {

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

        return null;

    }


    try {

        return JSON.parse(
            storedUser
        );

    } catch (error) {

        console.error(
            "Invalid stored user data:",
            error
        );


        localStorage.removeItem(
            "fleetflowLoggedIn"
        );

        localStorage.removeItem(
            "fleetflowUser"
        );


        document.documentElement.classList.add(
            "auth-locked"
        );


        window.location.replace(
            "/pages/login.html"
        );


        return null;

    }

}


const currentUser =
    getAuthenticatedUser();


if (!currentUser) {

    throw new Error(
        "User is not authenticated."
    );

}


// ============================================================
// INITIALIZE TOPBAR USER
// ============================================================

function initializeTopbarUser() {

    const displayName =
        currentUser.fullName ||
        currentUser.username ||
        "Admin";


    const displayRole =
        currentUser.role ||
        "Dispatcher";


    if (topbarUserName) {

        topbarUserName.textContent =
            displayName;

    }


    if (topbarUserRole) {

        topbarUserRole.textContent =
            displayRole;

    }


    if (topbarAvatar) {

        topbarAvatar.textContent =
            getInitials(
                displayName
            );

    }

}


// ============================================================
// INITIALS
// ============================================================

function getInitials(name) {

    if (!name) {

        return "A";

    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


// ============================================================
// LOAD DRIVERS
// ============================================================

async function loadDrivers() {

    showLoading();


    try {

        const response =
            await fetch(
                DRIVERS_API,
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
                "Failed to load drivers."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load drivers."
            );

        }


        allDrivers =
            Array.isArray(
                data.drivers
            )
                ? data.drivers
                : [];


        // ----------------------------------------------------
        // UPDATE SUMMARY
        // ----------------------------------------------------

        updateSummary();


        // ----------------------------------------------------
        // APPLY SEARCH / FILTER
        // ----------------------------------------------------

        applyFilters();


    } catch (error) {

        console.error(
            "FleetFlow drivers error:",
            error
        );


        showError(
            error.message ||
            "Unable to load drivers."
        );

    }

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

    const searchValue =
        driverSearch
            ? driverSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    filteredDrivers =
        allDrivers.filter(
            (driver) => {

                // --------------------------------------------
                // SEARCH
                // --------------------------------------------

                const searchableText = [

                    driver.driverId,

                    driver.fullName,

                    driver.phone,

                    driver.licenseNumber

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !searchValue ||
                    searchableText.includes(
                        searchValue
                    );


                // --------------------------------------------
                // STATUS
                // --------------------------------------------

                const matchesStatus =
                    selectedStatus === "all" ||
                    driver.status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderDrivers(
        filteredDrivers
    );


    updateResultsCount(
        filteredDrivers.length
    );

}


// ============================================================
// RENDER DRIVERS
// ============================================================

function renderDrivers(drivers) {

    if (!driversTableBody) {

        return;

    }


    driversTableBody.innerHTML =
        "";


    hideLoading();


    if (!drivers.length) {

        showEmpty();

        return;

    }


    hideEmpty();


    const fragment =
        document.createDocumentFragment();


    drivers.forEach(
        (driver) => {

            const row =
                createDriverRow(
                    driver
                );


            fragment.appendChild(
                row
            );

        }
    );


    driversTableBody.appendChild(
        fragment
    );

}


// ============================================================
// CREATE DRIVER ROW
// ============================================================

function createDriverRow(driver) {

    const row =
        document.createElement(
            "tr"
        );


    const driverId =
        escapeHtml(
            driver.driverId ||
            "—"
        );


    const fullName =
        escapeHtml(
            driver.fullName ||
            "Unknown Driver"
        );


    const phone =
        escapeHtml(
            driver.phone ||
            "—"
        );


    const licenseNumber =
        escapeHtml(
            driver.licenseNumber ||
            "—"
        );


    const status =
        driver.status ||
        "Available";


    const initials =
        getInitials(
            driver.fullName ||
            "Driver"
        );


    const licenseInfo =
        getLicenseExpiryInfo(
            driver.licenseExpiry
        );


    row.innerHTML = `

        <td>

            <span class="driver-id">

                ${driverId}

            </span>

        </td>


        <td>

            <div class="driver-cell">

                <div class="driver-avatar">

                    ${escapeHtml(initials)}

                </div>


                <div class="driver-info">

                    <span class="driver-name">

                        ${fullName}

                    </span>


                    <span class="driver-subtext">

                        FleetFlow Driver

                    </span>

                </div>

            </div>

        </td>


        <td>

            <span class="driver-phone">

                ${phone}

            </span>

        </td>


        <td>

            <span class="license-number">

                ${licenseNumber}

            </span>

        </td>


        <td>

            <span
                class="license-expiry ${licenseInfo.className}"
            >

                ${licenseInfo.text}

            </span>

        </td>


        <td>

            ${createStatusBadge(status)}

        </td>


        <td>

            <div class="action-buttons">

                <button
                    type="button"
                    class="action-button"
                    data-action="edit"
                    data-id="${escapeHtml(driver._id)}"
                    title="Edit driver"
                    aria-label="Edit driver"
                >

                    ✎

                </button>


                <button
                    type="button"
                    class="action-button delete"
                    data-action="delete"
                    data-id="${escapeHtml(driver._id)}"
                    title="Delete driver"
                    aria-label="Delete driver"
                >

                    ×

                </button>

            </div>

        </td>

    `;


    return row;

}


// ============================================================
// STATUS BADGE
// ============================================================

function createStatusBadge(status) {

    const statusClasses = {

        "Available":
            "status-available",

        "On Delivery":
            "status-on-delivery",

        "Off Duty":
            "status-off-duty",

        "Inactive":
            "status-inactive"

    };


    const className =
        statusClasses[status] ||
        "status-inactive";


    return `

        <span
            class="status-badge ${className}"
        >

            ${escapeHtml(status)}

        </span>

    `;

}


// ============================================================
// LICENSE EXPIRY
// ============================================================

function getLicenseExpiryInfo(dateValue) {

    if (!dateValue) {

        return {

            text: "—",

            className: ""

        };

    }


    const expiryDate =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            expiryDate.getTime()
        )
    ) {

        return {

            text: "Invalid date",

            className: "expired"

        };

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    expiryDate.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        expiryDate.getTime() -
        today.getTime();


    const daysRemaining =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const formattedDate =
        expiryDate.toLocaleDateString(
            "en-PH",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );


    if (daysRemaining < 0) {

        return {

            text:
                `${formattedDate} — Expired`,

            className:
                "expired"

        };

    }


    if (daysRemaining <= 30) {

        return {

            text:
                `${formattedDate} — Expiring Soon`,

            className:
                "expiring"

        };

    }


    return {

        text:
            formattedDate,

        className:
            ""

    };

}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateSummary() {

    const total =
        allDrivers.length;


    const available =
        allDrivers.filter(
            (driver) =>
                driver.status ===
                "Available"
        ).length;


    const onDelivery =
        allDrivers.filter(
            (driver) =>
                driver.status ===
                "On Delivery"
        ).length;


    const inactive =
        allDrivers.filter(
            (driver) =>
                driver.status ===
                    "Inactive" ||
                driver.status ===
                    "Off Duty"
        ).length;


    if (totalDrivers) {

        totalDrivers.textContent =
            total;

    }


    if (availableDrivers) {

        availableDrivers.textContent =
            available;

    }


    if (onDeliveryDrivers) {

        onDeliveryDrivers.textContent =
            onDelivery;

    }


    if (inactiveDrivers) {

        inactiveDrivers.textContent =
            inactive;

    }

}


// ============================================================
// UPDATE RESULTS COUNT
// ============================================================

function updateResultsCount(count) {

    if (!resultsCount) {

        return;

    }


    resultsCount.textContent =
        `Showing ${count} ${
            count === 1
                ? "driver"
                : "drivers"
        }`;

}


// ============================================================
// LOADING STATE
// ============================================================

function showLoading() {

    if (loadingState) {

        loadingState.hidden =
            false;

    }


    if (emptyState) {

        emptyState.hidden =
            true;

    }

}


// ============================================================
// HIDE LOADING
// ============================================================

function hideLoading() {

    if (loadingState) {

        loadingState.hidden =
            true;

    }

}


// ============================================================
// EMPTY STATE
// ============================================================

function showEmpty() {

    if (emptyState) {

        emptyState.hidden =
            false;

    }

}


// ============================================================
// HIDE EMPTY
// ============================================================

function hideEmpty() {

    if (emptyState) {

        emptyState.hidden =
            true;

    }

}


// ============================================================
// ERROR STATE
// ============================================================

function showError(message) {

    hideLoading();


    if (!driversTableBody) {

        return;

    }


    driversTableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="
                    text-align: center;
                    padding: 50px 20px;
                    color: #dc2626;
                "
            >

                <strong>
                    Unable to load drivers
                </strong>

                <div
                    style="
                        margin-top: 7px;
                        color: #64748b;
                        font-size: 11px;
                    "
                >

                    ${escapeHtml(message)}

                </div>

            </td>

        </tr>

    `;


    updateResultsCount(
        0
    );

}


// ============================================================
// OPEN ADD DRIVER MODAL
// ============================================================

function openAddDriverModal() {

    if (!driverModal) {

        return;

    }


    editingDriverId =
        null;


    if (editingDriverIdInput) {

        editingDriverIdInput.value =
            "";

    }


    if (driverModalTitle) {

        driverModalTitle.textContent =
            "Add Driver";

    }


    if (driverModalDescription) {

        driverModalDescription.textContent =
            "Add a new delivery driver to your fleet.";

    }


    if (saveDriverButtonText) {

        saveDriverButtonText.textContent =
            "Create Driver";

    }


    resetDriverForm();


    if (driverIdInput) {

        driverIdInput.disabled =
            false;

    }


    showDriverModal();


    setTimeout(
        () => {

            if (driverIdInput) {

                driverIdInput.focus();

            }

        },
        100
    );

}


// ============================================================
// OPEN EDIT DRIVER MODAL
// ============================================================

function openEditDriverModal(driverId) {

    const driver =
        allDrivers.find(
            (item) =>
                item._id ===
                driverId
        );


    if (!driver) {

        showApiError(
            "The selected driver could not be found."
        );

        return;

    }


    editingDriverId =
        driverId;


    if (editingDriverIdInput) {

        editingDriverIdInput.value =
            driverId;

    }


    if (driverModalTitle) {

        driverModalTitle.textContent =
            "Edit Driver";

    }


    if (driverModalDescription) {

        driverModalDescription.textContent =
            "Update this driver's information and availability.";

    }


    if (saveDriverButtonText) {

        saveDriverButtonText.textContent =
            "Save Changes";

    }


    // --------------------------------------------------------
    // POPULATE FORM
    // --------------------------------------------------------

    if (driverIdInput) {

        driverIdInput.value =
            driver.driverId ||
            "";

        // Driver ID is kept read-only during editing
        // because it is a unique identifier.

        driverIdInput.disabled =
            true;

    }


    if (fullNameInput) {

        fullNameInput.value =
            driver.fullName ||
            "";

    }


    if (phoneInput) {

        phoneInput.value =
            driver.phone ||
            "";

    }


    if (licenseNumberInput) {

        licenseNumberInput.value =
            driver.licenseNumber ||
            "";

    }


    if (licenseExpiryInput) {

        licenseExpiryInput.value =
            formatDateForInput(
                driver.licenseExpiry
            );

    }


    if (driverStatusInput) {

        driverStatusInput.value =
            driver.status ||
            "Available";

    }


    clearFormErrors();


    showDriverModal();


    setTimeout(
        () => {

            if (fullNameInput) {

                fullNameInput.focus();

            }

        },
        100
    );

}


// ============================================================
// SHOW DRIVER MODAL
// ============================================================

function showDriverModal() {

    if (!driverModal) {

        return;

    }


    driverModal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


// ============================================================
// CLOSE DRIVER MODAL
// ============================================================

function closeDriverModal() {

    if (
        isSavingDriver
    ) {

        return;

    }


    if (!driverModal) {

        return;

    }


    driverModal.hidden =
        true;


    document.body.style.overflow =
        "";


    editingDriverId =
        null;


    if (editingDriverIdInput) {

        editingDriverIdInput.value =
            "";

    }


    resetDriverForm();

}


// ============================================================
// RESET DRIVER FORM
// ============================================================

function resetDriverForm() {

    if (driverForm) {

        driverForm.reset();

    }


    if (driverStatusInput) {

        driverStatusInput.value =
            "Available";

    }


    if (driverIdInput) {

        driverIdInput.disabled =
            false;

    }


    clearFormErrors();


    setSaveButtonLoading(
        false
    );

}


// ============================================================
// CLEAR FORM ERRORS
// ============================================================

function clearFormErrors() {

    const inputs = [

        driverIdInput,

        fullNameInput,

        phoneInput,

        licenseNumberInput,

        licenseExpiryInput,

        driverStatusInput

    ];


    inputs.forEach(
        (input) => {

            if (input) {

                input.classList.remove(
                    "input-error"
                );

            }

        }
    );


    const errors = [

        driverIdError,

        fullNameError,

        phoneError,

        licenseNumberError,

        licenseExpiryError,

        driverStatusError

    ];


    errors.forEach(
        (errorElement) => {

            if (errorElement) {

                errorElement.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// SET FORM ERROR
// ============================================================

function setFormError(
    input,
    errorElement,
    message
) {

    if (input) {

        input.classList.add(
            "input-error"
        );

    }


    if (errorElement) {

        errorElement.textContent =
            message;

    }

}


// ============================================================
// VALIDATE DRIVER FORM
// ============================================================

function validateDriverForm() {

    clearFormErrors();


    let isValid =
        true;


    const driverId =
        driverIdInput
            ? driverIdInput.value.trim()
            : "";


    const fullName =
        fullNameInput
            ? fullNameInput.value.trim()
            : "";


    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";


    const licenseNumber =
        licenseNumberInput
            ? licenseNumberInput.value.trim()
            : "";


    const licenseExpiry =
        licenseExpiryInput
            ? licenseExpiryInput.value
            : "";


    const status =
        driverStatusInput
            ? driverStatusInput.value
            : "";


    // --------------------------------------------------------
    // DRIVER ID
    // --------------------------------------------------------

    if (!driverId) {

        setFormError(
            driverIdInput,
            driverIdError,
            "Driver ID is required."
        );

        isValid =
            false;

    } else if (
        !/^[A-Za-z0-9-]+$/.test(
            driverId
        )
    ) {

        setFormError(
            driverIdInput,
            driverIdError,
            "Use only letters, numbers, and hyphens."
        );

        isValid =
            false;

    }


    // --------------------------------------------------------
    // FULL NAME
    // --------------------------------------------------------

    if (!fullName) {

        setFormError(
            fullNameInput,
            fullNameError,
            "Full name is required."
        );

        isValid =
            false;

    } else if (
        fullName.length < 2
    ) {

        setFormError(
            fullNameInput,
            fullNameError,
            "Please enter a valid name."
        );

        isValid =
            false;

    }


    // --------------------------------------------------------
    // PHONE
    // --------------------------------------------------------

    if (!phone) {

        setFormError(
            phoneInput,
            phoneError,
            "Phone number is required."
        );

        isValid =
            false;

    } else if (
        !/^[0-9+\-\s()]+$/.test(
            phone
        )
    ) {

        setFormError(
            phoneInput,
            phoneError,
            "Please enter a valid phone number."
        );

        isValid =
            false;

    }


    // --------------------------------------------------------
    // LICENSE NUMBER
    // --------------------------------------------------------

    if (!licenseNumber) {

        setFormError(
            licenseNumberInput,
            licenseNumberError,
            "License number is required."
        );

        isValid =
            false;

    }


    // --------------------------------------------------------
    // LICENSE EXPIRY
    // --------------------------------------------------------

    if (!licenseExpiry) {

        setFormError(
            licenseExpiryInput,
            licenseExpiryError,
            "License expiry date is required."
        );

        isValid =
            false;

    } else if (
        !isValidDate(
            licenseExpiry
        )
    ) {

        setFormError(
            licenseExpiryInput,
            licenseExpiryError,
            "Please enter a valid date."
        );

        isValid =
            false;

    }


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    const validStatuses = [

        "Available",

        "On Delivery",

        "Off Duty",

        "Inactive"

    ];


    if (
        !validStatuses.includes(
            status
        )
    ) {

        setFormError(
            driverStatusInput,
            driverStatusError,
            "Please select a valid status."
        );

        isValid =
            false;

    }


    return {

        isValid,

        data: {

            driverId,

            fullName,

            phone,

            licenseNumber,

            licenseExpiry,

            status

        }

    };

}


// ============================================================
// SUBMIT DRIVER FORM
// ============================================================

async function submitDriverForm(
    event
) {

    event.preventDefault();


    if (
        isSavingDriver
    ) {

        return;

    }


    const validation =
        validateDriverForm();


    if (!validation.isValid) {

        focusFirstError();

        return;

    }


    const payload =
        validation.data;


    isSavingDriver =
        true;


    setSaveButtonLoading(
        true
    );


    try {

        let response;


        // ----------------------------------------------------
        // EDIT
        // ----------------------------------------------------

        if (editingDriverId) {

            response =
                await fetch(

                    `${DRIVERS_API}/${editingDriverId}`,

                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                fullName:
                                    payload.fullName,

                                phone:
                                    payload.phone,

                                licenseNumber:
                                    payload.licenseNumber,

                                licenseExpiry:
                                    payload.licenseExpiry,

                                status:
                                    payload.status

                            })

                    }

                );

        }


        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        else {

            response =
                await fetch(
                    DRIVERS_API,
                    {

                        method: "POST",

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

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save driver."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to save driver."
            );

        }


        // ----------------------------------------------------
        // CLOSE MODAL
        // ----------------------------------------------------

        closeDriverModal();


        // ----------------------------------------------------
        // REFRESH DATA
        // ----------------------------------------------------

        await loadDrivers();


        // ----------------------------------------------------
        // SUCCESS FEEDBACK
        // ----------------------------------------------------

        showToast(
            editingDriverId
                ? "Driver updated successfully."
                : "Driver created successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Save driver error:",
            error
        );


        showApiError(
            error.message ||
            "Unable to save driver."
        );

    } finally {

        isSavingDriver =
            false;


        setSaveButtonLoading(
            false
        );

    }

}


// ============================================================
// SET SAVE BUTTON LOADING
// ============================================================

function setSaveButtonLoading(
    loading
) {

    if (!saveDriverButton) {

        return;

    }


    saveDriverButton.disabled =
        loading;


    if (saveDriverButtonSpinner) {

        saveDriverButtonSpinner.hidden =
            !loading;

    }


    if (saveDriverButtonText) {

        if (loading) {

            saveDriverButtonText.textContent =
                editingDriverId
                    ? "Saving..."
                    : "Creating...";

        } else {

            saveDriverButtonText.textContent =
                editingDriverId
                    ? "Save Changes"
                    : "Create Driver";

        }

    }

}


// ============================================================
// FOCUS FIRST ERROR
// ============================================================

function focusFirstError() {

    const inputs = [

        driverIdInput,

        fullNameInput,

        phoneInput,

        licenseNumberInput,

        licenseExpiryInput,

        driverStatusInput

    ];


    const firstError =
        inputs.find(
            (input) =>
                input &&
                input.classList.contains(
                    "input-error"
                )
        );


    if (firstError) {

        firstError.focus();

    }

}


// ============================================================
// OPEN DELETE MODAL
// ============================================================

function openDeleteDriverModal(
    driverId
) {

    const driver =
        allDrivers.find(
            (item) =>
                item._id ===
                driverId
        );


    if (!driver) {

        showApiError(
            "The selected driver could not be found."
        );

        return;

    }


    pendingDeleteDriverId =
        driverId;


    if (deleteModalMessage) {

        deleteModalMessage.innerHTML = `

            Are you sure you want to delete

            <strong>
                ${escapeHtml(driver.fullName)}
            </strong>?

            <br>

            This action cannot be undone.

        `;

    }


    if (deleteDriverModal) {

        deleteDriverModal.hidden =
            false;

    }


    document.body.style.overflow =
        "hidden";


    setDeleteButtonLoading(
        false
    );

}


// ============================================================
// CLOSE DELETE MODAL
// ============================================================

function closeDeleteDriverModal() {

    if (
        isDeletingDriver
    ) {

        return;

    }


    if (deleteDriverModal) {

        deleteDriverModal.hidden =
            true;

    }


    document.body.style.overflow =
        "";


    pendingDeleteDriverId =
        null;

}


// ============================================================
// CONFIRM DELETE DRIVER
// ============================================================

async function confirmDeleteDriver() {

    if (
        !pendingDeleteDriverId ||
        isDeletingDriver
    ) {

        return;

    }


    isDeletingDriver =
        true;


    setDeleteButtonLoading(
        true
    );


    try {

        const response =
            await fetch(

                `${DRIVERS_API}/${pendingDeleteDriverId}`,

                {

                    method: "DELETE",

                    cache: "no-store"

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete driver."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to delete driver."
            );

        }


        closeDeleteDriverModal();


        await loadDrivers();


        showToast(
            "Driver deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete driver error:",
            error
        );


        showApiError(
            error.message ||
            "Unable to delete driver."
        );

    } finally {

        isDeletingDriver =
            false;


        setDeleteButtonLoading(
            false
        );

    }

}


// ============================================================
// SET DELETE BUTTON LOADING
// ============================================================

function setDeleteButtonLoading(
    loading
) {

    if (!confirmDeleteButton) {

        return;

    }


    confirmDeleteButton.disabled =
        loading;


    confirmDeleteButton.textContent =
        loading
            ? "Deleting..."
            : "Delete Driver";

}


// ============================================================
// NORMALIZE STATUS
// ============================================================

function normalizeStatus(status) {

    if (!status) {

        return "Available";

    }


    const normalized =
        status
            .trim()
            .toLowerCase();


    const statusMap = {

        "available":
            "Available",

        "on delivery":
            "On Delivery",

        "off duty":
            "Off Duty",

        "inactive":
            "Inactive"

    };


    return (
        statusMap[normalized] ||
        status
    );

}


// ============================================================
// VALIDATE DATE
// ============================================================

function isValidDate(value) {

    if (!value) {

        return false;

    }


    const date =
        new Date(
            value
        );


    return (
        !Number.isNaN(
            date.getTime()
        )
    );

}


// ============================================================
// FORMAT DATE FOR INPUT
// ============================================================

function formatDateForInput(
    value
) {

    if (!value) {

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


    return (
        `${year}-${month}-${day}`
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
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
// API ERROR
// ============================================================

function showApiError(
    message
) {

    showToast(
        message,
        "error"
    );

}


// ============================================================
// TOAST NOTIFICATION
// ============================================================

function showToast(
    message,
    type = "success"
) {

    const existingToast =
        document.getElementById(
            "fleetflowToast"
        );


    if (existingToast) {

        existingToast.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.id =
        "fleetflowToast";


    const isSuccess =
        type === "success";


    toast.style.position =
        "fixed";


    toast.style.right =
        "24px";


    toast.style.bottom =
        "24px";


    toast.style.zIndex =
        "3000";


    toast.style.maxWidth =
        "360px";


    toast.style.padding =
        "13px 17px";


    toast.style.borderRadius =
        "9px";


    toast.style.background =
        isSuccess
            ? "#0f172a"
            : "#dc2626";


    toast.style.color =
        "#ffffff";


    toast.style.fontFamily =
        "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";


    toast.style.fontSize =
        "11px";


    toast.style.fontWeight =
        "600";


    toast.style.boxShadow =
        "0 10px 30px rgba(15, 23, 42, 0.20)";


    toast.style.opacity =
        "0";


    toast.style.transform =
        "translateY(8px)";


    toast.style.transition =
        "opacity 0.2s ease, transform 0.2s ease";


    toast.textContent =
        message;


    document.body.appendChild(
        toast
    );


    requestAnimationFrame(
        () => {

            toast.style.opacity =
                "1";

            toast.style.transform =
                "translateY(0)";

        }
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";


            setTimeout(
                () => {

                    toast.remove();

                },
                220
            );

        },
        3000
    );

}


// ============================================================
// EVENT LISTENERS
// ============================================================


// ============================================================
// SEARCH
// ============================================================

if (driverSearch) {

    driverSearch.addEventListener(
        "input",
        () => {

            applyFilters();

        }
    );

}


// ============================================================
// STATUS FILTER
// ============================================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        () => {

            applyFilters();

        }
    );

}


// ============================================================
// REFRESH
// ============================================================

if (refreshDriversButton) {

    refreshDriversButton.addEventListener(
        "click",
        () => {

            loadDrivers();

        }
    );

}


// ============================================================
// ADD DRIVER BUTTON
// ============================================================

if (createDriverButton) {

    createDriverButton.addEventListener(
        "click",
        () => {

            openAddDriverModal();

        }
    );

}


// ============================================================
// EMPTY STATE ADD DRIVER
// ============================================================

if (emptyCreateButton) {

    emptyCreateButton.addEventListener(
        "click",
        () => {

            openAddDriverModal();

        }
    );

}


// ============================================================
// DRIVER FORM SUBMIT
// ============================================================

if (driverForm) {

    driverForm.addEventListener(
        "submit",
        submitDriverForm
    );

}


// ============================================================
// CLOSE DRIVER MODAL
// ============================================================

if (closeDriverModalButton) {

    closeDriverModalButton.addEventListener(
        "click",
        () => {

            closeDriverModal();

        }
    );

}


if (cancelDriverModalButton) {

    cancelDriverModalButton.addEventListener(
        "click",
        () => {

            closeDriverModal();

        }
    );

}


// ============================================================
// DRIVER MODAL OVERLAY CLICK
// ============================================================

if (driverModal) {

    driverModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                driverModal
            ) {

                closeDriverModal();

            }

        }
    );

}


// ============================================================
// DELETE MODAL BUTTONS
// ============================================================

if (cancelDeleteButton) {

    cancelDeleteButton.addEventListener(
        "click",
        () => {

            closeDeleteDriverModal();

        }
    );

}


if (confirmDeleteButton) {

    confirmDeleteButton.addEventListener(
        "click",
        () => {

            confirmDeleteDriver();

        }
    );

}


// ============================================================
// DELETE MODAL OVERLAY CLICK
// ============================================================

if (deleteDriverModal) {

    deleteDriverModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                deleteDriverModal
            ) {

                closeDeleteDriverModal();

            }

        }
    );

}


// ============================================================
// TABLE ACTIONS
// ============================================================

if (driversTableBody) {

    driversTableBody.addEventListener(
        "click",
        (event) => {

            const actionButton =
                event.target.closest(
                    "[data-action]"
                );


            if (!actionButton) {

                return;

            }


            const action =
                actionButton.dataset.action;


            const driverId =
                actionButton.dataset.id;


            if (!driverId) {

                return;

            }


            // ------------------------------------------------
            // EDIT
            // ------------------------------------------------

            if (
                action === "edit"
            ) {

                openEditDriverModal(
                    driverId
                );

            }


            // ------------------------------------------------
            // DELETE
            // ------------------------------------------------

            if (
                action === "delete"
            ) {

                openDeleteDriverModal(
                    driverId
                );

            }

        }
    );

}


// ============================================================
// INPUT VALIDATION EVENTS
// ============================================================


// ============================================================
// CLEAR DRIVER ID ERROR
// ============================================================

if (driverIdInput) {

    driverIdInput.addEventListener(
        "input",
        () => {

            driverIdInput.classList.remove(
                "input-error"
            );


            if (driverIdError) {

                driverIdError.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// CLEAR FULL NAME ERROR
// ============================================================

if (fullNameInput) {

    fullNameInput.addEventListener(
        "input",
        () => {

            fullNameInput.classList.remove(
                "input-error"
            );


            if (fullNameError) {

                fullNameError.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// CLEAR PHONE ERROR
// ============================================================

if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        () => {

            phoneInput.classList.remove(
                "input-error"
            );


            if (phoneError) {

                phoneError.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// CLEAR LICENSE ERROR
// ============================================================

if (licenseNumberInput) {

    licenseNumberInput.addEventListener(
        "input",
        () => {

            licenseNumberInput.classList.remove(
                "input-error"
            );


            if (licenseNumberError) {

                licenseNumberError.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// CLEAR EXPIRY ERROR
// ============================================================

if (licenseExpiryInput) {

    licenseExpiryInput.addEventListener(
        "change",
        () => {

            licenseExpiryInput.classList.remove(
                "input-error"
            );


            if (licenseExpiryError) {

                licenseExpiryError.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// CLEAR STATUS ERROR
// ============================================================

if (driverStatusInput) {

    driverStatusInput.addEventListener(
        "change",
        () => {

            driverStatusInput.classList.remove(
                "input-error"
            );


            if (driverStatusError) {

                driverStatusError.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            driverModal &&
            !driverModal.hidden
        ) {

            closeDriverModal();

            return;

        }


        if (
            deleteDriverModal &&
            !deleteDriverModal.hidden
        ) {

            closeDeleteDriverModal();

        }

    }
);


// ============================================================
// PAGE RESTORE / BACK BUTTON PROTECTION
// ============================================================

window.addEventListener(
    "pageshow",
    () => {

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


        document.documentElement.classList.remove(
            "auth-locked"
        );


        initializeTopbarUser();

        loadDrivers();

    }
);


// ============================================================
// PAGE HIDE
// ============================================================

window.addEventListener(
    "pagehide",
    () => {

        const isLoggedIn =
            localStorage.getItem(
                "fleetflowLoggedIn"
            );


        if (
            isLoggedIn !== "true"
        ) {

            document.documentElement.classList.add(
                "auth-locked"
            );

        }

    }
);


// ============================================================
// INITIAL PAGE SETUP
// ============================================================

initializeTopbarUser();

loadDrivers();
// ============================================================
// FLEETFLOW CUSTOMERS
// ============================================================
//
// Purpose:
// - Display customers
// - Search customers
// - Filter customers
// - Add customer
// - Edit customer
// - Delete customer
// - Connect to FleetFlow Customer API
//
// API:
//
// GET    /api/customers
// GET    /api/customers/:id
// POST   /api/customers
// PUT    /api/customers/:id
// DELETE /api/customers/:id
//
// ============================================================


"use strict";


// ============================================================
// AUTH GUARD
// ============================================================

(function checkAuthentication() {

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

})();


// ============================================================
// API
// ============================================================

const CUSTOMERS_API =
    "/api/customers";


// ============================================================
// STATE
// ============================================================

let allCustomers = [];

let filteredCustomers = [];

let editingCustomerId = null;

let deletingCustomerId = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const tableBody =
    document.getElementById(
        "customers-table-body"
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
        "customer-search"
    );


const statusFilter =
    document.getElementById(
        "status-filter"
    );


const refreshButton =
    document.getElementById(
        "refresh-btn"
    );


const retryButton =
    document.getElementById(
        "retry-btn"
    );


const addCustomerButton =
    document.getElementById(
        "add-customer-btn"
    );


// ============================================================
// SUMMARY ELEMENTS
// ============================================================

const totalCustomers =
    document.getElementById(
        "total-customers"
    );


const activeCustomers =
    document.getElementById(
        "active-customers"
    );


const inactiveCustomers =
    document.getElementById(
        "inactive-customers"
    );


const contactCustomers =
    document.getElementById(
        "contact-customers"
    );


// ============================================================
// CUSTOMER MODAL
// ============================================================

const customerModal =
    document.getElementById(
        "customer-modal"
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


const customerForm =
    document.getElementById(
        "customer-form"
    );


const saveCustomerButton =
    document.getElementById(
        "save-customer-btn"
    );


const formError =
    document.getElementById(
        "form-error"
    );


// ============================================================
// FORM FIELDS
// ============================================================

const customerIdInput =
    document.getElementById(
        "customer-id"
    );


const companyNameInput =
    document.getElementById(
        "company-name"
    );


const contactPersonInput =
    document.getElementById(
        "contact-person"
    );


const phoneInput =
    document.getElementById(
        "phone"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const addressInput =
    document.getElementById(
        "address"
    );


const customerStatusInput =
    document.getElementById(
        "customer-status"
    );


// ============================================================
// DELETE MODAL
// ============================================================

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

        setupEventListeners();

        updateTopbarUser();

        loadCustomers();

    }
);


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {


    // ========================================================
    // SEARCH
    // ========================================================

    searchInput.addEventListener(
        "input",
        applyFilters
    );


    // ========================================================
    // STATUS FILTER
    // ========================================================

    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    // ========================================================
    // REFRESH
    // ========================================================

    refreshButton.addEventListener(
        "click",
        loadCustomers
    );


    // ========================================================
    // RETRY
    // ========================================================

    retryButton.addEventListener(
        "click",
        loadCustomers
    );


    // ========================================================
    // ADD CUSTOMER
    // ========================================================

    addCustomerButton.addEventListener(
        "click",
        openAddModal
    );


    // ========================================================
    // CLOSE MODAL
    // ========================================================

    modalCloseButton.addEventListener(
        "click",
        closeCustomerModal
    );


    cancelButton.addEventListener(
        "click",
        closeCustomerModal
    );


    // ========================================================
    // FORM SUBMIT
    // ========================================================

    customerForm.addEventListener(
        "submit",
        handleCustomerSubmit
    );


    // ========================================================
    // DELETE MODAL
    // ========================================================

    deleteCancelButton.addEventListener(
        "click",
        closeDeleteModal
    );


    deleteConfirmButton.addEventListener(
        "click",
        confirmDeleteCustomer
    );


    // ========================================================
    // OVERLAY CLICK
    // ========================================================

    customerModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                customerModal
            ) {

                closeCustomerModal();

            }

        }
    );


    deleteModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                deleteModal
            ) {

                closeDeleteModal();

            }

        }
    );


    // ========================================================
    // ESCAPE KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeCustomerModal();

                closeDeleteModal();

            }

        }
    );

}


// ============================================================
// LOAD CUSTOMERS
// ============================================================

async function loadCustomers() {

    showLoadingState();


    try {

        const response =
            await fetch(
                CUSTOMERS_API,
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
                "Unable to load customers."
            );

        }


        allCustomers =
            Array.isArray(
                data.customers
            )
                ? data.customers
                : [];


        applyFilters();

    } catch (error) {

        console.error(
            "FleetFlow customers error:",
            error
        );


        showErrorState(
            error.message ||
            "Unable to load customers."
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


    filteredCustomers =
        allCustomers.filter(
            (customer) => {


                // ==============================================
                // SEARCH
                // ==============================================

                const matchesSearch =
                    !search ||

                    String(
                        customer.customerId ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        customer.companyName ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        customer.contactPerson ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        customer.phone ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        customer.email ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search);


                // ==============================================
                // STATUS
                // ==============================================

                const matchesStatus =
                    selectedStatus === "all" ||
                    customer.status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    updateSummary();

    renderCustomers();

}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateSummary() {

    const total =
        allCustomers.length;


    const active =
        allCustomers.filter(
            customer =>
                customer.status ===
                "Active"
        ).length;


    const inactive =
        allCustomers.filter(
            customer =>
                customer.status ===
                "Inactive"
        ).length;


    const contacts =
        allCustomers.filter(
            customer =>
                customer.contactPerson
        ).length;


    totalCustomers.textContent =
        total;


    activeCustomers.textContent =
        active;


    inactiveCustomers.textContent =
        inactive;


    contactCustomers.textContent =
        contacts;

}


// ============================================================
// RENDER CUSTOMERS
// ============================================================

function renderCustomers() {

    hideAllStates();

    tableBody.innerHTML = "";


    if (
        filteredCustomers.length === 0
    ) {

        emptyState.hidden = false;

        return;

    }


    filteredCustomers.forEach(
        (customer) => {

            const row =
                createCustomerRow(
                    customer
                );


            tableBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// CREATE CUSTOMER ROW
// ============================================================

function createCustomerRow(
    customer
) {

    const row =
        document.createElement(
            "tr"
        );


    const statusClass =
        getStatusClass(
            customer.status
        );


    row.innerHTML = `

        <td>

            <span class="customer-id">
                ${escapeHtml(
                    customer.customerId ||
                    "-"
                )}
            </span>

        </td>


        <td>

            <div class="company-info">

                <div class="company-icon">
                    🏢
                </div>

                <div class="company-name">

                    <strong>
                        ${escapeHtml(
                            customer.companyName ||
                            "-"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            customer.address ||
                            "-"
                        )}
                    </span>

                </div>

            </div>

        </td>


        <td>

            <span class="contact-person">
                ${escapeHtml(
                    customer.contactPerson ||
                    "-"
                )}
            </span>

        </td>


        <td>

            <span class="phone-number">
                ${escapeHtml(
                    customer.phone ||
                    "-"
                )}
            </span>

        </td>


        <td>

            <span
                class="email-address"
                title="${escapeHtml(
                    customer.email ||
                    "-"
                )}"
            >
                ${escapeHtml(
                    customer.email ||
                    "-"
                )}
            </span>

        </td>


        <td>

            <span
                class="status-badge ${statusClass}"
            >
                ${escapeHtml(
                    customer.status ||
                    "Inactive"
                )}
            </span>

        </td>


        <td>

            <div class="actions">

                <button
                    type="button"
                    class="action-btn"
                    title="Edit customer"
                    data-action="edit"
                    data-id="${customer._id}"
                >
                    ✏️
                </button>


                <button
                    type="button"
                    class="action-btn delete"
                    title="Delete customer"
                    data-action="delete"
                    data-id="${customer._id}"
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
                customer._id
            );

        }
    );


    deleteButton.addEventListener(
        "click",
        () => {

            openDeleteModal(
                customer
            );

        }
    );


    return row;

}


// ============================================================
// STATUS CLASS
// ============================================================

function getStatusClass(
    status
) {

    switch (status) {

        case "Active":
            return "status-active";

        case "Inactive":
            return "status-inactive";

        default:
            return "status-inactive";

    }

}


// ============================================================
// OPEN ADD MODAL
// ============================================================

function openAddModal() {

    editingCustomerId = null;


    customerForm.reset();


    modalTitle.textContent =
        "Add Customer";


    modalDescription.textContent =
        "Add a new customer to FleetFlow.";


    saveCustomerButton.textContent =
        "Save Customer";


    customerStatusInput.value =
        "Active";


    hideFormError();


    customerModal.hidden =
        false;


    setTimeout(
        () => {

            customerIdInput.focus();

        },
        50
    );

}


// ============================================================
// OPEN EDIT MODAL
// ============================================================

async function openEditModal(
    customerId
) {

    try {

        const response =
            await fetch(
                `${CUSTOMERS_API}/${customerId}`,
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
                "Unable to load customer."
            );

        }


        const customer =
            data.customer;


        if (!customer) {

            throw new Error(
                "Customer not found."
            );

        }


        editingCustomerId =
            customer._id;


        modalTitle.textContent =
            "Edit Customer";


        modalDescription.textContent =
            "Update the customer information.";


        saveCustomerButton.textContent =
            "Update Customer";


        customerIdInput.value =
            customer.customerId ||
            "";


        companyNameInput.value =
            customer.companyName ||
            "";


        contactPersonInput.value =
            customer.contactPerson ||
            "";


        phoneInput.value =
            customer.phone ||
            "";


        emailInput.value =
            customer.email ||
            "";


        addressInput.value =
            customer.address ||
            "";


        customerStatusInput.value =
            customer.status ||
            "Active";


        hideFormError();


        customerModal.hidden =
            false;


        setTimeout(
            () => {

                customerIdInput.focus();

            },
            50
        );

    } catch (error) {

        console.error(
            "Edit customer error:",
            error
        );


        alert(
            error.message ||
            "Unable to load customer."
        );

    }

}


// ============================================================
// CLOSE CUSTOMER MODAL
// ============================================================

function closeCustomerModal() {

    customerModal.hidden =
        true;


    editingCustomerId =
        null;


    customerForm.reset();


    hideFormError();

}


// ============================================================
// HANDLE CUSTOMER SUBMIT
// ============================================================

async function handleCustomerSubmit(
    event
) {

    event.preventDefault();


    hideFormError();


    // ========================================================
    // GET FORM VALUES
    // ========================================================

    const customerId =
        customerIdInput.value
            .trim()
            .toUpperCase();


    const companyName =
        companyNameInput.value
            .trim();


    const contactPerson =
        contactPersonInput.value
            .trim();


    const phone =
        phoneInput.value
            .trim();


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const address =
        addressInput.value
            .trim();


    const status =
        customerStatusInput.value;


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!customerId) {

        showFormError(
            "Customer ID is required."
        );

        customerIdInput.focus();

        return;

    }


    if (!companyName) {

        showFormError(
            "Company name is required."
        );

        companyNameInput.focus();

        return;

    }


    if (!contactPerson) {

        showFormError(
            "Contact person is required."
        );

        contactPersonInput.focus();

        return;

    }


    if (!phone) {

        showFormError(
            "Phone number is required."
        );

        phoneInput.focus();

        return;

    }


    if (!email) {

        showFormError(
            "Email is required."
        );

        emailInput.focus();

        return;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        showFormError(
            "Please enter a valid email address."
        );

        emailInput.focus();

        return;

    }


    if (!address) {

        showFormError(
            "Address is required."
        );

        addressInput.focus();

        return;

    }


    if (
        !["Active", "Inactive"]
            .includes(status)
    ) {

        showFormError(
            "Please select a valid customer status."
        );

        customerStatusInput.focus();

        return;

    }


    // ========================================================
    // PAYLOAD
    // ========================================================

    const payload = {

        customerId,

        companyName,

        contactPerson,

        phone,

        email,

        address,

        status

    };


    setSaveButtonLoading(
        true
    );


    try {

        const isEditing =
            Boolean(
                editingCustomerId
            );


        const url =
            isEditing
                ? `${CUSTOMERS_API}/${editingCustomerId}`
                : CUSTOMERS_API;


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
                "Unable to save customer."
            );

        }


        closeCustomerModal();


        await loadCustomers();

    } catch (error) {

        console.error(
            "Save customer error:",
            error
        );


        showFormError(
            error.message ||
            "Unable to save customer."
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

    saveCustomerButton.disabled =
        loading;


    if (loading) {

        saveCustomerButton.textContent =
            editingCustomerId
                ? "Updating..."
                : "Saving...";

    } else {

        saveCustomerButton.textContent =
            editingCustomerId
                ? "Update Customer"
                : "Save Customer";

    }

}


// ============================================================
// OPEN DELETE MODAL
// ============================================================

function openDeleteModal(
    customer
) {

    deletingCustomerId =
        customer._id;


    deleteMessage.textContent =
        `Are you sure you want to delete ${customer.companyName || customer.customerId}? This action cannot be undone.`;


    deleteModal.hidden =
        false;

}


// ============================================================
// CLOSE DELETE MODAL
// ============================================================

function closeDeleteModal() {

    deleteModal.hidden =
        true;


    deletingCustomerId =
        null;

}


// ============================================================
// CONFIRM DELETE
// ============================================================

async function confirmDeleteCustomer() {

    if (
        !deletingCustomerId
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
                `${CUSTOMERS_API}/${deletingCustomerId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete customer."
            );

        }


        closeDeleteModal();


        await loadCustomers();

    } catch (error) {

        console.error(
            "Delete customer error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete customer."
        );

    } finally {

        deleteConfirmButton.disabled =
            false;


        deleteConfirmButton.textContent =
            "Delete Customer";

    }

}


// ============================================================
// LOADING STATE
// ============================================================

function showLoadingState() {

    tableBody.innerHTML = "";


    hideAllStates();


    loadingState.hidden =
        false;

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


    errorState.hidden =
        false;

}


// ============================================================
// HIDE STATES
// ============================================================

function hideAllStates() {

    loadingState.hidden =
        true;


    emptyState.hidden =
        true;


    errorState.hidden =
        true;

}


// ============================================================
// FORM ERROR
// ============================================================

function showFormError(
    message
) {

    formError.textContent =
        message;


    formError.hidden =
        false;

}


function hideFormError() {

    formError.textContent =
        "";


    formError.hidden =
        true;

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
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

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
// END OF CUSTOMERS.JS
// ============================================================
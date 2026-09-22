// ============================================================
// FLEETFLOW DASHBOARD
//
// Purpose:
// - Authenticate user
// - Display logged-in user
// - Display current date
// - Fetch REAL delivery data from MongoDB
// - Display real delivery statistics
// - Display real recent deliveries
// - Display real delivery status distribution
// - Update donut chart dynamically
// - Connect dashboard quick actions
//
// Backend:
//
// GET /api/deliveries
// ============================================================


(function () {

    "use strict";


    // ========================================================
    // IMMEDIATE AUTHENTICATION GUARD
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

    const DELIVERIES_API =
        "/api/deliveries";


    // ========================================================
    // STATE
    // ========================================================

    let deliveries = [];


    // ========================================================
    // ELEMENTS
    // ========================================================


    // --------------------------------------------------------
    // Topbar
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Welcome
    // --------------------------------------------------------

    const welcomeMessage =
        document.getElementById(
            "welcomeMessage"
        );


    // --------------------------------------------------------
    // Date
    // --------------------------------------------------------

    const currentDate =
        document.getElementById(
            "currentDate"
        );


    // --------------------------------------------------------
    // Statistics
    // --------------------------------------------------------

    const totalDeliveries =
        document.getElementById(
            "totalDeliveries"
        );

    const pendingDeliveries =
        document.getElementById(
            "pendingDeliveries"
        );

    const transitDeliveries =
        document.getElementById(
            "transitDeliveries"
        );

    const deliveredDeliveries =
        document.getElementById(
            "deliveredDeliveries"
        );


    // --------------------------------------------------------
    // Recent Deliveries
    // --------------------------------------------------------

    const recentDeliveries =
        document.getElementById(
            "recentDeliveries"
        );


    // --------------------------------------------------------
    // Status Chart
    // --------------------------------------------------------

    const donutChart =
        document.querySelector(
            ".donut-chart"
        );

    const donutCenter =
        document.querySelector(
            ".donut-center"
        );


    // --------------------------------------------------------
    // Status rows
    // --------------------------------------------------------

    const statusRows =
        document.querySelectorAll(
            ".status-card .status-row"
        );


    // --------------------------------------------------------
    // Quick actions
    // --------------------------------------------------------

    const newDeliveryButton =
        document.getElementById(
            "newDeliveryButton"
        );

    const quickDelivery =
        document.getElementById(
            "quickDelivery"
        );

    const quickCustomer =
        document.getElementById(
            "quickCustomer"
        );

    const quickDriver =
        document.getElementById(
            "quickDriver"
        );

    const viewDeliveriesButton =
        document.getElementById(
            "viewDeliveriesButton"
        );


    // ========================================================
    // GET AUTHENTICATED USER
    // ========================================================

    function getAuthenticatedUser() {

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


            return null;

        }


        try {

            return JSON.parse(
                user
            );

        } catch (error) {

            console.error(
                "Invalid stored user:",
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

        return;

    }


    // ========================================================
    // DISPLAY USER
    // ========================================================

    function getInitials(
        name
    ) {

        if (!name) {

            return "A";

        }


        const words =
            name
                .trim()
                .split(/\s+/);


        if (
            words.length === 1
        ) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0][0] +
            words[
                words.length - 1
            ][0]
        ).toUpperCase();

    }


    const displayName =
        currentUser.fullName ||
        currentUser.name ||
        currentUser.username ||
        "Admin";


    const displayRole =
        currentUser.role ||
        "Dispatcher";


    if (
        topbarUserName
    ) {

        topbarUserName.textContent =
            displayName;

    }


    if (
        topbarUserRole
    ) {

        topbarUserRole.textContent =
            formatRole(
                displayRole
            );

    }


    if (
        topbarAvatar
    ) {

        topbarAvatar.textContent =
            getInitials(
                displayName
            );

    }


    if (
        welcomeMessage
    ) {

        welcomeMessage.textContent =
            `Welcome back, ${displayName}.`;

    }


    // ========================================================
    // FORMAT ROLE
    // ========================================================

    function formatRole(
        role
    ) {

        if (!role) {

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
    // CURRENT DATE
    // ========================================================

    function updateDate() {

        if (!currentDate) {

            return;

        }


        currentDate.textContent =
            new Date().toLocaleDateString(
                "en-PH",
                {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );

    }


    updateDate();


    // ========================================================
    // FETCH JSON
    // ========================================================

    async function fetchJson(
        url
    ) {

        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const text =
            await response.text();


        let result = {};


        if (text) {

            try {

                result =
                    JSON.parse(
                        text
                    );

            } catch (error) {

                console.error(
                    "Invalid JSON:",
                    text
                );


                throw new Error(
                    "Server returned an invalid response."
                );

            }

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                `Request failed with HTTP ${response.status}.`
            );

        }


        return result;

    }


    // ========================================================
    // EXTRACT DELIVERY ARRAY
    // ========================================================

    function extractDeliveries(
        result
    ) {

        // ----------------------------------------------------
        // Direct array
        // ----------------------------------------------------

        if (
            Array.isArray(
                result
            )
        ) {

            return result;

        }


        // ----------------------------------------------------
        // data: []
        // ----------------------------------------------------

        if (
            result &&
            Array.isArray(
                result.data
            )
        ) {

            return result.data;

        }


        // ----------------------------------------------------
        // deliveries: []
        // ----------------------------------------------------

        if (
            result &&
            Array.isArray(
                result.deliveries
            )
        ) {

            return result.deliveries;

        }


        // ----------------------------------------------------
        // data: {
        //     deliveries: []
        // }
        // ----------------------------------------------------

        if (
            result &&
            result.data &&
            Array.isArray(
                result.data.deliveries
            )
        ) {

            return result.data.deliveries;

        }


        return [];

    }


    // ========================================================
    // LOAD REAL DELIVERIES
    // ========================================================

    async function loadDashboardData() {

        console.log(
            "========================================"
        );

        console.log(
            "FLEETFLOW DASHBOARD"
        );

        console.log(
            "Fetching REAL delivery data..."
        );

        console.log(
            "GET",
            DELIVERIES_API
        );

        console.log(
            "========================================"
        );


        try {

            const result =
                await fetchJson(
                    DELIVERIES_API
                );


            deliveries =
                extractDeliveries(
                    result
                );


            console.log(
                "REAL deliveries:",
                deliveries
            );


            // ------------------------------------------------
            // Update every dashboard section
            // ------------------------------------------------

            updateStatistics();

            renderRecentDeliveries();

            updateStatusChart();


        } catch (error) {

            console.error(
                "❌ Dashboard delivery loading failed:",
                error
            );


            showDashboardError();

        }

    }


    // ========================================================
    // UPDATE TOP STATISTICS
    // ========================================================

    function updateStatistics() {

        const total =
            deliveries.length;


        const pending =
            countStatus(
                "Pending"
            );


        const inTransit =
            countStatus(
                "In Transit"
            );


        const delivered =
            countStatus(
                "Delivered"
            );


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
            transitDeliveries
        ) {

            transitDeliveries.textContent =
                inTransit;

        }


        if (
            deliveredDeliveries
        ) {

            deliveredDeliveries.textContent =
                delivered;

        }


        // ----------------------------------------------------
        // Update percentages
        // ----------------------------------------------------

        updateStatPercentages(
            total,
            pending,
            inTransit,
            delivered
        );

    }


    // ========================================================
    // COUNT STATUS
    // ========================================================

    function countStatus(
        status
    ) {

        return deliveries.filter(
            function (delivery) {

                return (
                    delivery.status ===
                    status
                );

            }
        ).length;

    }


    // ========================================================
    // UPDATE STAT CARD PERCENTAGES
    // ========================================================

    function updateStatPercentages(
        total,
        pending,
        inTransit,
        delivered
    ) {

        const statCards =
            document.querySelectorAll(
                ".stats-grid .stat-card"
            );


        if (
            statCards.length < 4
        ) {

            return;

        }


        // ----------------------------------------------------
        // Pending
        // ----------------------------------------------------

        const pendingPercent =
            calculatePercentage(
                pending,
                total
            );


        const pendingFooter =
            statCards[1].querySelector(
                ".stat-footer"
            );


        if (
            pendingFooter
        ) {

            pendingFooter.innerHTML = `

                <span>
                    ${pendingPercent}%
                </span>

                <span>
                    of total
                </span>

            `;

        }


        // ----------------------------------------------------
        // In Transit
        // ----------------------------------------------------

        const transitPercent =
            calculatePercentage(
                inTransit,
                total
            );


        const transitFooter =
            statCards[2].querySelector(
                ".stat-footer"
            );


        if (
            transitFooter
        ) {

            transitFooter.innerHTML = `

                <span>
                    ${transitPercent}%
                </span>

                <span>
                    of total
                </span>

            `;

        }


        // ----------------------------------------------------
        // Delivered
        // ----------------------------------------------------

        const deliveredPercent =
            calculatePercentage(
                delivered,
                total
            );


        const deliveredFooter =
            statCards[3].querySelector(
                ".stat-footer"
            );


        if (
            deliveredFooter
        ) {

            deliveredFooter.innerHTML = `

                <span>
                    ${deliveredPercent}%
                </span>

                <span>
                    completion rate
                </span>

            `;

        }


        // ----------------------------------------------------
        // Total
        //
        // We cannot calculate the old "vs last week"
        // value because there is currently no historical
        // delivery dataset.
        // ----------------------------------------------------

        const totalFooter =
            statCards[0].querySelector(
                ".stat-footer"
            );


        if (
            totalFooter
        ) {

            totalFooter.innerHTML = `

                <span>
                    ${total}
                </span>

                <span>
                    current records
                </span>

            `;

        }

    }


    // ========================================================
    // CALCULATE PERCENTAGE
    // ========================================================

    function calculatePercentage(
        value,
        total
    ) {

        if (
            !total
        ) {

            return 0;

        }


        return Math.round(
            (
                value /
                total
            ) * 100
        );

    }


    // ========================================================
    // RECENT DELIVERIES
    // ========================================================
    //
    // Uses REAL delivery records.
    //
    // Shows the latest 5 records.
    //
    // Sorted by scheduledDate / createdAt.
    //
    // ========================================================

    function renderRecentDeliveries() {

        if (
            !recentDeliveries
        ) {

            return;

        }


        recentDeliveries.innerHTML =
            "";


        if (
            deliveries.length === 0
        ) {

            recentDeliveries.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        style="
                            text-align:center;
                            padding:30px;
                            color:#94a3b8;
                        "
                    >

                        No deliveries found.

                    </td>

                </tr>

            `;


            return;

        }


        // ----------------------------------------------------
        // Copy array so original state isn't changed.
        // ----------------------------------------------------

        const recent =
            [...deliveries]
                .sort(
                    function (a, b) {

                        const dateA =
                            getDeliveryTimestamp(
                                a
                            );

                        const dateB =
                            getDeliveryTimestamp(
                                b
                            );


                        return dateB -
                            dateA;

                    }
                )
                .slice(
                    0,
                    5
                );


        recent.forEach(
            function (delivery) {

                const customer =
                    normalizeReference(
                        delivery.customer
                    );


                const customerName =
                    customer.companyName ||
                    customer.contactPerson ||
                    "Unknown Customer";


                const pickup =
                    delivery.pickupAddress ||
                    "Unknown";


                const destination =
                    delivery.deliveryAddress ||
                    "Unknown";


                const status =
                    delivery.status ||
                    "Pending";


                const statusClass =
                    getDashboardStatusClass(
                        status
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <strong>
                            ${escapeHtml(
                                delivery.deliveryId ||
                                "—"
                            )}
                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                            customerName
                        )}

                    </td>


                    <td>

                        ${escapeHtml(
                            pickup
                        )}

                        →

                        ${escapeHtml(
                            destination
                        )}

                    </td>


                    <td>

                        <span
                            class="status ${statusClass}"
                        >

                            ${escapeHtml(
                                status
                            )}

                        </span>

                    </td>

                `;


                recentDeliveries.appendChild(
                    row
                );

            }
        );

    }


    // ========================================================
    // DELIVERY TIMESTAMP
    // ========================================================

    function getDeliveryTimestamp(
        delivery
    ) {

        const value =
            delivery.scheduledDate ||
            delivery.createdAt;


        if (!value) {

            return 0;

        }


        const timestamp =
            new Date(
                value
            ).getTime();


        return Number.isNaN(
            timestamp
        )
            ? 0
            : timestamp;

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
    // STATUS CLASS
    // ========================================================

    function getDashboardStatusClass(
        status
    ) {

        switch (
            status
        ) {

            case "In Transit":

                return "in-transit";


            case "Delivered":

                return "delivered";


            case "Pending":

                return "pending";


            case "Assigned":

                return "assigned";


            case "Cancelled":

                return "cancelled";


            default:

                return "pending";

        }

    }


    // ========================================================
    // UPDATE STATUS CHART
    // ========================================================
    //
    // The donut is generated from REAL numbers.
    //
    // Example:
    //
    // Pending     2
    // In Transit  3
    // Delivered   5
    //
    // Total       10
    //
    // ========================================================

    function updateStatusChart() {

        const pending =
            countStatus(
                "Pending"
            );


        const inTransit =
            countStatus(
                "In Transit"
            );


        const delivered =
            countStatus(
                "Delivered"
            );


        const total =
            deliveries.length;


        // ----------------------------------------------------
        // Donut center
        // ----------------------------------------------------

        if (
            donutCenter
        ) {

            donutCenter.innerHTML = `

                <strong>
                    ${total}
                </strong>

                <span>
                    Total
                </span>

            `;

        }


        // ----------------------------------------------------
        // Donut chart
        // ----------------------------------------------------

        if (
            donutChart
        ) {

            const pendingPercent =
                calculatePercentage(
                    pending,
                    total
                );


            const transitPercent =
                calculatePercentage(
                    inTransit,
                    total
                );


            const deliveredPercent =
                calculatePercentage(
                    delivered,
                    total
                );


            const pendingEnd =
                pendingPercent;


            const transitEnd =
                pendingPercent +
                transitPercent;


            if (
                total === 0
            ) {

                donutChart.style.background =
                    "conic-gradient(#e2e8f0 0deg 360deg)";

            } else {

                donutChart.style.background =
                    `conic-gradient(
                        #f59e0b 0% ${pendingEnd}%,
                        #2563eb ${pendingEnd}% ${transitEnd}%,
                        #16a34a ${transitEnd}% 100%
                    )`;

            }

        }


        // ----------------------------------------------------
        // Update status list
        // ----------------------------------------------------

        updateStatusRows(
            pending,
            inTransit,
            delivered
        );

    }


    // ========================================================
    // UPDATE STATUS LIST
    // ========================================================

    function updateStatusRows(
        pending,
        inTransit,
        delivered
    ) {

        if (
            !statusRows ||
            statusRows.length === 0
        ) {

            return;

        }


        const values = [

            pending,

            inTransit,

            delivered

        ];


        statusRows.forEach(
            function (
                row,
                index
            ) {

                if (
                    !values[index] &&
                    values[index] !== 0
                ) {

                    return;

                }


                const value =
                    values[index];


                const strong =
                    row.querySelector(
                        "strong"
                    );


                if (
                    strong
                ) {

                    strong.textContent =
                        value;

                }

            }
        );

    }


    // ========================================================
    // DASHBOARD ERROR
    // ========================================================
    //
    // Never show fake numbers when the backend fails.
    //
    // ========================================================

    function showDashboardError() {

        if (
            totalDeliveries
        ) {

            totalDeliveries.textContent =
                "--";

        }


        if (
            pendingDeliveries
        ) {

            pendingDeliveries.textContent =
                "--";

        }


        if (
            transitDeliveries
        ) {

            transitDeliveries.textContent =
                "--";

        }


        if (
            deliveredDeliveries
        ) {

            deliveredDeliveries.textContent =
                "--";

        }


        // ----------------------------------------------------
        // Recent deliveries
        // ----------------------------------------------------

        if (
            recentDeliveries
        ) {

            recentDeliveries.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        style="
                            text-align:center;
                            padding:30px;
                            color:#dc2626;
                        "
                    >

                        Unable to load delivery data.

                    </td>

                </tr>

            `;

        }


        // ----------------------------------------------------
        // Donut
        // ----------------------------------------------------

        if (
            donutCenter
        ) {

            donutCenter.innerHTML = `

                <strong>
                    --
                </strong>

                <span>
                    Total
                </span>

            `;

        }


        if (
            donutChart
        ) {

            donutChart.style.background =
                "conic-gradient(#e2e8f0 0deg 360deg)";

        }


        // ----------------------------------------------------
        // Status rows
        // ----------------------------------------------------

        statusRows.forEach(
            function (row) {

                const strong =
                    row.querySelector(
                        "strong"
                    );


                if (
                    strong
                ) {

                    strong.textContent =
                        "--";

                }

            }
        );

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


        return String(
            value
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


    // ========================================================
    // QUICK ACTIONS
    // ========================================================


    // --------------------------------------------------------
    // New Delivery
    // --------------------------------------------------------

    function openDeliveriesPage() {

        window.location.href =
            "/pages/deliveries.html";

    }


    if (
        newDeliveryButton
    ) {

        newDeliveryButton.addEventListener(
            "click",
            openDeliveriesPage
        );

    }


    if (
        quickDelivery
    ) {

        quickDelivery.addEventListener(
            "click",
            openDeliveriesPage
        );

    }


    // --------------------------------------------------------
    // Customers
    // --------------------------------------------------------

    if (
        quickCustomer
    ) {

        quickCustomer.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/pages/customers.html";

            }
        );

    }


    // --------------------------------------------------------
    // Drivers
    // --------------------------------------------------------

    if (
        quickDriver
    ) {

        quickDriver.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/pages/drivers.html";

            }
        );

    }


    // --------------------------------------------------------
    // View all deliveries
    // --------------------------------------------------------

    if (
        viewDeliveriesButton
    ) {

        viewDeliveriesButton.addEventListener(
            "click",
            openDeliveriesPage
        );

    }


    // ========================================================
    // PAGE SHOW AUTHENTICATION CHECK
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


                return;

            }


            document.documentElement.classList.remove(
                "auth-locked"
            );

        }
    );


    // ========================================================
    // INITIALIZE DASHBOARD
    // ========================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            updateDate();

            loadDashboardData();

        }
    );


})();
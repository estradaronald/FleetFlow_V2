// ============================================================
// FLEETFLOW SIDEBAR
// ============================================================


// ============================================================
// LOAD SIDEBAR COMPONENT
// ============================================================

async function loadSidebar() {

    const container =
        document.getElementById(
            "sidebar-container"
        );


    if (!container) {

        console.error(
            "Sidebar container not found."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/components/sidebar.html",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Sidebar failed to load: ${response.status}`
            );

        }


        const sidebarHTML =
            await response.text();


        if (!sidebarHTML.trim()) {

            throw new Error(
                "Sidebar HTML is empty."
            );

        }


        container.innerHTML =
            sidebarHTML;


        initializeSidebar();

    } catch (error) {

        console.error(
            "FleetFlow sidebar error:",
            error
        );

    }

}


// ============================================================
// INITIALIZE SIDEBAR
// ============================================================

function initializeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (!sidebar) {

        console.error(
            "Sidebar element not found after loading."
        );

        return;

    }


    // --------------------------------------------------------
    // USER
    // --------------------------------------------------------

    const storedUser =
        localStorage.getItem(
            "fleetflowUser"
        );


    let currentUser = null;


    if (storedUser) {

        try {

            currentUser =
                JSON.parse(
                    storedUser
                );

        } catch (error) {

            console.error(
                "Invalid stored user data.",
                error
            );

            localStorage.removeItem(
                "fleetflowUser"
            );

        }

    }


    if (currentUser) {

        updateSidebarUser(
            currentUser
        );

    }


    // --------------------------------------------------------
    // ACTIVE PAGE
    // --------------------------------------------------------

    setActivePage();


    // --------------------------------------------------------
    // MOBILE MENU
    // --------------------------------------------------------

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );


    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            openSidebar
        );

    }


    // --------------------------------------------------------
    // OVERLAY
    // --------------------------------------------------------

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    // --------------------------------------------------------
    // LOGOUT BUTTON
    // --------------------------------------------------------

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {

        console.error(
            "FleetFlow: Logout button not found."
        );

    } else {

        console.log(
            "FleetFlow: Logout button connected."
        );

    }


    // --------------------------------------------------------
    // NAVIGATION
    // --------------------------------------------------------

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    closeSidebar();

                }
            );

        }
    );

}


// ============================================================
// GLOBAL LOGOUT CLICK HANDLER
// ============================================================
//
// The sidebar is loaded dynamically, so the logout listener
// is attached to the document instead of the button itself.
//
// This guarantees that the button works after sidebar.html
// has been injected into the page.
// ============================================================

document.addEventListener(
    "click",
    (event) => {

        const logoutButton =
            event.target.closest(
                "#logoutButton"
            );


        if (!logoutButton) {

            return;

        }


        event.preventDefault();

        event.stopPropagation();


        handleLogout();

    }
);


// ============================================================
// UPDATE USER
// ============================================================

function updateSidebarUser(user) {

    const userName =
        document.getElementById(
            "sidebarUserName"
        );

    const userRole =
        document.getElementById(
            "sidebarUserRole"
        );

    const avatar =
        document.getElementById(
            "sidebarAvatar"
        );


    const displayName =
        user.fullName ||
        user.username ||
        "Admin";


    const displayRole =
        user.role ||
        "Dispatcher";


    if (userName) {

        userName.textContent =
            displayName;

    }


    if (userRole) {

        userRole.textContent =
            displayRole;

    }


    if (avatar) {

        avatar.textContent =
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
// ACTIVE PAGE
// ============================================================

function setActivePage() {

    const currentPath =
        window.location.pathname
            .toLowerCase();


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        (item) => {

            item.classList.remove(
                "active"
            );


            const page =
                item.dataset.page;


            if (!page) {

                return;

            }


            if (
                currentPath.includes(
                    `${page}.html`
                )
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );

}


// ============================================================
// OPEN SIDEBAR
// ============================================================

function openSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "active"
        );

    }

}


// ============================================================
// CLOSE SIDEBAR
// ============================================================

function closeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }

}


// ============================================================
// LOGOUT
// ============================================================

async function handleLogout() {

    console.log(
        "FleetFlow: Logging out..."
    );


    // --------------------------------------------------------
    // LOCK CURRENT PAGE IMMEDIATELY
    // --------------------------------------------------------
    //
    // This prevents the dashboard/sidebar from remaining
    // visible while the browser processes the redirect.
    //

    document.documentElement.classList.add(
        "auth-locked"
    );


    // --------------------------------------------------------
    // CLEAR AUTHENTICATION STATE
    // --------------------------------------------------------

    localStorage.removeItem(
        "fleetflowLoggedIn"
    );

    localStorage.removeItem(
        "fleetflowUser"
    );


    // --------------------------------------------------------
    // VERIFY LOGOUT STATE
    // --------------------------------------------------------

    console.log(
        "fleetflowLoggedIn:",
        localStorage.getItem(
            "fleetflowLoggedIn"
        )
    );

    console.log(
        "fleetflowUser:",
        localStorage.getItem(
            "fleetflowUser"
        )
    );


    // --------------------------------------------------------
    // CLOSE SIDEBAR
    // --------------------------------------------------------

    closeSidebar();


    // --------------------------------------------------------
    // OPTIONAL BACKEND LOGOUT
    // --------------------------------------------------------
    //
    // The backend endpoint does not store a session yet,
    // but we call it so the authentication flow is ready
    // for server-side sessions later.
    //

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                cache: "no-store"
            }
        );

    } catch (error) {

        console.warn(
            "FleetFlow logout request failed. Continuing logout.",
            error
        );

    }


    // --------------------------------------------------------
    // REDIRECT TO LOGIN
    // --------------------------------------------------------

    window.location.replace(
        "/pages/login.html"
    );

}


// ============================================================
// LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSidebar();

    }
);
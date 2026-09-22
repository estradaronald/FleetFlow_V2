// ============================================================
// FLEETFLOW LOGIN
// ============================================================


// ============================================================
// ALREADY LOGGED IN CHECK
// ============================================================

const alreadyLoggedIn =
    localStorage.getItem(
        "fleetflowLoggedIn"
    );

const existingUser =
    localStorage.getItem(
        "fleetflowUser"
    );


if (
    alreadyLoggedIn === "true" &&
    existingUser
) {

    window.location.replace(
        "/pages/dashboard.html"
    );

}


// ============================================================
// ELEMENTS
// ============================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const rememberMe =
    document.getElementById(
        "rememberMe"
    );

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginButtonText =
    document.getElementById(
        "loginButtonText"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );


// ============================================================
// LOAD REMEMBERED USERNAME
// ============================================================

const rememberedUsername =
    localStorage.getItem(
        "fleetflowRememberedUsername"
    );


if (rememberedUsername) {

    usernameInput.value =
        rememberedUsername;

    rememberMe.checked =
        true;

}


// ============================================================
// PASSWORD VISIBILITY
// ============================================================

togglePassword.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type ===
            "password";


        if (isPassword) {

            passwordInput.type =
                "text";

            togglePassword.textContent =
                "🙈";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            passwordInput.type =
                "password";

            togglePassword.textContent =
                "👁";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    }
);


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(message) {

    loginMessage.textContent =
        message;

    loginMessage.classList.add(
        "show"
    );

}


// ============================================================
// CLEAR MESSAGE
// ============================================================

function clearMessage() {

    loginMessage.textContent =
        "";

    loginMessage.classList.remove(
        "show"
    );

}


// ============================================================
// LOADING STATE
// ============================================================

function setLoading(isLoading) {

    loginButton.disabled =
        isLoading;


    if (isLoading) {

        loginButton.classList.add(
            "loading"
        );

        loginButtonText.textContent =
            "Signing in...";

    } else {

        loginButton.classList.remove(
            "loading"
        );

        loginButtonText.textContent =
            "Sign In";

    }

}


// ============================================================
// LOGIN
// ============================================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessage();


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !username ||
            !password
        ) {

            showMessage(
                "Please enter your username and password."
            );

            return;

        }


        setLoading(true);


        try {

            // ------------------------------------------------
            // SEND LOGIN REQUEST
            // ------------------------------------------------

            const response =
                await fetch(
                    "/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                password
                            })
                    }
                );


            const data =
                await response.json();


            // ------------------------------------------------
            // LOGIN FAILED
            // ------------------------------------------------

            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Invalid username or password."
                );

                setLoading(false);

                return;

            }


            // ------------------------------------------------
            // REMEMBER USERNAME
            // ------------------------------------------------

            if (
                rememberMe.checked
            ) {

                localStorage.setItem(
                    "fleetflowRememberedUsername",
                    username
                );

            } else {

                localStorage.removeItem(
                    "fleetflowRememberedUsername"
                );

            }


            // ------------------------------------------------
            // STORE USER
            // ------------------------------------------------

            localStorage.setItem(
                "fleetflowUser",
                JSON.stringify(
                    data.user
                )
            );


            localStorage.setItem(
                "fleetflowLoggedIn",
                "true"
            );


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            window.location.replace(
                "/pages/dashboard.html"
            );

        } catch (error) {

            console.error(
                "FleetFlow login error:",
                error
            );


            showMessage(
                "Unable to connect to the FleetFlow server."
            );


            setLoading(false);

        }

    }
);


// ============================================================
// FORGOT PASSWORD
// ============================================================

forgotPassword.addEventListener(
    "click",
    () => {

        alert(
            "Please contact the system administrator to reset your password."
        );

    }
);
// signup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// --------------------
// Firebase config
// --------------------
const firebaseConfig = {
    apiKey: "AIzaSyAaxU10m2NHhGbciOMiUfhSrHeks8QujXg",
    authDomain: "bobloxauth2.firebaseapp.com",
    databaseURL: "https://bobloxauth2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bobloxauth2",
    storageBucket: "bobloxauth2.firebasestorage.app",
    messagingSenderId: "302659528234",
    appId: "1:302659528234:web:ce6b02d848a991fc0c0553"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --------------------
// Helper: Convert email to Firebase-safe key
// --------------------
function emailToKey(email) {
    // Replace all dots with underscores
    return email.replace(/\./g, "_");
}

// --------------------
// Elements
// --------------------
const wrapper = document.getElementById("wrapper");
const lockButton = document.querySelector(".lock");
const lockImg = document.getElementById("lock");
const passwordInput = document.getElementById("passwinput"); // Now used for password input
const emailInput = document.getElementById("Emailinput");
const loginButton = document.getElementById("LoginButton");

// --------------------
// Fade-in wrapper on page load
// --------------------
window.addEventListener("load", () => {
    if (wrapper) wrapper.classList.add("FadeIn");
});

// --------------------
// Toggle password visibility
// --------------------
if (lockButton && lockImg && passwordInput) {
    lockButton.addEventListener("click", (e) => {
        e.preventDefault(); // prevent button default
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            lockImg.src = "images/buttons/openlock.svg";
        } else {
            passwordInput.type = "password";
            lockImg.src = "images/buttons/bxs-lock-alt.svg";
        }
    });
}

// --------------------
// Login button handler (checks password instead of OTP)
// --------------------
if (loginButton && emailInput && passwordInput) {
    loginButton.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        // Use the email as key, replacing dots with underscores
        const userKey = emailToKey(email);
        const userRef = ref(db, "users/" + userKey);

        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();

                // Check password instead of OTP
                if (userData.password === password) {
                    // Save email for homepage/logout
                    localStorage.setItem("currentUserEmail", email);
                    window.location.href = "homepage.html";
                } else {
                    alert("Incorrect password.");
                }
            } else {
                alert("User not found.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Error logging in.");
        }
    });
}
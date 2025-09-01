import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

function emailToKey(email) {
    return email.replace(/\./g, "_");
}

window.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.getElementById("wrapper");
    const lockButton = document.querySelector(".lock");
    const lockImg = document.getElementById("lock");
    const passwordInput = document.getElementById("passwinput");
    const emailInput = document.getElementById("Emailinput");
    const loginButton = document.getElementById("LoginButton");

    if (wrapper) wrapper.classList.add("FadeIn");

    if (lockButton && lockImg && passwordInput) {
        lockButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                lockImg.src = "images/buttons/openlock.svg";
            } else {
                passwordInput.type = "password";
                lockImg.src = "images/buttons/bxs-lock-alt.svg";
            }
        });
    }

    if (loginButton && emailInput && passwordInput) {
        loginButton.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            const userKey = emailToKey(email);
            const userRef = ref(db, "users/" + userKey);

            try {
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();

                    if (userData.password === password) {
                        localStorage.setItem("currentUserEmail", email);
                        localStorage.setItem("isLoggedIn", "true");
                        const currentUserEmail = email
                        localStorage.setItem("isLoggedIn", "true");
                        localStorage.setItem("currentUserEmail", currentUserEmail);
                        console.log("localstorage saved succesfully");
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

    // Redirect if already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
        window.location.href = "homepage.html";
    }
});

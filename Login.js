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

function redirectToUnity(email, uid) {
    const deepLink = `yourgame://login?userId=${encodeURIComponent(uid)}&email=${encodeURIComponent(email)}`;
    
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    document.body.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('images/blue.jpg') no-repeat center center; background-size: cover; display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: arial;">
      <div style="background: rgba(53, 53, 54, 0.7); padding: 40px; border-radius: 10px; border: 2px solid rgba(39, 39, 39, 0.4); text-align: center; width: 320px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); backdrop-filter: blur(5px);">
        <h2 style="color: white; margin: 0 0 10px 0;">Welcome Back! 🔓</h2>
        <p style="color: white; margin-bottom: 30px; font-size: 14px;">Where to go next?</p>
        
        <button id="goLauncher" style="width: 120px; height: 40px; margin: 10px 5px; background-color: rgb(83, 255, 98); border: none; border-radius: 15px; color: white; font-weight: 600; cursor: pointer; transition: 0.2s;">
           Launcher
        </button>
        
        <button id="goHome" style="width: 120px; height: 40px; margin: 10px 5px; background-color: rgb(83, 255, 98); border: none; border-radius: 15px; color: white; font-weight: 600; cursor: pointer; transition: 0.2s;">
           Website
        </button>
      </div>
    </div>
  `;

    document.getElementById("goLauncher").onclick = () => { 
        window.location.href = deepLink; 
    };
    document.getElementById("goHome").onclick = () => { 
        window.location.href = "homepage.html"; 
    };
}

window.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("LoginButton");
    const lockBtn = document.querySelector(".lock");
    const lockImg = document.getElementById("lock");
    const emailInput = document.getElementById("Emailinput");
    const passwordInput = document.getElementById("passwinput");

    // Check if already logged in
    if (localStorage.getItem("isLoggedIn") === "true") { 
        window.location.href = "homepage.html"; 
    }

    // Password visibility toggle
    if (lockBtn && lockImg && passwordInput) {
        lockBtn.addEventListener("click", () => {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
            lockImg.src = passwordInput.type === "text" ? "images/buttons/openlock.svg" : "images/buttons/bxs-lock-alt.svg";
        });
    }

    // Login handler
    if (loginButton && emailInput && passwordInput) {
        loginButton.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // Basic validation
            if (!email || !password) {
                alert("Please fill in all fields");
                return;
            }

            try {
                const snapshot = await get(ref(db, "users/" + emailToKey(email)));
                
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    
                    // Check if password matches
                    if (userData.password === password) {
                        localStorage.setItem("currentUserEmail", email);
                        localStorage.setItem("isLoggedIn", "true");
                        
                        // Use the uid from database
                        const uid = userData.uid || emailToKey(email);
                        localStorage.setItem("currentUserUid", uid);
                        
                        redirectToUnity(email, uid);
                    } else {
                        alert("Invalid email or password");
                    }
                } else {
                    alert("Invalid email or password");
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("An error occurred during login. Please try again.");
            }
        });

        // Allow Enter key to submit
        passwordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                loginButton.click();
            }
        });
    }
});
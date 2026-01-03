import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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
const auth = getAuth(app);

function emailToKey(email) { 
    return email.replace(/\./g, "_"); 
}

function redirectToUnity(email, uid) {
    // Since you're using Realtime Database, not Firebase Auth
    // You need to either:
    // 1. Generate a simple token
    // 2. Retrieve a stored token from the database
    
    // Option 1: Generate a simple session token
    const token = generateSessionToken(uid);
    
    // Option 2: Or retrieve from database
    // firebase.database().ref('users/' + uid + '/token').once('value').then((snapshot) => {
    //     const token = snapshot.val();
    //     ... rest of code
    // });
    
    const deepLink = `yourgame://login?userId=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    
    console.log("Deep link created:", deepLink);
    console.log("User ID:", uid);
    console.log("Token:", token);
    
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('images/blue.jpg') no-repeat center center; background-size: cover; display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: arial;">
      <div style="background: rgba(53, 53, 54, 0.7); padding: 40px; border-radius: 10px; border: 2px solid rgba(39, 39, 39, 0.4); text-align: center; width: 320px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); backdrop-filter: blur(5px);">
        <h2 style="color: white; margin: 0 0 10px 0;">Welcome Back! 🔓</h2>
        <p style="color: white; margin-bottom: 10px; font-size: 14px;">Where to go next?</p>
        <p style="color: #aaa; margin-bottom: 20px; font-size: 11px;">User: ${email}</p>
        
        <button id="goLauncher" style="width: 120px; height: 40px; margin: 10px 5px; background-color: rgb(83, 255, 98); border: none; border-radius: 15px; color: white; font-weight: 600; cursor: pointer; transition: 0.2s;">
           Launcher
        </button>
        <button id="goHome" style="width: 120px; height: 40px; margin: 10px 5px; background-color: rgb(83, 255, 98); border: none; border-radius: 15px; color: white; font-weight: 600; cursor: pointer; transition: 0.2s;">
           Website
        </button>
        
        <p id="status" style="color: white; margin-top: 20px; font-size: 12px;"></p>
      </div>
    </div>
  `;
    
    document.getElementById("goLauncher").onclick = () => { 
        console.log("Launcher button clicked!");
        console.log("Redirecting to:", deepLink);
        document.getElementById("status").innerText = "Opening game...";
        
        // Attempt to open the game
        window.location.href = deepLink;
        
        // Show fallback after 2 seconds
        setTimeout(() => {
            document.getElementById("status").innerHTML = 
                'Game not opening? Make sure it\'s installed.<br><a href="' + deepLink + '" style="color: #53FF62;">Try again</a>';
        }, 2000);
    };
    
    document.getElementById("goHome").onclick = () => { 
        window.location.href = "homepage.html"; 
    };
}

// Simple token generator (for session validation)
function generateSessionToken(uid) {
    // Generate a random session token
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return btoa(`${uid}_${timestamp}_${random}`); // Base64 encode
}

    // Login handler
    if (loginButton && emailInput && passwordInput) {
        loginButton.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert("Please fill in all fields");
                return;
            }

            try {
                // First, try database login (your current system)
                const snapshot = await get(ref(db, "users/" + emailToKey(email)));
                
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    
                    // Check if password matches
                    if (userData.password === password) {
                        const uid = userData.uid || emailToKey(email);
                        
                        // Store login state
                        localStorage.setItem("currentUserEmail", email);
                        localStorage.setItem("isLoggedIn", "true");
                        localStorage.setItem("currentUserUid", uid);
                        
                        // Try to get Firebase Auth token (if user exists in Auth)
                        try {
                            const userCredential = await signInWithEmailAndPassword(auth, email, password);
                            const token = await userCredential.user.getIdToken();
                            console.log("Got Firebase Auth token");
                            redirectToUnity(email, uid, token);
                        } catch (authError) {
                            // User not in Firebase Auth, continue without token
                            console.log("No Firebase Auth account, continuing without token");
                            redirectToUnity(email, uid, null);
                        }
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




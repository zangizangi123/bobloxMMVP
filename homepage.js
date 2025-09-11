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
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if ( isLoggedIn !== "true") {
    window.location.href = "index.html"; 
  } 

   if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.textContent = "Light Mode";
    }
});

// Sidebar
const sidebar = document.getElementById("sidebar");
document.getElementById("openSidebar").addEventListener("click", () => {
    sidebar.classList.add("active");
});
document.getElementById("closeSidebar").addEventListener("click", () => {
    sidebar.classList.remove("active");
});

// Logout confirmation
const confirm = document.querySelector(".confirm");
const content = document.getElementById("content");
const logoutBtn = document.getElementById("logout"); // make sure sidebar logout has this ID

// initially hide the confirm dialog
confirm.style.display = "none";

// show confirmation with fade in
logoutBtn.addEventListener("click", () => {
    confirm.style.display = "block";
    content.style.filter = "blur(10px)";
    confirm.classList.remove("FadeOut");
    void confirm.offsetWidth; // trigger reflow
    confirm.classList.add("FadeIn");
});

// cancel logout (fade out)
document.querySelector(".no").addEventListener("click", () => {
    confirm.classList.remove("FadeIn");
    void confirm.offsetWidth; // trigger reflow
    confirm.classList.add("FadeOut");

    setTimeout(() => {
        confirm.style.display = "none";
        content.style.filter = "none";
        confirm.classList.remove("FadeOut");
    }, 300); // match CSS animation duration
});

// confirm logout
document.querySelector(".yes").addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUserEmail");
    window.location.href = "register.html";
});

// Fetch username from Firebase
const currentEmail = localStorage.getItem("currentUserEmail");
if (currentEmail) {
    const emailKey = emailToKey(currentEmail);
    const userRef = ref(db, `users/${emailKey}`);
    get(userRef).then(snapshot => {
        if (snapshot.exists()) {
            const username = snapshot.val().username;
            document.getElementById("hello").textContent = `Hello, ${username}`;
        } else { console.log("No user data found"); }
    }).catch(error => console.error(error));
} else {
    console.log("No logged in user found");
}

// Dark mode
const darkModeToggle = document.getElementById("darkModeToggle");

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
});


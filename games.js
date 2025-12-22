import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAaxU10m2NHhGbciOMiUfhSrHeks8QujXg",
    authDomain: "bobloxauth2.firebaseapp.com",
    databaseURL: "https://bobloxauth2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bobloxauth2",
    storageBucket: "bobloxauth2.firebased.appspot.com",
    messagingSenderId: "302659528234",
    appId: "1:302659528234:web:ce6b02d848a991fc0c0553"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const gamesContainer = document.getElementById("games");

// --- Sidebar / Dark Mode ---
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const darkModeToggle = document.getElementById("darkModeToggle");
const confirm = document.querySelector(".confirm");
const content = document.getElementById("content");
const logoutBtn = document.getElementById("logout");

// Sidebar toggle
openSidebarBtn.addEventListener("click", () => sidebar.classList.add("active"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("active"));

// Dark mode on load
if(localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "Light Mode";
}

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
});

// Logout
confirm.style.display = "none";

logoutBtn.addEventListener("click", () => {
    confirm.style.display = "block";
    content.style.filter = "blur(10px)";
    confirm.classList.remove("FadeOut");
    void confirm.offsetWidth;
    confirm.classList.add("FadeIn");
});

document.querySelector(".no").addEventListener("click", () => {
    confirm.classList.remove("FadeIn");
    void confirm.offsetWidth;
    confirm.classList.add("FadeOut");
    setTimeout(() => {
        confirm.style.display = "none";
        content.style.filter = "none";
        confirm.classList.remove("FadeOut");
    }, 300);
});

document.querySelector(".yes").addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUserEmail");
    window.location.href = "register.html";
});

// --- Load Games ---
async function loadGames() {
    const snapshot = await get(ref(db, "games"));
    if(!snapshot.exists()) {
        gamesContainer.innerHTML = "<p>No games yet.</p>";
        return;
    }

    const games = snapshot.val();
    gamesContainer.innerHTML = "";

    for(const id in games) {
        const game = games[id];
        const div = document.createElement("div");
        div.className = "game";

        div.innerHTML = `
            <img src="${game.icon}" alt="${game.name}">
            <h2>${game.name}</h2>
            <div class="creator">by ${game.creator}</div>
            <p>${game.description}</p>
            <button class="btn play-btn">▶ Play</button>
        `;

        div.querySelector(".play-btn").addEventListener("click", () => {
            window.location.href = `boblox://launch?game=${game.id}`;
        });

        gamesContainer.appendChild(div);
    }
}

loadGames();

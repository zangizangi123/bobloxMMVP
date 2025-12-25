import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAaxU10m2NHhGbciOMiUfhSrHeks8QujXg",
    authDomain: "bobloxauth2.firebaseapp.com",
    databaseURL: "https://bobloxauth2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bobloxauth2",
    storageBucket: "bobloxauth2.appspot.com",
    messagingSenderId: "302659528234",
    appId: "1:302659528234:web:ce6b02d848a991fc0c0553"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Convert email to Firebase key
function emailToKey(email) {
    return email.replace(/\./g, "_");
}

window.addEventListener("DOMContentLoaded", () => {
    const gamesContainer = document.getElementById("games");
    const sidebar = document.getElementById("sidebar");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const logoutBtn = document.getElementById("logout");
    const container = document.querySelector(".container"); // select by class
    const confirm = document.getElementById("confirm");
    const content = document.getElementById("content");
    const yesBtn = confirm.querySelector(".yes");
    const noBtn = confirm.querySelector(".no");
    const bobuxDisplay = document.getElementById("bobux");

    // Redirect if not logged in
    if (localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "index.html";
        return;
    }

    // Sidebar toggle
    openSidebarBtn?.addEventListener("click", () => sidebar.classList.add("active"));
    closeSidebarBtn?.addEventListener("click", () => sidebar.classList.remove("active"));

    // Dark mode
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        if (darkModeToggle) darkModeToggle.textContent = "Light Mode";
    }

    darkModeToggle?.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem(
            "darkMode",
            document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
        );
        darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
    });

    // Logout modal
    logoutBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        container.style.display = "flex";
        confirm.style.opacity = "1";
        confirm.style.pointerEvents = "auto";
        content.style.filter = "blur(10px)";
        confirm.classList.remove("FadeOut");
        void confirm.offsetWidth; // trigger reflow
        confirm.classList.add("FadeIn");
    });

    noBtn?.addEventListener("click", () => {
        confirm.classList.remove("FadeIn");
        void confirm.offsetWidth;
        confirm.classList.add("FadeOut");
        setTimeout(() => {
            confirm.style.opacity = "0";
            confirm.style.pointerEvents = "none";
            container.style.display = "none";
            content.style.filter = "none";
            confirm.classList.remove("FadeOut");
        }, 300);
    });

    yesBtn?.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("currentUserEmail");
        localStorage.removeItem("savedInput");
        window.location.href = "index.html";
    });

    // Fetch Bobux
    const currentEmail = localStorage.getItem("currentUserEmail");
    if (currentEmail && bobuxDisplay) {
        const emailKey = emailToKey(currentEmail);
        const userRef = ref(db, `users/${emailKey}`);
        get(userRef)
            .then(snapshot => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    bobuxDisplay.textContent = `Bobux: ${userData.bobux || 0}`;
                }
            })
            .catch(console.error);
    }

    // Load games
    async function loadGames() {
        try {
            const snapshot = await get(ref(db, "games"));
            if (!snapshot.exists()) {
                gamesContainer.innerHTML = "<p>No games yet.</p>";
                return;
            }

            const games = snapshot.val();
            gamesContainer.innerHTML = "";

            for (const id in games) {
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

                div.querySelector(".play-btn")?.addEventListener("click", () => {
                    window.location.href = `boblox://launch?game=${game.id}`;
                });

                gamesContainer.appendChild(div);
            }
        } catch (err) {
            console.error("Failed to load games:", err);
            gamesContainer.innerHTML = "<p>Error loading games.</p>";
        }
    }

    loadGames();
});

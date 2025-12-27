import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, update, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

function emailToKey(email) {
    return email.replace(/\./g, "_");
}

window.addEventListener("DOMContentLoaded", async () => {
    // --- UI Elements ---
    const sidebar = document.getElementById("sidebar");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const logoutBtn = document.getElementById("logout");
    const confirm = document.getElementById("confirm");
    const container = document.querySelector(".container");
    const content = document.getElementById("content");
    const yesBtn = confirm?.querySelector(".yes");
    const noBtn = confirm?.querySelector(".no");
    const avatarSelect = document.getElementById("avatarSelect");
    const avatarPreview = document.getElementById("avatarPreview");
    const confirmBtn = document.getElementById("confirmAvatar");
    const hello = document.getElementById("hello");

    // --- Auth Check ---
    const currentEmail = localStorage.getItem("currentUserEmail");
    if (!currentEmail) {
        window.location.href = "index.html";
        return;
    }

    // --- Sidebar Toggle ---
    openSidebarBtn?.addEventListener("click", () => sidebar.classList.add("active"));
    closeSidebarBtn?.addEventListener("click", () => sidebar.classList.remove("active"));

    // --- Dark Mode ---
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        if (darkModeToggle) darkModeToggle.textContent = "Light Mode";
    }

    darkModeToggle?.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const mode = document.body.classList.contains("dark-mode") ? "enabled" : "disabled";
        localStorage.setItem("darkMode", mode);
        darkModeToggle.textContent = mode === "enabled" ? "Light Mode" : "Dark Mode";
    });

    // --- Logout Modal ---
    if (logoutBtn && confirm && container && content) {
        logoutBtn.addEventListener("click", (e) => {
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
    }

    // --- Avatar Preview on Change ---
    avatarSelect.addEventListener("change", () => {
        avatarPreview.src = `images/avatars/${avatarSelect.value}.png`;
    });

    // --- Save Avatar to Firebase ---
    confirmBtn.addEventListener("click", async () => {
        const userKey = emailToKey(currentEmail);
        try {
            await update(ref(db, `users/${userKey}`), {
                avatar_id: Number(avatarSelect.value)
            });
            alert("Avatar Saved!");
        } catch (error) {
            console.error("Error saving avatar:", error);
            alert("Failed to save avatar.");
        }
    });

    // --- Load User Data from Firebase ---
    const userKey = emailToKey(currentEmail);
    try {
        const snapshot = await get(ref(db, `users/${userKey}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            const username = data.username || "User";
            const bobux = data.bobux || 0;
            const avatarId = data.avatar_id || 1;

            // Update UI
            if (hello) hello.innerHTML = `Hello, <span class="green">${username}</span>`;
            document.getElementById("bobux").textContent = `Bobux: ${bobux}`;
            avatarSelect.value = avatarId;
            avatarPreview.src = `images/avatars/${avatarId}.png`;
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
});
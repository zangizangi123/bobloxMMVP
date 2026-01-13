import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

window.addEventListener("DOMContentLoaded", () => {
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
    const bobuxDisplay = document.getElementById("bobux");

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
        window.location.href = "index.html";
        return;
    }

    openSidebarBtn?.addEventListener("click", () => sidebar.classList.add("active"));
    closeSidebarBtn?.addEventListener("click", () => sidebar.classList.remove("active"));

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

    if (logoutBtn && confirm && container && content) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            container.style.display = "flex";
            confirm.style.opacity = "1";
            confirm.style.pointerEvents = "auto";
            content.style.filter = "blur(10px)";
            confirm.classList.remove("FadeOut");
            void confirm.offsetWidth;
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

    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('uid');

    if (!targetUserId) {
        alert("No user ID provided");
        window.location.href = "users.html";
        return;
    }

    async function loadUserProfile() {
        try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);

            if (!snapshot.exists()) {
                console.error("No users in database");
                alert("User not found");
                window.location.href = "users.html";
                return;
            }

            const users = snapshot.val();
            let targetUser = null;
            let targetUserKey = null;

            for (const key in users) {
                const user = users[key];
                if (user.uid) {
                    const userUidStr = String(user.uid).trim();
                    const targetUidStr = String(targetUserId).trim();
                    
                    if (userUidStr === targetUidStr) {
                        targetUser = user;
                        targetUserKey = key;
                        break;
                    }
                }
            }

            if (!targetUser) {
                console.error("User not found with UID:", targetUserId);
                alert("User not found");
                window.location.href = "users.html";
                return;
            }

            const usernameElement = document.getElementById("username");
            if (targetUser.checkmark === "true") {
                usernameElement.innerHTML = `${targetUser.username || "Unknown"} <img src="images/login/checkmark.png" alt="Verified" class="verified-badge">`;
            } else {
                usernameElement.textContent = targetUser.username || "Unknown";
            }

            document.getElementById("userId").textContent = targetUser.uid || "-";
            document.getElementById("userBobux").textContent = targetUser.bobux || 0;

            const avatarImg = document.getElementById("userAvatar");
            const shirtImg = document.getElementById("userShirt");
            
            avatarImg.src = `images/avatars/${targetUser.avatar_id || 1}.png`;
            
            if (targetUser.equipped_shirt && targetUser.equipped_shirt !== "") {
                shirtImg.src = targetUser.equipped_shirt;
                shirtImg.style.display = "block";
            } else {
                shirtImg.style.display = "none";
            }

            const ownedShirts = targetUser.ownedShirts || {};
            const shirtCount = Object.keys(ownedShirts).length;
            document.getElementById("shirtCount").textContent = shirtCount;

            const gamesRef = ref(db, 'games');
            const gamesSnapshot = await get(gamesRef);
            let gamesCount = 0;

            if (gamesSnapshot.exists()) {
                const games = gamesSnapshot.val();
                for (const gameId in games) {
                    if (games[gameId].creator === targetUser.username) {
                        gamesCount++;
                    }
                }
            }

            document.getElementById("gamesCount").textContent = gamesCount;

        } catch (error) {
            console.error("Error loading profile:", error);
            alert("Error loading profile: " + error.message);
            window.location.href = "users.html";
        }
    }

    loadUserProfile();
});

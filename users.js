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
    const usersGrid = document.getElementById("usersGrid");
    const userCountSpan = document.getElementById("userCount");
    const searchInput = document.getElementById("searchInput");
    const bobuxDisplay = document.getElementById("bobux");

    let allUsers = [];

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

    async function loadUsers() {
        try {
            usersGrid.innerHTML = '<p class="loading">Loading users...</p>';
            
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            
            if (!snapshot.exists()) {
                usersGrid.innerHTML = '<p class="no-users">No users found.</p>';
                return;
            }

            const users = snapshot.val();
            allUsers = [];

            for (const key in users) {
                const user = users[key];
                if (user.uid) {
                    allUsers.push({
                        username: user.username || "Unknown",
                        uid: String(user.uid).trim(),
                        avatar_id: user.avatar_id || 1,
                        bobux: user.bobux || 0,
                        equipped_shirt: user.equipped_shirt || "",
                        checkmark: user.checkmark || "false"
                    });
                }
            }

            allUsers.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()));

            displayUsers(allUsers);
            if (userCountSpan) {
                userCountSpan.textContent = allUsers.length;
            }

        } catch (error) {
            console.error("Error loading users:", error);
            usersGrid.innerHTML = '<p class="error-msg">Error loading users. Please try again.</p>';
        }
    }

    function displayUsers(users) {
        if (users.length === 0) {
            usersGrid.innerHTML = '<p class="no-users">No users found.</p>';
            return;
        }

        usersGrid.innerHTML = '';

        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            
            const avatarHTML = user.equipped_shirt ? 
                `<img src="images/avatars/${user.avatar_id}.png" alt="${user.username}">
                 <img class="shirt-overlay" src="${user.equipped_shirt}" alt="Shirt">` :
                `<img src="images/avatars/${user.avatar_id}.png" alt="${user.username}">`;
            
            const checkmarkHTML = user.checkmark === "true" ? 
                ' <img src="images/login/checkmark.png" alt="Verified" class="checkmark-icon">' : '';
            
            userCard.innerHTML = `
                <div class="user-avatar">
                    ${avatarHTML}
                </div>
                <h3>${user.username}${checkmarkHTML}</h3>
                <p class="user-id">ID: ${user.uid}</p>
                <p class="user-bobux">${user.bobux} Bobux</p>
            `;
            
            userCard.addEventListener('click', () => {
                window.location.href = `profile.html?uid=${encodeURIComponent(user.uid)}`;
            });
            
            usersGrid.appendChild(userCard);
        });
    }

    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayUsers(allUsers);
            if (userCountSpan) {
                userCountSpan.textContent = allUsers.length;
            }
        } else {
            const filteredUsers = allUsers.filter(user => 
                user.username.toLowerCase().includes(searchTerm) ||
                user.uid.toLowerCase().includes(searchTerm)
            );
            displayUsers(filteredUsers);
            if (userCountSpan) {
                userCountSpan.textContent = filteredUsers.length;
            }
        }
    });

    loadUsers();
});

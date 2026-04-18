import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

const CLOUDINARY_CLOUD = "dzmk4sss2";
const CLOUDINARY_PRESET = "boblox";

function emailToKey(email) {
    return email.replace(/\./g, "_");
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const resourceType = file.name.endsWith(".pck") ? "raw" : "image";
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`;

    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();
    return data.secure_url;
}

window.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const logoutBtn = document.getElementById("logout");
    const confirmBox = document.getElementById("confirm");
    const container = document.querySelector(".container");
    const content = document.getElementById("content");
    const yesBtn = confirmBox?.querySelector(".yes");
    const noBtn = confirmBox?.querySelector(".no");
    const hello = document.getElementById("hello");
    const bobuxDisplay = document.getElementById("bobux");
    const creationsContainer = document.getElementById("user-creations");

    if (localStorage.getItem("isLoggedIn") !== "true") {
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
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
        darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    });

    logoutBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        container.style.display = "flex";
        confirmBox.style.opacity = "1";
        confirmBox.style.pointerEvents = "auto";
        content.style.filter = "blur(10px)";
        confirmBox.classList.remove("FadeOut");
        void confirmBox.offsetWidth;
        confirmBox.classList.add("FadeIn");
    });

    noBtn?.addEventListener("click", () => {
        confirmBox.classList.remove("FadeIn");
        void confirmBox.offsetWidth;
        confirmBox.classList.add("FadeOut");
        setTimeout(() => {
            confirmBox.style.opacity = "0";
            confirmBox.style.pointerEvents = "none";
            container.style.display = "none";
            content.style.filter = "none";
        }, 300);
    });

    yesBtn?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });

    const currentEmail = localStorage.getItem("currentUserEmail");
    if (currentEmail) {
        const emailKey = emailToKey(currentEmail);
        get(ref(db, `users/${emailKey}`)).then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const username = userData.username;

                if (userData.checkmark === "true") {
                    hello.innerHTML = `Hello, ${username} <img src="images/login/checkmark.png" alt="icon" class="verified" style="width:20px; vertical-align:middle;">`;
                } else {
                    hello.textContent = `Hello, ${username}`;
                }

                if (bobuxDisplay) {
                    bobuxDisplay.textContent = `Bobux: ${userData.bobux || 0}`;
                }

                loadCreations(username);
            }
        });
    }

    async function loadCreations(username) {
        const nodes = ["games", "shirts", "faces"];
        creationsContainer.innerHTML = "";

        for (const node of nodes) {
            const snap = await get(ref(db, node));
            if (!snap.exists()) continue;

            const items = snap.val();
            for (const id in items) {
                if (items[id].creator === username) {
                    const item = items[id];
                    const card = document.createElement("div");
                    card.className = "creation-card";
                    const isGame = node === "games";

                    card.innerHTML = `
                        <div class="type-tag">${node.toUpperCase()}</div>
                        <div class="img-edit-container">
                            <img src="${item.icon || item.image}" id="preview-${id}">
                            <label class="file-label">Change Thumbnail
                                <input type="file" class="icon-upload" accept="image/*" style="display:none">
                            </label>
                        </div>
                        <input type="text" class="edit-field name-input" value="${item.name}">
                        ${isGame ? `
                            <textarea class="edit-field desc-input">${item.description || ""}</textarea>
                            <label class="file-label file-bg">Change Game File (.pck)
                                <input type="file" class="game-upload" accept=".pck" style="display:none">
                            </label>
                            <span class="file-status" id="status-${id}">No new file selected</span>
                        ` : `
                            <input type="number" class="edit-field price-input" value="${item.price || 0}">
                        `}
                        <div class="card-btns">
                            <button class="update-btn">Update All</button>
                            <button class="delete-btn">Delete</button>
                        </div>
                    `;

                    const iconInput = card.querySelector(".icon-upload");
                    const gameInput = card.querySelector(".game-upload");
                    let newIconFile = null;
                    let newGameFile = null;

                    iconInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            newIconFile = file;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                card.querySelector(`#preview-${id}`).src = reader.result;
                            };
                            reader.readAsDataURL(file);
                        }
                    };

                    if (gameInput) {
                        gameInput.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                if (!file.name.endsWith(".pck")) {
                                    alert("Please select a valid .pck file");
                                    e.target.value = "";
                                    return;
                                }
                                newGameFile = file;
                                card.querySelector(`#status-${id}`).textContent = file.name;
                            }
                        };
                    }

                    card.querySelector(".update-btn").onclick = async () => {
                        const updateBtn = card.querySelector(".update-btn");
                        updateBtn.textContent = "Uploading...";
                        updateBtn.disabled = true;

                        try {
                            const updates = {
                                name: card.querySelector(".name-input").value
                            };

                            if (isGame) {
                                updates.description = card.querySelector(".desc-input").value;

                                if (newIconFile) {
                                    updates.icon = await uploadToCloudinary(newIconFile);
                                }
                                if (newGameFile) {
                                    updates.file = await uploadToCloudinary(newGameFile);
                                }
                            } else {
                                updates.price = Number(card.querySelector(".price-input").value);
                                if (newIconFile) {
                                    updates.image = await uploadToCloudinary(newIconFile);
                                }
                            }

                            await update(ref(db, `${node}/${id}`), updates);
                            alert("Updated successfully!");
                            newIconFile = null;
                            newGameFile = null;
                        } catch (error) {
                            console.error(error);
                            alert("Update failed: " + error.message);
                        } finally {
                            updateBtn.textContent = "Update All";
                            updateBtn.disabled = false;
                        }
                    };

                    card.querySelector(".delete-btn").onclick = async () => {
                        if (confirm("Are you sure you want to delete this creation forever?")) {
                            await remove(ref(db, `${node}/${id}`));
                            card.remove();
                        }
                    };

                    creationsContainer.appendChild(card);
                }
            }
        }
    }
});
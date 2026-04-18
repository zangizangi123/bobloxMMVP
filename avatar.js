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

// Replace this with your default face key from Firebase
const DEFAULT_FACE_KEY = "1772369352481";

function emailToKey(email) {
    return email.replace(/\./g, "_");
}

window.addEventListener("DOMContentLoaded", async () => {
    const avatarSelect = document.getElementById("avatarSelect");
    const avatarPreview = document.getElementById("avatarPreview");
    const shirtOverlay = document.getElementById("shirtOverlay");
    const faceOverlay = document.getElementById("faceOverlay");
    const ownedShirtsDiv = document.getElementById("ownedShirts");
    const ownedFacesDiv = document.getElementById("ownedFaces");
    const confirmBtn = document.getElementById("confirmAvatar");
    const clearShirtBtn = document.getElementById("clearShirt");
    const clearFaceBtn = document.getElementById("clearFace");
    const bobuxDisplay = document.getElementById("bobux");

    let selectedShirtUrl = "";
    let selectedFaceUrl = "";
    let selectedFaceKey = DEFAULT_FACE_KEY;

    const currentEmail = localStorage.getItem("currentUserEmail");

    if (!currentEmail) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }

    const userKey = emailToKey(currentEmail);

    async function loadUserData() {
        try {
            const snapshot = await get(ref(db, `users/${userKey}`));

            if (!snapshot.exists()) {
                alert("User data not found");
                window.location.href = "index.html";
                return null;
            }

            const data = snapshot.val();

            // Set avatar
            const avatarId = data.avatar_id || 0;
            avatarSelect.value = avatarId;
            avatarPreview.src = `images/avatars/${avatarId}.png`;

            // Display Bobux
            if (bobuxDisplay && data.bobux !== undefined) {
                bobuxDisplay.textContent = `Bobux: ${data.bobux}`;
            }

            // Set equipped shirt
            if (data.equipped_shirt && data.equipped_shirt !== "") {
                selectedShirtUrl = data.equipped_shirt;
                shirtOverlay.src = selectedShirtUrl;
                shirtOverlay.style.display = "block";
            }

            // Set equipped face
            if (data.equipped_face && data.equipped_face !== "") {
                selectedFaceUrl = data.equipped_face;
                faceOverlay.src = selectedFaceUrl;
                faceOverlay.style.display = "block";
            }

            return data;
        } catch (error) {
            console.error("Error loading user data:", error);
            alert("Error loading profile");
            return null;
        }
    }

    async function loadInventory(userData) {
        await loadShirts(userData);
        await loadFaces(userData);
    }

    async function loadShirts(userData) {
        ownedShirtsDiv.innerHTML = "<p class='status-msg'>Loading...</p>";

        const ownedShirts = userData.ownedShirts;

        if (!ownedShirts || Object.keys(ownedShirts).length === 0) {
            ownedShirtsDiv.innerHTML = "<p class='status-msg'>No shirts in inventory</p>";
            return;
        }

        ownedShirtsDiv.innerHTML = "";
        const shirtIds = Object.values(ownedShirts);

        for (const shirtId of shirtIds) {
            try {
                const shirtSnapshot = await get(ref(db, `shirts/${shirtId}`));
                if (shirtSnapshot.exists()) {
                    const shirt = shirtSnapshot.val();
                    const item = createInventoryItem(shirt.image, shirt.name, shirt.image === selectedShirtUrl, (url) => {
                        document.querySelectorAll('#ownedShirts .shirt-item').forEach(i => i.classList.remove('active'));
                        selectedShirtUrl = url;
                        shirtOverlay.src = url;
                        shirtOverlay.style.display = "block";
                    });
                    ownedShirtsDiv.appendChild(item);
                }
            } catch (e) {
                console.error("Error loading shirt:", shirtId, e);
            }
        }

        if (ownedShirtsDiv.children.length === 0) {
            ownedShirtsDiv.innerHTML = "<p class='status-msg'>No shirts found</p>";
        }
    }

    async function loadFaces(userData) {
        ownedFacesDiv.innerHTML = "<p class='status-msg'>Loading...</p>";

        const ownedFaces = userData.ownedFaces;

        if (!ownedFaces || Object.keys(ownedFaces).length === 0) {
            ownedFacesDiv.innerHTML = "<p class='status-msg'>No faces in inventory</p>";
            return;
        }

        ownedFacesDiv.innerHTML = "";
        const faceIds = Object.values(ownedFaces);

        for (const faceId of faceIds) {
            try {
                const faceSnapshot = await get(ref(db, `faces/${faceId}`));
                if (faceSnapshot.exists()) {
                    const face = faceSnapshot.val();
                    const item = createInventoryItem(face.image, face.name, face.image === selectedFaceUrl, (url) => {
                        document.querySelectorAll('#ownedFaces .shirt-item').forEach(i => i.classList.remove('active'));
                        selectedFaceUrl = url;
                        faceOverlay.src = url;
                        faceOverlay.style.display = "block";
                    });
                    ownedFacesDiv.appendChild(item);
                }
            } catch (e) {
                console.error("Error loading face:", faceId, e);
            }
        }

        if (ownedFacesDiv.children.length === 0) {
            ownedFacesDiv.innerHTML = "<p class='status-msg'>No faces found</p>";
        }
    }

    function createInventoryItem(imageUrl, name, isActive, onClickFn) {
        const item = document.createElement("div");
        item.className = "shirt-item" + (isActive ? " active" : "");
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = name || "Item";
        item.appendChild(img);
        item.onclick = () => {
            item.classList.add("active");
            onClickFn(imageUrl);
        };
        return item;
    }

    // Unequip shirt — clears to nothing
    clearShirtBtn.onclick = () => {
        selectedShirtUrl = "";
        shirtOverlay.style.display = "none";
        shirtOverlay.src = "";
        document.querySelectorAll('#ownedShirts .shirt-item').forEach(i => i.classList.remove('active'));
    };

    // Unequip face — falls back to default face
    clearFaceBtn.onclick = async () => {
        selectedFaceUrl = "";
        faceOverlay.style.display = "none";
        faceOverlay.src = "";
        document.querySelectorAll('#ownedFaces .shirt-item').forEach(i => i.classList.remove('active'));
        selectedFaceKey = DEFAULT_FACE_KEY;
    };

    // Update preview when avatar changes
    avatarSelect.onchange = () => {
        avatarPreview.src = `images/avatars/${avatarSelect.value}.png`;
    };

    // Save changes
    confirmBtn.onclick = async () => {
        const originalText = confirmBtn.textContent;

        try {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Saving...";

            await update(ref(db, `users/${userKey}`), {
                avatar_id: Number(avatarSelect.value),
                equipped_shirt: selectedShirtUrl || "",
                equipped_face: selectedFaceUrl || "",
                currentFace: selectedFaceUrl ? null : DEFAULT_FACE_KEY
            });

            confirmBtn.textContent = "Saved!";
            alert("Avatar updated successfully!");

            setTimeout(() => {
                confirmBtn.textContent = originalText;
                confirmBtn.disabled = false;
            }, 1500);

        } catch (error) {
            console.error("Error saving:", error);
            alert("Failed to save changes");
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
        }
    };

    const userData = await loadUserData();
    if (userData) {
        await loadInventory(userData);
    }
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, update, get, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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
    const avatarSelect = document.getElementById("avatarSelect");
    const avatarPreview = document.getElementById("avatarPreview");
    const shirtOverlay = document.getElementById("shirtOverlay");
    const ownedShirtsDiv = document.getElementById("ownedShirts");
    const confirmBtn = document.getElementById("confirmAvatar");
    const clearBtn = document.getElementById("clearShirt");
    const bobuxDisplay = document.getElementById("bobux");

    let selectedShirtUrl = "";
    const currentEmail = localStorage.getItem("currentUserEmail");
    
    if (!currentEmail) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }
    
    const userKey = emailToKey(currentEmail);

    // Load user profile
    async function loadUserData() {
        try {
            const snapshot = await get(ref(db, `users/${userKey}`));
            
            if (!snapshot.exists()) {
                alert("User data not found");
                window.location.href = "index.html";
                return null;
            }

            const data = snapshot.val();
            console.log("User data loaded:", data);
            
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

            return data;
        } catch (error) {
            console.error("Error loading user data:", error);
            alert("Error loading profile");
            return null;
        }
    }

    // Load owned shirts from ownedShirts object
    async function loadInventory() {
        try {
            console.log("Loading inventory for user:", userKey);
            ownedShirtsDiv.innerHTML = "<p class='status-msg'>Loading...</p>";
            
            const userSnapshot = await get(ref(db, `users/${userKey}`));
            
            if (!userSnapshot.exists()) {
                ownedShirtsDiv.innerHTML = "<p class='status-msg'>User not found</p>";
                return;
            }

            const userData = userSnapshot.val();
            console.log("User data:", userData);
            
            // Get ownedShirts object
            const ownedShirts = userData.ownedShirts;
            console.log("Owned shirts:", ownedShirts);

            if (!ownedShirts || Object.keys(ownedShirts).length === 0) {
                ownedShirtsDiv.innerHTML = "<p class='status-msg'>No shirts in inventory</p>";
                return;
            }

            ownedShirtsDiv.innerHTML = "";

            // Get all shirt IDs from ownedShirts
            const shirtIds = Object.values(ownedShirts);
            console.log("Shirt IDs:", shirtIds);

            // Fetch each shirt's details
            for (const shirtId of shirtIds) {
                try {
                    const shirtSnapshot = await get(ref(db, `shirts/${shirtId}`));
                    
                    if (shirtSnapshot.exists()) {
                        const shirt = shirtSnapshot.val();
                        console.log("Shirt data:", shirt);
                        
                        const item = document.createElement("div");
                        item.className = "shirt-item";
                        
                        // Check if this shirt is equipped
                        if (shirt.image === selectedShirtUrl) {
                            item.classList.add('active');
                        }
                        
                        const img = document.createElement('img');
                        img.src = shirt.image;
                        img.alt = shirt.name || 'Shirt';
                        
                        item.appendChild(img);
                        
                        item.onclick = () => {
                            document.querySelectorAll('.shirt-item').forEach(i => i.classList.remove('active'));
                            item.classList.add('active');
                            
                            selectedShirtUrl = shirt.image;
                            shirtOverlay.src = selectedShirtUrl;
                            shirtOverlay.style.display = "block";
                        };
                        
                        ownedShirtsDiv.appendChild(item);
                    }
                } catch (error) {
                    console.error("Error loading shirt:", shirtId, error);
                }
            }

            if (ownedShirtsDiv.children.length === 0) {
                ownedShirtsDiv.innerHTML = "<p class='status-msg'>No shirts found</p>";
            }

        } catch (error) {
            console.error("Error loading inventory:", error);
            ownedShirtsDiv.innerHTML = "<p class='status-msg'>Error loading inventory</p>";
        }
    }

    // Unequip shirt
    clearBtn.onclick = () => {
        selectedShirtUrl = "";
        shirtOverlay.style.display = "none";
        shirtOverlay.src = "";
        document.querySelectorAll('.shirt-item').forEach(i => i.classList.remove('active'));
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
                equipped_shirt: selectedShirtUrl || ""
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

    // Initialize
    const userData = await loadUserData();
    if (userData) {
        await loadInventory();
    }
});
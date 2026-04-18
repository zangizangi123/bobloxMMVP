import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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
    const logoutContainer = document.querySelector(".logout-container");
    const purchaseContainer = document.querySelector(".purchase-container");
    const purchaseConfirm = document.getElementById("purchaseConfirm");
    const content = document.getElementById("content");
    const yesBtn = confirm?.querySelector(".yes");
    const noBtn = confirm?.querySelector(".no");
    const shirtsGrid = document.getElementById("shirtsGrid");
    const facesGrid = document.getElementById("facesGrid");

    let currentUserBobux = 0;
    let currentUserEmail = "";
    let selectedItem = null;
    let selectedItemKey = null;
    let selectedItemType = null; // "shirt" or "face"

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

    if (logoutBtn && confirm && logoutContainer && content) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logoutContainer.style.display = "flex";
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
                logoutContainer.style.display = "none";
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

    currentUserEmail = localStorage.getItem("currentUserEmail");
    if (currentUserEmail) {
        const emailKey = emailToKey(currentUserEmail);
        const userRef = ref(db, `users/${emailKey}`);
        get(userRef)
            .then(snapshot => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    currentUserBobux = userData.bobux || 0;
                    document.getElementById("bobux").textContent = `Bobux: ${currentUserBobux}`;
                }
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
            });
    }

    // Generic function to render cards into a grid
    function renderCards(grid, entries, type) {
        grid.innerHTML = '';
        entries.forEach(([key, item]) => {
            const card = document.createElement('div');
            card.className = 'shirt-card';
            const price = item.price || 0;
            const priceText = price === 0 ? 'Free' : `${price} Bobux`;

            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">${priceText}</p>
            `;

            card.addEventListener('click', () => {
                selectedItem = item;
                selectedItemKey = key;
                selectedItemType = type;
                showPurchaseModal(item, type);
            });

            grid.appendChild(card);
        });
    }

    async function loadShirts() {
        shirtsGrid.innerHTML = '<div class="loading">Loading shirts...</div>';
        try {
            const snapshot = await get(ref(db, 'shirts'));
            if (snapshot.exists()) {
                const entries = Object.entries(snapshot.val());
                if (entries.length === 0) {
                    shirtsGrid.innerHTML = '<div class="no-shirts">No shirts available yet.</div>';
                } else {
                    renderCards(shirtsGrid, entries, 'shirt');
                }
            } else {
                shirtsGrid.innerHTML = '<div class="no-shirts">No shirts available yet.</div>';
            }
        } catch (error) {
            console.error("Error loading shirts:", error);
            shirtsGrid.innerHTML = '<div class="no-shirts">Error loading shirts.</div>';
        }
    }

    async function loadFaces() {
        facesGrid.innerHTML = '<div class="loading">Loading faces...</div>';
        try {
            const snapshot = await get(ref(db, 'faces'));
            if (snapshot.exists()) {
                const entries = Object.entries(snapshot.val());
                if (entries.length === 0) {
                    facesGrid.innerHTML = '<div class="no-shirts">No faces available yet.</div>';
                } else {
                    renderCards(facesGrid, entries, 'face');
                }
            } else {
                facesGrid.innerHTML = '<div class="no-shirts">No faces available yet.</div>';
            }
        } catch (error) {
            console.error("Error loading faces:", error);
            facesGrid.innerHTML = '<div class="no-shirts">Error loading faces.</div>';
        }
    }

    function showPurchaseModal(item, type) {
        const price = item.price || 0;
        const priceText = price === 0 ? 'Free' : `${price} Bobux`;
        const label = type === 'face' ? 'Face' : 'Shirt';

        document.getElementById("purchaseTitle").textContent = `Purchase ${label}?`;
        document.getElementById("purchaseItemImage").src = item.image;
        document.getElementById("purchaseItemName").textContent = item.name;
        document.getElementById("purchaseItemPrice").textContent = `Price: ${priceText}`;

        purchaseContainer.style.display = "flex";
        purchaseConfirm.style.opacity = "1";
        purchaseConfirm.style.pointerEvents = "auto";
        content.style.filter = "blur(10px)";
        purchaseConfirm.classList.remove("FadeOut");
        void purchaseConfirm.offsetWidth;
        purchaseConfirm.classList.add("FadeIn");
    }

    function closePurchaseModal() {
        purchaseConfirm.classList.remove("FadeIn");
        void purchaseConfirm.offsetWidth;
        purchaseConfirm.classList.add("FadeOut");
        setTimeout(() => {
            purchaseConfirm.style.opacity = "0";
            purchaseConfirm.style.pointerEvents = "none";
            purchaseContainer.style.display = "none";
            content.style.filter = "none";
            purchaseConfirm.classList.remove("FadeOut");
        }, 300);
    }

    async function purchaseItem() {
        if (!selectedItem || !currentUserEmail || !selectedItemKey) {
            alert("Unable to process purchase. Please try again.");
            closePurchaseModal();
            return;
        }

        const itemPrice = selectedItem.price || 0;

        if (itemPrice > 0 && currentUserBobux < itemPrice) {
            alert("Not enough Bobux!");
            closePurchaseModal();
            return;
        }

        try {
            const emailKey = emailToKey(currentUserEmail);
            const userRef = ref(db, `users/${emailKey}`);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                alert("User data not found. Please try logging in again.");
                closePurchaseModal();
                return;
            }

            const userData = snapshot.val();

            if (selectedItemType === 'shirt') {
                let ownedShirts = userData.ownedShirts;
                if (!ownedShirts || typeof ownedShirts !== 'object') {
                    ownedShirts = [];
                } else if (!Array.isArray(ownedShirts)) {
                    ownedShirts = Object.values(ownedShirts);
                }

                if (ownedShirts.includes(selectedItemKey)) {
                    alert("You already own this shirt!");
                    closePurchaseModal();
                    return;
                }

                ownedShirts.push(selectedItemKey);
                const updateData = { ownedShirts, currentShirt: selectedItemKey };

                if (itemPrice > 0) {
                    updateData.bobux = currentUserBobux - itemPrice;
                    await payCreator(selectedItem, itemPrice);
                }

                await update(userRef, updateData);
                if (itemPrice > 0) {
                    currentUserBobux = updateData.bobux;
                    document.getElementById("bobux").textContent = `Bobux: ${currentUserBobux}`;
                }

            } else if (selectedItemType === 'face') {
                let ownedFaces = userData.ownedFaces;
                if (!ownedFaces || typeof ownedFaces !== 'object') {
                    ownedFaces = [];
                } else if (!Array.isArray(ownedFaces)) {
                    ownedFaces = Object.values(ownedFaces);
                }

                if (ownedFaces.includes(selectedItemKey)) {
                    alert("You already own this face!");
                    closePurchaseModal();
                    return;
                }

                ownedFaces.push(selectedItemKey);
                const updateData = { ownedFaces, currentFace: selectedItemKey };

                if (itemPrice > 0) {
                    updateData.bobux = currentUserBobux - itemPrice;
                    await payCreator(selectedItem, itemPrice);
                }

                await update(userRef, updateData);
                if (itemPrice > 0) {
                    currentUserBobux = updateData.bobux;
                    document.getElementById("bobux").textContent = `Bobux: ${currentUserBobux}`;
                }
            }

            const label = selectedItemType === 'face' ? 'face' : 'shirt';
            alert(itemPrice === 0 ? `Free ${label} claimed!` : `${label.charAt(0).toUpperCase() + label.slice(1)} purchased successfully!`);
            closePurchaseModal();

        } catch (error) {
            console.error("Error purchasing item:", error);
            alert("Purchase failed. Please check your connection and try again.");
            closePurchaseModal();
        }
    }

    async function payCreator(item, price) {
        if (!item.creatorEmail || item.creatorEmail === currentUserEmail) return;
        try {
            const creatorKey = emailToKey(item.creatorEmail);
            const creatorRef = ref(db, `users/${creatorKey}`);
            const creatorSnapshot = await get(creatorRef);
            if (creatorSnapshot.exists()) {
                const creatorBobux = (creatorSnapshot.val().bobux || 0) + price;
                await update(creatorRef, { bobux: creatorBobux });
            }
        } catch (e) {
            console.error("Error paying creator:", e);
        }
    }

    const purchaseYesBtn = purchaseConfirm?.querySelector(".purchase-yes");
    const purchaseNoBtn = purchaseConfirm?.querySelector(".purchase-no");

    purchaseYesBtn?.addEventListener("click", purchaseItem);
    purchaseNoBtn?.addEventListener("click", closePurchaseModal);

    loadShirts();
    loadFaces();
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

    let currentUserBobux = 0;
    let currentUserEmail = "";
    let selectedShirt = null;

    // Check if logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
        window.location.href = "index.html";
        return;
    }

    // Sidebar toggle
    openSidebarBtn?.addEventListener("click", () => sidebar.classList.add("active"));
    closeSidebarBtn?.addEventListener("click", () => sidebar.classList.remove("active"));

    // Dark mode toggle
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

    // Logout confirmation
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

    // Fetch user data and bobux
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
            .catch(console.error);
    }

    // Load shirts from Firebase
    async function loadShirts() {
        shirtsGrid.innerHTML = '<div class="loading">Loading shirts...</div>';
        
        try {
            const shirtsRef = ref(db, 'shirts');
            const snapshot = await get(shirtsRef);
            
            if (snapshot.exists()) {
                const shirts = snapshot.val();
                const shirtsArray = Object.values(shirts);
                
                if (shirtsArray.length === 0) {
                    shirtsGrid.innerHTML = '<div class="no-shirts">No shirts available yet.</div>';
                    return;
                }
                
                shirtsGrid.innerHTML = '';
                
                shirtsArray.forEach(shirt => {
                    const shirtCard = document.createElement('div');
                    shirtCard.className = 'shirt-card';
                    const price = shirt.price || 0;
                    const priceText = price === 0 ? 'Free' : `${price} Bobux`;
                    
                    shirtCard.innerHTML = `
                        <img src="${shirt.image}" alt="${shirt.name}">
                        <h3>${shirt.name}</h3>
                        <p class="price">${priceText}</p>
                        <p class="creator">by ${shirt.creator}</p>
                    `;
                    
                    shirtCard.addEventListener('click', () => {
                        selectedShirt = shirt;
                        showPurchaseModal(shirt);
                    });
                    
                    shirtsGrid.appendChild(shirtCard);
                });
            } else {
                shirtsGrid.innerHTML = '<div class="no-shirts">No shirts available yet.</div>';
            }
        } catch (error) {
            console.error("Error loading shirts:", error);
            shirtsGrid.innerHTML = '<div class="no-shirts">Error loading shirts. Please try again.</div>';
        }
    }

    // Show purchase modal
    function showPurchaseModal(shirt) {
        const purchaseShirtImage = document.getElementById("purchaseShirtImage");
        const purchaseShirtName = document.getElementById("purchaseShirtName");
        const purchaseShirtPrice = document.getElementById("purchaseShirtPrice");
        const purchaseShirtCreator = document.getElementById("purchaseShirtCreator");
        
        const price = shirt.price || 0;
        const priceText = price === 0 ? 'Free' : `${price} Bobux`;
        
        purchaseShirtImage.src = shirt.image;
        purchaseShirtName.textContent = shirt.name;
        purchaseShirtPrice.textContent = `Price: ${priceText}`;
        purchaseShirtCreator.textContent = `Creator: ${shirt.creator}`;
        
        purchaseContainer.style.display = "flex";
        purchaseConfirm.style.opacity = "1";
        purchaseConfirm.style.pointerEvents = "auto";
        content.style.filter = "blur(10px)";
        purchaseConfirm.classList.remove("FadeOut");
        void purchaseConfirm.offsetWidth;
        purchaseConfirm.classList.add("FadeIn");
    }

    // Close purchase modal
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

    // Purchase shirt
    async function purchaseShirt() {
        if (!selectedShirt || !currentUserEmail) return;
        
        const shirtPrice = selectedShirt.price || 0;
        
        // Check if user has enough bobux (only if shirt costs something)
        if (shirtPrice > 0 && currentUserBobux < shirtPrice) {
            alert("Not enough Bobux!");
            closePurchaseModal();
            return;
        }
        
        try {
            const emailKey = emailToKey(currentUserEmail);
            const userRef = ref(db, `users/${emailKey}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const ownedShirts = userData.ownedShirts || [];
                
                // Check if already owned
                if (ownedShirts.includes(selectedShirt.id)) {
                    alert("You already own this shirt!");
                    closePurchaseModal();
                    return;
                }
                
                // Add shirt to owned and deduct bobux if necessary
                ownedShirts.push(selectedShirt.id);
                const updateData = {
                    ownedShirts: ownedShirts,
                    currentShirt: selectedShirt.id // Auto-equip purchased shirt
                };
                
                // Only deduct bobux if the shirt costs something
                if (shirtPrice > 0) {
                    const newBobux = currentUserBobux - shirtPrice;
                    updateData.bobux = newBobux;
                    currentUserBobux = newBobux;
                    document.getElementById("bobux").textContent = `Bobux: ${currentUserBobux}`;
                }
                
                await update(userRef, updateData);
                
                const message = shirtPrice === 0 ? 
                    "Free shirt claimed and equipped successfully!" : 
                    "Shirt purchased and equipped successfully!";
                alert(message);
                closePurchaseModal();
            }
        } catch (error) {
            console.error("Error purchasing shirt:", error);
            alert("Purchase failed. Please try again.");
        }
    }

    // Purchase modal buttons
    const purchaseYesBtn = purchaseConfirm?.querySelector(".purchase-yes");
    const purchaseNoBtn = purchaseConfirm?.querySelector(".purchase-no");
    
    purchaseYesBtn?.addEventListener("click", purchaseShirt);
    purchaseNoBtn?.addEventListener("click", closePurchaseModal);

    // Load shirts on page load
    loadShirts();
});
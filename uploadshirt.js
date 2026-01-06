import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
	apiKey: "AIzaSyAaxU10m2NHhGbciOMiUfhSrHeks8QujXg",
	authDomain: "bobloxauth2.firebaseapp.com",
	databaseURL: "https://bobloxauth2-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "bobloxauth2",
	storageBucket: "bobloxauth2.firebasedatabase.app",
	messagingSenderId: "302659528234",
	appId: "1:302659528234:web:ce6b02d848a991fc0c0553"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const CLOUD_NAME = "dzmk4sss2";
const UPLOAD_PRESET_IMAGE = "boblox";

const form = document.querySelector("form");
const submitButton = document.querySelector(".submit");

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const shirtName = document.getElementById("shirtName").value.trim();
	const shirtImageFile = document.getElementById("shirtImage").files[0];
	const shirtPrice = parseInt(document.getElementById("shirtPrice").value) || 0;

	if (!shirtName || !shirtImageFile) {
		alert("Please fill all fields and select an image.");
		return;
	}

	submitButton.disabled = true;
	submitButton.style.opacity = "0.6";
	submitButton.style.cursor = "not-allowed";
	const originalButtonText = submitButton.value;
	submitButton.value = "Uploading...";

	let username = "Unknown";
	const currentEmail = localStorage.getItem("currentUserEmail");
	if (currentEmail) {
		const emailKey = currentEmail.replace(".", "_");
		const userRef = ref(db, `users/${emailKey}`);
		const snapshot = await get(userRef);
		if (snapshot.exists()) username = snapshot.val().username;
	}

	const shirtId = Date.now();

	try {
		submitButton.value = "Uploading image...";

		const imageData = new FormData();
		imageData.append("file", shirtImageFile);
		imageData.append("upload_preset", UPLOAD_PRESET_IMAGE);
		const imageRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
			method: "POST",
			body: imageData
		});
		const imageJson = await imageRes.json();

		submitButton.value = "Saving to database...";

		const imageUrlHttp = imageJson.secure_url.replace("https://", "http://");

		await set(ref(db, `shirts/${shirtId}`), {
			id: shirtId,
			name: shirtName,
			image: imageUrlHttp,
			price: shirtPrice,
			creator: username,
			uploadedAt: new Date().toISOString()
		});

		alert("T-Shirt uploaded successfully!");
		form.reset();
	} catch (err) {
		console.error(err);
		alert("Upload failed. Check console.");
	} finally {
		submitButton.disabled = false;
		submitButton.style.opacity = "1";
		submitButton.style.cursor = "pointer";
		submitButton.value = originalButtonText;
	}
});

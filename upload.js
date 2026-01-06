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
const UPLOAD_PRESET_GAME = "boblox";

const form = document.getElementById("uploadForm");
const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const name = document.getElementById("gameName").value.trim();
	const desc = document.getElementById("gameDesc").value.trim();
	const iconFile = document.getElementById("gameIcon").files[0];
	const gameFile = document.getElementById("gameFile").files[0];

	if (!name || !desc || !iconFile || !gameFile) {
		alert("Please fill all fields and select files.");
		return;
	}

	submitButton.disabled = true;
	submitButton.style.opacity = "0.6";
	submitButton.style.cursor = "not-allowed";
	const originalButtonText = submitButton.value || submitButton.textContent;
	if (submitButton.value !== undefined) {
		submitButton.value = "Uploading...";
	} else {
		submitButton.textContent = "Uploading...";
	}

	let username = "Unknown";
	const currentEmail = localStorage.getItem("currentUserEmail");
	if (currentEmail) {
		const emailKey = currentEmail.replace(".", "_");
		const userRef = ref(db, `users/${emailKey}`);
		const snapshot = await get(userRef);
		if (snapshot.exists()) username = snapshot.val().username;
	}

	const gameId = Date.now();

	try {
		if (submitButton.value !== undefined) {
			submitButton.value = "Uploading icon...";
		} else {
			submitButton.textContent = "Uploading icon...";
		}

		const iconData = new FormData();
		iconData.append("file", iconFile);
		iconData.append("upload_preset", UPLOAD_PRESET_IMAGE);
		const iconRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
			method: "POST",
			body: iconData
		});
		const iconJson = await iconRes.json();

		if (submitButton.value !== undefined) {
			submitButton.value = "Uploading game file...";
		} else {
			submitButton.textContent = "Uploading game file...";
		}

		const gameData = new FormData();
		gameData.append("file", gameFile);
		gameData.append("upload_preset", UPLOAD_PRESET_GAME);
		const gameRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
			method: "POST",
			body: gameData
		});
		const gameJson = await gameRes.json();

		if (submitButton.value !== undefined) {
			submitButton.value = "Saving to database...";
		} else {
			submitButton.textContent = "Saving to database...";
		}

		const iconUrlHttp = iconJson.secure_url.replace("https://", "http://");
		const gameUrlHttp = gameJson.secure_url.replace("https://", "http://");

		await set(ref(db, `games/${gameId}`), {
			id: gameId,
			name,
			description: desc,
			icon: iconUrlHttp,
			file: gameUrlHttp,
			creator: username
		});

		alert("Game uploaded successfully!");
		form.reset();
	} catch (err) {
		console.error(err);
		alert("Upload failed. Check console.");
	} finally {
		submitButton.disabled = false;
		submitButton.style.opacity = "1";
		submitButton.style.cursor = "pointer";
		if (submitButton.value !== undefined) {
			submitButton.value = originalButtonText;
		} else {
			submitButton.textContent = originalButtonText;
		}
	}
});

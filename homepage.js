import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// the firebase database config(important)
const firebaseConfig = {
    apiKey: "AIzaSyAaxU10m2NHhGbciOMiUfhSrHeks8QujXg",
    authDomain: "bobloxauth2.firebaseapp.com",
    databaseURL: "https://bobloxauth2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bobloxauth2",
    storageBucket: "bobloxauth2.firebasestorage.app",
    messagingSenderId: "302659528234",
    appId: "1:302659528234:web:ce6b02d848a991fc0c0553"
};

// initialize firebase(gets firebase into the script)
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// converts email to Firebase key(we use this later on the script)
function emailToKey(email) {
    return email.replace(/\./g, "_");
}


let confirm = document.querySelector(".confirm");
confirm.style.display = "none";

document.querySelector(".logout").addEventListener("click", Confirm);

function Confirm() {
    confirm.style.display = "block";
    document.getElementById("content").style.filter = "blur(10px)";
    confirm.classList.remove("FadeOut");
    void confirm.offsetWidth;
    confirm.classList.add("FadeIn");
}

document.querySelector(".no").addEventListener("click", no);

function no() {
    confirm.classList.remove("FadeIn");
    void confirm.offsetWidth; 
    confirm.classList.add("FadeOut");

    setTimeout(() => {
        confirm.style.display = "none";
        document.getElementById("content").style.filter = "none";
        confirm.classList.remove("FadeOut"); 
    }, 250);
}

document.querySelector(".yes").addEventListener("click", yes);

function yes() {
    window.location.href = "index.html";
}

// name on homepage thing
const currentEmail = localStorage.getItem("currentUserEmail");

if (currentEmail) {
    const emailKey = emailToKey(currentEmail); //gets the email and converts it to a key
    const userRef = ref(db, `users/${emailKey}`);

    // checks if the user exists and then gets the username and displays it
    get(userRef).then(snapshot => {
        if (snapshot.exists()) {
            const username = snapshot.val().username;
            document.getElementById("hello").textContent = `Hello, ${username}`; // gets the username here
        } else {
            console.log("No user data found"); // if no user data found
        }
    }).catch(error => {
        console.error("Error fetching user data:", error);
    });
} else {
    console.log("No logged in user found");
}

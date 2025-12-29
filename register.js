import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import leoProfanity from 'https://cdn.skypack.dev/leo-profanity';

leoProfanity.loadDictionary();

const firebaseConfig = { 
  apiKey: "AIzaSyAaxU10m2NHhGbciOMiUfhSrHeks8QujXg",
  authDomain: "bobloxauth2.firebaseapp.com",
  databaseURL: "https://bobloxauth2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bobloxauth2",
  storageBucket: "bobloxauth2.firebasestorage.app",
  messagingSenderId: "302659528234",
  appId: "1:302659528234:web:ce6b02d848a991fc0c0553"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- UTILITIES ---

function emailToKey(email) { return email.replace(/\./g, "_"); }

function normalizeLeet(text) {
  return text.toLowerCase()
    .replace(/1/g, "i").replace(/!/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/@/g, "a").replace(/5/g, "s")
    .replace(/7/g, "t").replace(/0/g, "o").replace(/\$/g, "s")
    .replace(/9/g, "g").replace(/v/g, "u");
}

function generateNumericUID(length = 12) {
  let uid = '';
  for (let i = 0; i < length; i++) { uid += Math.floor(Math.random() * 10); }
  return uid;
}

async function getUniqueNumericUID() {
  let uid = generateNumericUID();
  const snapshot = await get(ref(db, 'uids/' + uid));
  if (snapshot.exists()) return await getUniqueNumericUID();
  return uid;
}

async function saveUserToFirebase(username, email, password, otp) {
  const key = emailToKey(email);
  const userRef = ref(db, 'users/' + key);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) { alert("An account with this email already exists."); return false; }
    const allUsersRef = ref(db, 'users');
    const allUsersSnap = await get(allUsersRef);
    if (allUsersSnap.exists()) {
      const users = allUsersSnap.val();
      for (let uKey in users) {
        if (users[uKey].username.toLowerCase() === username.toLowerCase()) {
          alert("This username is already taken."); return false;
        }
      }
    }
    const uid = await getUniqueNumericUID();
    await set(ref(db, 'uids/' + uid), true);
    await set(userRef, { username, email, password, OTP: otp, bobux: 0, uid: uid, avatar_id: 1 });
    return true;
  } catch (err) { return false; }
}

// --- REDIRECT LOGIC WITH YOUR EDITED DIV ---

function redirectToUnity(email, uid) {
  const deepLink = `yourgame://login?userId=${encodeURIComponent(uid)}&email=${encodeURIComponent(email)}`;
  
  // Apply a body reset to prevent scrollbars or stretching
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

  document.body.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('images/blue.jpg') no-repeat center center; background-size: cover; display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: sans-serif;">
      <div style="background: rgba(53, 53, 54, 0.7); padding: 40px; border-radius: 10px; border: 2px solid rgba(39, 39, 39, 0.4); text-align: center; width: 320px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); backdrop-filter: blur(5px);">
        <h2 style="color: white; margin: 0 0 10px 0;">Success! ✅</h2>
        <p style="color: white; margin-bottom: 30px; font-size: 14px;">Where to go next?</p>
        
        <button id="goLauncher" style="width: 120px; height: 40px; margin: 10px 5px; background-color: rgb(83, 255, 98); border: none; border-radius: 15px; color: white; font-weight: 600; cursor: pointer; transition: 0.2s;">
           Launcher
        </button>
        
        <button id="goHome" style="width: 120px; height: 40px; margin: 10px 5px; background-color: rgb(83, 255, 98); border: none; border-radius: 15px; color: white; font-weight: 600; cursor: pointer; transition: 0.2s;">
           Website
        </button>
      </div>
    </div>
  `;

  document.getElementById("goLauncher").onclick = () => { window.location.href = deepLink; };
  document.getElementById("goHome").onclick = () => { window.location.href = "homepage.html"; };
}

// --- DOM LISTENERS ---

window.addEventListener("DOMContentLoaded", () => {
  const policy = document.getElementById("policy");
  const wrapper = document.getElementById("wrapper");
  const lockBtn = document.getElementById("lockBtn");
  const lockImg = document.getElementById("lock");
  const passwInput = document.getElementById("passwinput");
  const registerBtn = document.getElementById("registerBtn");
  const policyLink = document.getElementById("policyLink");
  const closePolicyBtn = document.getElementById("closePolicyBtn");
  const step2 = document.querySelector(".step2");
  const emailadress = document.getElementById("emailAdress");
  const verifyemail = document.getElementById("VerifyEmail");
  const inputs = document.querySelectorAll(".otp-group input");
  const verifybutton = document.getElementById("verifyBtn");
  const changeEmailBtn = document.getElementById("changeEmailBtn");

  let OTP = ""; let currentUID = "";

  if (localStorage.getItem("isLoggedIn") == "true") { window.location.href = "homepage.html"; }

  if (lockBtn) lockBtn.addEventListener("click", () => {
    passwInput.type = passwInput.type === "password" ? "text" : "password";
    lockImg.src = passwInput.type === "text" ? "images/buttons/openlock.svg" : "images/buttons/bxs-lock-alt.svg";
  });

  if (policyLink) policyLink.onclick = (e) => { e.preventDefault(); policy.style.display = "block"; wrapper.style.display = "none"; };
  if (closePolicyBtn) closePolicyBtn.onclick = () => { policy.style.display = "none"; wrapper.style.display = "block"; };
  if (changeEmailBtn) changeEmailBtn.onclick = () => { wrapper.style.display = "block"; step2.style.display = "none"; };

  if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
      const username = document.getElementById("usernameInput").value.trim();
      const email = emailadress.value.trim();
      const password = passwInput.value.trim();

      if (username.length < 3 || leoProfanity.check(normalizeLeet(username))) { alert("Invalid Username"); return; }
      if (password.length < 8) { alert("Password too short"); return; }
      
      OTP = Math.floor(1000 + Math.random() * 9000);
      const success = await saveUserToFirebase(username, email, password, OTP);
      if (!success) return;

      const snap = await get(ref(db, 'users/' + emailToKey(email)));
      currentUID = snap.val().uid;
      localStorage.setItem("currentUserEmail", email);

      if (typeof emailjs !== "undefined") {
        emailjs.send("service_v75vfw9", "template_evofvnp", { from_name: "PolyTopia", username, OTP, reply_to: email })
        .then(() => {
          wrapper.style.display = "none";
          step2.style.display = "block";
          if (verifyemail) verifyemail.textContent = email;
        });
      }
    });
  }

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
      verifybutton.classList.toggle("disable", ![...inputs].every(inp => inp.value !== ""));
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) inputs[index - 1].focus();
    });
  });

  if (verifybutton) {
    verifybutton.addEventListener("click", () => {
      let val = ""; inputs.forEach(i => val += i.value);
      if (OTP == val) {
        localStorage.setItem("isLoggedIn", "true");
        redirectToUnity(localStorage.getItem("currentUserEmail"), currentUID);
      } else { alert("Wrong OTP"); }
    });
  }
  if (typeof emailjs !== "undefined") emailjs.init("2CIHURV52vHS09X70");
});
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

function emailToKey(email) {
  return email.replace(/\./g, "_");
}

function normalizeLeet(text) {
  return text
    .toLowerCase()
    .replace(/1/g, "i")
    .replace(/!/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/@/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/0/g, "o")
    .replace(/\$/g, "s")
    .replace(/9/g, "g")
    .replace(/v/g, "u");
}

function generateNumericUID(length = 12) {
  let uid = '';
  for (let i = 0; i < length; i++) {
    uid += Math.floor(Math.random() * 10);
  }
  return uid;
}

async function getUniqueNumericUID() {
  let uid = generateNumericUID();
  const snapshot = await get(ref(db, 'uids/' + uid));
  if (snapshot.exists()) {
    return await getUniqueNumericUID();
  }
  return uid;
}

async function saveUserToFirebase(username, email, password, otp) {
  const key = emailToKey(email);
  const userRef = ref(db, 'users/' + key);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      alert("An account with this email already exists.");
      return false;
    }

    const allUsersRef = ref(db, 'users');
    const allUsersSnap = await get(allUsersRef);
    if (allUsersSnap.exists()) {
      const users = allUsersSnap.val();
      for (let uKey in users) {
        if (users[uKey].username.toLowerCase() === username.toLowerCase()) {
          alert("This username is already taken.");
          return false;
        }
      }
    }

    const uid = await getUniqueNumericUID();
    await set(ref(db, 'uids/' + uid), true);

    await set(userRef, {
      username,
      email,
      password,
      OTP: otp,
      bobux: 0,
      uid: uid,
      avatar_id: 1
    }); 
    console.log("User saved to Firebase:", key);
    return true;

  } catch (err) {
    console.error("Firebase save error:", err);
    return false;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const policy = document.getElementById("policy");
  const wrapper = document.getElementById("wrapper");
  const lockBtn = document.getElementById("lockBtn");
  const lockImg = document.getElementById("lock");
  const passwInput = document.getElementById("passwinput");
  const registerBtn = document.getElementById("registerBtn");
  const policyLink = document.getElementById("policyLink");
  const closePolicyBtn = document.getElementById("closePolicyBtn");

  const step2 = document.querySelector(".step2"),
        step3 = document.querySelector(".step3"),
        emailadress = document.getElementById("emailAdress"),
        verifyemail = document.getElementById("VerifyEmail"),
        inputs = document.querySelectorAll(".otp-group input"),
        verifybutton = document.getElementById("verifyBtn"),
        changeEmailBtn = document.getElementById("changeEmailBtn");

  let OTP = "";

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn == "true") {
    window.location.href = "homepage.html";
  }

  let val = localStorage.getItem("savedInput");
  if (val) {
    document.getElementById("usernameInput").value = val;
  }

  function Unlock() {
    if (passwInput.type === "password") {
      passwInput.type = "text";
      lockImg.src = "images/buttons/openlock.svg";
    } else {
      passwInput.type = "password";
      lockImg.src = "images/buttons/bxs-lock-alt.svg";
    }
  }

  function Policy() {
    policy.style.display = "block";
    wrapper.style.display = "none";
    policy.classList.add("FadeIn");
  }

  function ClosePolicy() {
    policy.style.display = "none";
    wrapper.style.display = "block";
    wrapper.classList.add("FadeIn");
  }

  function showEmailVerification() {
    if (wrapper) wrapper.style.display = "none";
    if (step2) step2.style.display = "block";
    if (step3) step3.style.display = "none";
  }

  function changeMyEmail() {
    if (wrapper) wrapper.style.display = "block";
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "none";
  }

  const ValidateEmail = (email) => {
    let re = /\S+@\S+\.\S+/;
    if (registerBtn) {
      if (re.test(email)) registerBtn.classList.remove("disable");
      else registerBtn.classList.add("disable");
    }
  };

  const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

  function validateForm() {
    const username = document.getElementById("usernameInput").value.trim();
    const email = emailadress.value.trim();
    const password = passwInput.value.trim();
    if (username.length < 3) {
      alert("Username must be at least 3 characters long.");
      return false;
    } else if (leoProfanity.check(normalizeLeet(username))) {
      alert("Username contains inappropriate language.");
      return false;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return false;
    }
    let re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      alert("Please enter a valid email.");
      return false;
    }
    const currentUserEmail = email;
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUserEmail", currentUserEmail);
    return true; 
  }

  if (lockBtn) lockBtn.addEventListener("click", Unlock);
  if (policyLink) policyLink.addEventListener("click", (e) => { e.preventDefault(); Policy(); });
  if (closePolicyBtn) closePolicyBtn.addEventListener("click", ClosePolicy);
  if (changeEmailBtn) changeEmailBtn.addEventListener("click", (e) => { e.preventDefault(); changeMyEmail(); });
  if (emailadress) emailadress.addEventListener("input", (e) => ValidateEmail(e.target.value));

  if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
      if (!validateForm()) return;
      const username = document.getElementById("usernameInput").value.trim();
      const email = emailadress.value.trim();
      const password = passwInput.value.trim();
      OTP = generateOTP();
      const success = await saveUserToFirebase(username, email, password, OTP);
      if (!success) return;
      localStorage.setItem("currentUserEmail", email);
      registerBtn.innerHTML = "&#9889; Sending...";
      const templateParameter = {
        from_name: "PolyTopia",
        username: username,
        OTP: OTP,
        message: "OTP for your account",
        reply_to: email,
      };
      if (typeof emailjs !== "undefined") {
        emailjs.send("service_v75vfw9", "template_evofvnp", templateParameter).then(
          (res) => {
            console.log(res);
            registerBtn.innerHTML = "Register";
            showEmailVerification();
            if (verifyemail) verifyemail.textContent = email;
          },
          (err) => {
            console.error(err);
            registerBtn.innerHTML = "Register";
          }
        );
      }
    });
  }

  if (inputs && verifybutton) {
    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
        if (e.target.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
        if ([...inputs].every(inp => inp.value !== "")) verifybutton.classList.remove("disable");
        else verifybutton.classList.add("disable");
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && index > 0) inputs[index - 1].focus();
      });
    });
  }

  if (verifybutton) {
    verifybutton.addEventListener("click", () => {
      let values = "";
      inputs.forEach((input) => values += input.value);
      if (OTP == values) {
        if (step2) step2.style.display = "none";
        if (step3) step3.style.display = "block";
      } else {
        verifybutton.classList.add("error-shake");
        setTimeout(() => verifybutton.classList.remove("error-shake"), 1000);
      }
    });
  }

  if (wrapper) wrapper.classList.add("FadeIn");

  if (typeof emailjs !== "undefined") emailjs.init("2CIHURV52vHS09X70");
});

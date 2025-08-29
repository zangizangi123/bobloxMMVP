// ===== Register & Policy Scripts =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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

// Helper: Convert email to Firebase-safe key
function emailToKey(email) {
  return email.replace(/\./g, "_");
}

// Wait for DOMContentLoaded to ensure all elements exist
window.addEventListener("DOMContentLoaded", () => {
  const policy = document.getElementById("policy");
  const wrapper = document.getElementById("wrapper");
  const lockBtn = document.getElementById("lockBtn");
  const lockImg = document.getElementById("lock");
  const passwInput = document.getElementById("passwinput");
  const registerBtn = document.getElementById("registerBtn");
  const policyLink = document.getElementById("policyLink");
  const closePolicyBtn = document.getElementById("closePolicyBtn");

  const step1 = document.querySelector(".step1"),
        step2 = document.querySelector(".step2"),
        step3 = document.querySelector(".step3"),
        emailadress = document.getElementById("emailAdress"),
        verifyemail = document.getElementById("VerifyEmail"),
        inputs = document.querySelectorAll(".otp-group input"),
        nextbutton = document.getElementById("nextBtn"),
        verifybutton = document.getElementById("verifyBtn"),
        changeEmailBtn = document.getElementById("changeEmailBtn");

  let OTP = "";

  // Unlock password visibility
  function Unlock() {
    if (passwInput.type === "password") {
      passwInput.type = "text";
      lockImg.src = "images/buttons/openlock.svg";
    } else {
      passwInput.type = "password";
      lockImg.src = "images/buttons/bxs-lock-alt.svg";
    }
  }

  // Validate registration form
  function validateForm() {
    let username = document.getElementById("usernameInput").value.trim();
    let password = passwInput.value.trim();
    let checkbox = document.getElementById("policyCheck").checked;

   if (username === "" || password === "" || !checkbox) {
      alert("Please fill in all fields and accept the Privacy Policy.");
    } else if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
    } else {
      showEmailVerification();
    }
  }

  // Show/hide policy modal
  function ClosePolicy() {
    policy.style.display = "none";
    wrapper.style.display = "block";
    wrapper.classList.add("FadeIn");
  }
  function Policy() {
    policy.style.display = "block";
    wrapper.style.display = "none";
    policy.classList.add("FadeIn");
  }

  // Show email verification step
  function showEmailVerification() {
    if (wrapper) wrapper.style.display = "none";
    if (step1) step1.style.display = "block";
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "none";
  }

  // Change email step
  function changeMyEmail() {
    if (step1) step1.style.display = "block";
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "none";
  }

  // OTP helpers
  const ValidateEmail = (email) => {
    let re = /\S+@\S+\.\S+/;
    if (nextbutton) {
      if (re.test(email)) nextbutton.classList.remove("disable");
      else nextbutton.classList.add("disable");
    }
  };
  const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

  // Save user info to Firebase
  async function saveUserToFirebase(username, email, password, otp) {
    const key = emailToKey(email);
    await set(ref(db, 'users/' + key), {
      username,
      email,
      password,
      OTP: otp
    });
  }

  // Attach event listeners
  if (lockBtn) lockBtn.addEventListener("click", Unlock);
  if (registerBtn) registerBtn.addEventListener("click", validateForm);
  if (policyLink) policyLink.addEventListener("click", (e) => { e.preventDefault(); Policy(); });
  if (closePolicyBtn) closePolicyBtn.addEventListener("click", ClosePolicy);
  if (changeEmailBtn) changeEmailBtn.addEventListener("click", (e) => { e.preventDefault(); changeMyEmail(); });
  if (emailadress) emailadress.addEventListener("input", (e) => ValidateEmail(e.target.value));

  // Fade in wrapper on load
  if (wrapper) wrapper.classList.add("FadeIn");

  // EmailJS setup
  if (typeof emailjs !== "undefined") {
    emailjs.init("2CIHURV52vHS09X70");
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "none";
    if (nextbutton) nextbutton.classList.add("disable");
    if (verifybutton) verifybutton.classList.add("disable");
  }

  // OTP input logic
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

  // OTP and EmailJS send
  const serviceID = "service_v75vfw9";
  const templateID = "template_evofvnp";

  if (nextbutton) {
    nextbutton.addEventListener("click", async () => {
      const username = document.getElementById("usernameInput").value.trim();
      const email = emailadress.value.trim();
      const pass = passwInput.value.trim();
      OTP = generateOTP();
      localStorage.setItem("currentUserEmail", email);

      // Save user info to Firebase (including OTP)
      await saveUserToFirebase(username, email, pass, OTP);

      nextbutton.innerHTML = "&#9889; Sending...";
      let templateParameter = {
        from_name: "Polytopia",
        username: username,
        OTP: OTP,
        message: "OTP for your account",
        reply_to: email,
      };

      emailjs.send(serviceID, templateID, templateParameter).then(
        (res) => {
          console.log(res);
          nextbutton.innerHTML = "Next &rarr;";
          if (step1) step1.style.display = "none";
          if (step2) step2.style.display = "block";
          if (step3) step3.style.display = "none";
        },
        (err) => {
          console.log(err);
          nextbutton.innerHTML = "Next &rarr;";
        }
      );
    });
  }

  if (verifybutton) {
    verifybutton.addEventListener("click", async () => {
      let values = "";
      inputs.forEach((input) => values += input.value);

      if (OTP == values) {
        if (step1) step1.style.display = "none";
        if (step2) step2.style.display = "none";
        if (step3) step3.style.display = "block";
      } else {
        verifybutton.classList.add("error-shake");
        setTimeout(() => verifybutton.classList.remove("error-shake"), 1000);
      }
    });
  }

});

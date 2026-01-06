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
  return text.toLowerCase()
    .replace(/1/g, "i").replace(/!/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/@/g, "a").replace(/5/g, "s")
    .replace(/7/g, "t").replace(/0/g, "o").replace(/\$/g, "s")
    .replace(/9/g, "g").replace(/v/g, "u");
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

function redirectToUnity(email, uid) {
  const deepLink = `yourgame://login?userId=${encodeURIComponent(uid)}&email=${encodeURIComponent(email)}`;
  
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

  document.body.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('images/blue.jpg') no-repeat center center; background-size: cover; display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: arial;">
      <div style="background: rgba(53, 53, 54, 0.7); padding: 40px; border-radius: 10px; border: 2px solid rgba(39, 39, 39, 0.4); text-align: center; width: 320px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); backdrop-filter: blur(5px);">
        <h2 style="color: white; margin: 0 0 10px 0;">Success! âœ…</h2>
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

  document.getElementById("goLauncher").onclick = () => { 
    window.location.href = deepLink; 
  };
  document.getElementById("goHome").onclick = () => { 
    window.location.href = "homepage.html"; 
  };
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
  const policyCheck = document.getElementById("policyCheck");
  const step2 = document.querySelector(".step2");
  const emailadress = document.getElementById("emailAdress");
  const verifyemail = document.getElementById("VerifyEmail");
  const inputs = document.querySelectorAll(".otp-group input");
  const verifybutton = document.getElementById("verifyBtn");
  const changeEmailBtn = document.getElementById("changeEmailBtn");

  let OTP = "";
  let currentUID = "";
  let pendingUserData = null;

  if (localStorage.getItem("isLoggedIn") === "true") { 
    window.location.href = "homepage.html"; 
  }

  if (lockBtn && lockImg && passwInput) {
    lockBtn.addEventListener("click", () => {
      passwInput.type = passwInput.type === "password" ? "text" : "password";
      lockImg.src = passwInput.type === "text" ? "images/buttons/openlock.svg" : "images/buttons/bxs-lock-alt.svg";
    });
  }

  if (policyLink && policy && wrapper) {
    policyLink.onclick = (e) => { 
      e.preventDefault(); 
      policy.style.display = "block"; 
      wrapper.style.display = "none"; 
    };
  }
  
  if (closePolicyBtn && policy && wrapper) {
    closePolicyBtn.onclick = () => { 
      policy.style.display = "none"; 
      wrapper.style.display = "block"; 
    };
  }
  
  if (changeEmailBtn && wrapper && step2) {
    changeEmailBtn.onclick = () => { 
      wrapper.style.display = "block"; 
      step2.style.display = "none";
  
      inputs.forEach(input => input.value = "");
      verifybutton.classList.add("disable");
    };
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
      const username = document.getElementById("usernameInput").value.trim();
      const email = emailadress.value.trim();
      const password = passwInput.value.trim();

      if (!policyCheck.checked) {
        alert("Please accept the Privacy Policy to continue");
        return;
      }

      if (!username || !email || !password) {
        alert("Please fill in all fields");
        return;
      }

      if (username.length < 3) {
        alert("Username must be at least 3 characters long");
        return;
      }

      if (leoProfanity.check(normalizeLeet(username))) {
        alert("Username contains inappropriate language");
        return;
      }

      if (password.length < 8) { 
        alert("Password must be at least 8 characters long"); 
        return; 
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
      }
      
      const key = emailToKey(email);
      const userRef = ref(db, 'users/' + key);
      
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) { 
          alert("An account with this email already exists."); 
          return; 
        }
        
        const allUsersRef = ref(db, 'users');
        const allUsersSnap = await get(allUsersRef);
        if (allUsersSnap.exists()) {
          const users = allUsersSnap.val();
          for (let uKey in users) {
            if (users[uKey].username.toLowerCase() === username.toLowerCase()) {
              alert("This username is already taken."); 
              return;
            }
          }
        }
        
        OTP = Math.floor(1000 + Math.random() * 9000);
        currentUID = await getUniqueNumericUID();
        
        pendingUserData = { username, email, password, OTP, uid: currentUID };
        
        localStorage.setItem("currentUserEmail", email);
        localStorage.setItem("currentUserUid", currentUID);

        if (typeof emailjs !== "undefined") {
          emailjs.send("service_v75vfw9", "template_evofvnp", { 
            from_name: "PolyTopia", 
            username, 
            OTP, 
            reply_to: email 
          })
          .then(() => {
            wrapper.style.display = "none";
            step2.style.display = "block";
            if (verifyemail) {
              verifyemail.textContent = email;
            }
          })
          .catch((error) => {
            console.error("Email send error:", error);
            alert("Failed to send verification email. Please try again.");
          });
        } else {
          console.warn("EmailJS not loaded");
          alert("Email service not available. Please refresh and try again.");
        }
      } catch (err) {
        console.error("Registration error:", err);
        alert("An error occurred. Please try again.");
      }
    });
  }

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      verifybutton.classList.toggle("disable", ![...inputs].every(inp => inp.value !== ""));
    });
    
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
      const digits = pastedData.split("");
      
      inputs.forEach((inp, idx) => {
        if (digits[idx]) {
          inp.value = digits[idx];
        }
      });
      
      const lastFilledIndex = Math.min(digits.length - 1, inputs.length - 1);
      inputs[lastFilledIndex].focus();
      
      verifybutton.classList.toggle("disable", ![...inputs].every(inp => inp.value !== ""));
    });
  });

  if (verifybutton) {
    verifybutton.addEventListener("click", async () => {
      let val = "";
      inputs.forEach(i => val += i.value);
      
      if (val.length !== 4) {
        alert("Please enter all 4 digits");
        return;
      }
      
      if (String(OTP) === String(val)) {
        if (pendingUserData) {
          try {
            await set(ref(db, 'uids/' + pendingUserData.uid), true);
            await set(ref(db, 'users/' + emailToKey(pendingUserData.email)), { 
              username: pendingUserData.username, 
              email: pendingUserData.email, 
              password: pendingUserData.password, 
              OTP: pendingUserData.OTP, 
              bobux: 0, 
              uid: pendingUserData.uid, 
              avatar_id: 1 
            });
            
            localStorage.setItem("isLoggedIn", "true");
            redirectToUnity(pendingUserData.email, pendingUserData.uid);
          } catch (err) {
            console.error("Failed to save user:", err);
            alert("Registration failed. Please try again.");
          }
        }
      } else { 
        console.log("OTP mismatch - Expected:", OTP, "Got:", val);
        alert("Incorrect OTP. Please try again."); 
        inputs.forEach(input => input.value = "");
        inputs[0].focus();
        verifybutton.classList.add("disable");
      }
    });
  }
  
  if (typeof emailjs !== "undefined") {
    emailjs.init("2CIHURV52vHS09X70");
  }
});

let policy = document.getElementById("policy");
let wrapper = document.getElementById("wrapper");

function Unlock() {
  let img = document.getElementById("lock")
  let input = document.getElementById("passwinput");

  if (input.type === "password") {
      input.type = "text";
      img.src = "images/buttons/openlock.svg";
  } else {
      input.type = "password";
      img.src = "images/buttons/bxs-lock-alt.svg";
  }
}

function validateForm() {
  let username = document.querySelector("input[placeholder='Username']").value.trim();
  let password = document.getElementById("passwinput").value.trim();
  let checkbox = document.querySelector(".check input").checked;

  if (username === "" || password === "" || !checkbox) {
      alert("Please fill in all fields and accept the Privacy Policy.");
  } else {
      window.location.href = "email.html";
  }
}


function ClosePolicy() {
  policy.style.display="none";
  wrapper.style.display="block";
  wrapper.classList.add("FadeIn");
}

function Policy() {
  policy.style.display="block";
  wrapper.style.display="none";
  policy.classList.add("FadeIn");
}

window.onload = function() {
  wrapper.classList.add("FadeIn");
};

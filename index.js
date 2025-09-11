function saveInput() {
  let value = document.getElementById("usernameInput").value;
  localStorage.setItem("savedInput", value); 
  window.location.href = "register.html"; 
}

function join() {
    window.location.href =  "register.html"; 
}
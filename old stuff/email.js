const step1 = document.querySelector(".step1"),
  step2 = document.querySelector(".step2"),
  step3 = document.querySelector(".step3"),
  emailadress = document.getElementById("emailAdress")
  verifyemail = document.getElementById("VerifyEmail")
  inputs = document.querySelectorAll(".otp-group input"),
  nextbutton = document.querySelector(".nextbutton")
  verifybutton = document.querySelector(".Verify");
let OTP="";

window.addEventListener("load", ()=>{
    emailjs.init("2CIHURV52vHS09X70")
  step2.style.display="none";
  step3.style.display="none";
  nextbutton.classList.add("disable");
  verifybutton.classList.add("disable");
});

const ValidateEmail = (email)=>{
  let re=/\S+@\S+\.\S+/;
  if(re.test(email)){
    nextbutton.classList.remove("disable");
  } else {
    nextbutton.classList.add("disable");
  }
}

const generateOTP = ()=>{
  return Math.floor(1000+Math.random()*9000);
};

inputs.forEach((input)=>{
  input.addEventListener("keyup", function(e) {
    if(this.value.length>=1) {
      e.target.value=e.target.value.substr(0, 1);
    }
    if(
      inputs[0].value!="" &&
      inputs[1].value!="" &&
      inputs[2].value!="" &&
      inputs[3].value!=""
    ){
      verifybutton.classList.remove("disable");
    }else{
      verifybutton.classList.add("disable");
    }
  });
});

const serviceID = "service_v75vfw9";
const templateID = "template_evofvnp";

nextbutton.addEventListener("click",()=>{
        OTP=generateOTP();
      nextbutton.innerHTML="&#9889; Sending..."
      let templateParameter={
        from_name:"Polytopia",
        OTP:OTP,
        message:"Please check out the email",
        reply_to:emailadress.value,
      };

    emailjs.send(serviceID, templateID, templateParameter).then(
    (res)=>{
      console.log(res);
      nextbutton.innerHTML="Next &rarr;"
      step1.style.display = "none";
      step2.style.display = "block";
      step3.style.display = "none";
    }, 
    (err)=>{
      console.log(err);
    }
  );
});

verifybutton.addEventListener("click",()=>{
  let values="";
  inputs.forEach((input)=>{
    values+=input.value;
  });

  if(OTP == values){
    step1.style.display = "none";
    step2.style.display = "none";
    step3.style.display = "block";
  }else{
    verifybutton.classList.add("error-shake")

    setTimeout(() => {
      verifybutton.classList.remove("error-shake")
    }, 1000);
  }
});

function changeMyEmail() { 
  step1.style.display = "block";
  step2.style.display = "none";
  step3.style.display = "none";
}
let keys;
//let secret;
let isValidOtp;
window.addEventListener('DOMContentLoaded', () => {
    const genOTPbtn = document.getElementById('genOTPbtn');
    const otpKeyInput = document.getElementById('otpKeyInput');
    const homeBtn = document.getElementById("homeBtn");
    const errorMessage = document.getElementById('error-message');
    if (genOTPbtn && otpKeyInput && homeBtn) {
      genOTPbtn.addEventListener('click', () => {
        const secrets = window.api.generateKeyOtp();
        localStorage.setItem("secretl", secrets);
        console.log('secretGen saved local: ',secrets);
      });
      otpKeyInput.addEventListener('keyup', () => {
        otpKeyInput.value = otpKeyInput.value.replace(/[^0-9]/g, '');
        if (otpKeyInput.value.length < 6 && otpKeyInput.value < 100000) {
          errorMessage.style.display = 'inline';
        } 
        if ((otpKeyInput.value.length >= 6 && otpKeyInput.value > 100000)) {
          console.log(otpKeyInput.value);
          errorMessage.style.display = 'none';          
          const secretg = localStorage.getItem("secretl");
          console.log('secret retrieved: ',secretg);
          let tokenInputUser = otpKeyInput.value;
          keys = [tokenInputUser,secretg];
          isValidOtp = window.api.checkOtp(keys);
          console.log(isValidOtp);
        }        
      });
      homeBtn.addEventListener('click', () => {
        enterHome();
      });
    } else {
      console.error('Un botón no fue encontrado en el DOM.');
    }
  });
  function enterHome()  {
    setTimeout(window.location.replace("../index.html"), 2000);
  }
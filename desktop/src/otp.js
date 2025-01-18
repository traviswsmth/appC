let keys;
let isValidOtp;
window.addEventListener('DOMContentLoaded', () => {
    const genOTPbtn = document.getElementById('genOTPbtn');
    const otpKeyInput = document.getElementById('otpKeyInput');
    const homeBtn = document.getElementById("homeBtn");
    if (genOTPbtn && otpKeyInput && homeBtn) {
      genOTPbtn.addEventListener('click', () => {
        keys  = window.api.otp();
        console.log('keys: ',keys);
      });
      genOTPbtn.addEventListener('mouseover', () => {
        console.log('pass: ',keys);
        isValidOtp = window.api.checkOtp(keys);
        console.log(isValidOtp);
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
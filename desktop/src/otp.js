let keys;
let isValidOtp;
window.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('homeButton');
    if (button) {
      button.addEventListener('click', () => {
        keys  = window.api.otp();
        console.log('keys: ',keys);
      });
      button.addEventListener('mouseover', () => {
        console.log('pass: ',keys);
        isValidOtp = window.api.checkOtp(keys);
        console.log(isValidOtp);
      });
    } else {
      console.error('El botón no fue encontrado en el DOM.');
    }
  });
  
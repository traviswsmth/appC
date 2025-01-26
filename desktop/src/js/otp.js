let keys;
//let secret;
let isValidOtp;
window.addEventListener('DOMContentLoaded', () => {
    const genOTPbtn = document.getElementById('genOTPbtn');
    const keyIn = document.getElementById('otpKeyInput');
    const homeBtn = document.getElementById("homeBtn");
    const genQRBtn = document.getElementById("genQRBtn");
    const errorMessage = document.getElementById('error-message');
    if (genOTPbtn && keyIn && homeBtn) {
      genOTPbtn.addEventListener('click', () => {
        const secrets = window.api.generateKeyOtp();
        //localStorage.setItem("secretl", secrets);
        if(localStorage.getItem("secretl"))
          console.log('An key has been generated before!');
        if(!localStorage.getItem("secretla"))
          console.log('An key has not been generated before!');
        genQR(secrets);
        localStorage.setItem("secretl", window.btoa(secrets));
        console.log('secretGen saved local: ',secrets);
      });
      keyIn.addEventListener('keyup', () => {
        keyIn.value = keyIn.value.replace(/[^0-9]/g, '');
        if (keyIn.value.length < 6 && keyIn.value < 100000) {
          errorMessage.style.display = 'inline';
        } 
        if (keyIn.value.length >= 6 && keyIn.value > 100000) {
          console.log(keyIn.value);
          errorMessage.style.display = 'none';
          if(keyIn.value.length<7)  {
            //const secretg = localStorage.getItem("secretl");
            const secretg = window.atob(localStorage.getItem("secretl"));
            console.log('secret retrieved: ',secretg);
            keys = [keyIn.value,secretg];
            isValidOtp = window.api.checkOtp(keys);
            console.log(isValidOtp);
          }
          //if (keyIn.value.length >= 8)
            //this.test();
        }        
      });
      homeBtn.addEventListener('click', () => {
        enterHome();
      });
      genQRBtn.addEventListener('click', () => {
        genQR();
      });
    } else {
      console.error('Un botón no fue encontrado en el DOM.');
    }
  });
  function enterHome()  {
    setTimeout(window.location.replace("../index.html"), 2000);
  }
function genQR(dataQR)  {
  var typeNumber = 4;
  var errorCorrectionLevel = 'L';
  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(dataQR);
  qr.make();
  document.getElementById('qr-code').innerHTML = qr.createImgTag();
}
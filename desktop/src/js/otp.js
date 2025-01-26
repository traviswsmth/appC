let keys;
let isValidOtp;
const qrCode = document.getElementById("qr-code");
const secretCode = document.getElementById('secret-code');
window.addEventListener('DOMContentLoaded', () => {
    const genOTPbtn = document.getElementById('genOTPbtn');
    const keyIn = document.getElementById('otpKeyInput');
    const homeBtn = document.getElementById("homeBtn");
    const errorMessage = document.getElementById('error-message');    
    if (genOTPbtn && keyIn && homeBtn) {
      genOTPbtn.addEventListener('click', async () => {
        if(localStorage.getItem("secretl") != null && localStorage.getItem("secretl") != "")  {
          console.log('The key has been generated before!');
          if (keyIn.value.length >= 8)  {
            const key = keyIn.value;
            const secretu = await digestMessageHex(key);
            localStorage.setItem("secretu", secretu);
            console.log('Secret user saved: ',secretu);
          }
        }          
        else  {
          console.log('The key has not been generated before!');
          const secrets = window.api.generateKeyOtp();          
          genQR(secrets[1]);
          localStorage.setItem("secretl", window.btoa(secrets[0]));
          secretCode.innerHTML = secrets[0];
          //console.log('secretGen saved local: ',secrets[0]);
        }
      });
      keyIn.addEventListener('keyup', async () => {
        keyIn.value = keyIn.value.replace(/[^0-9]/g, '');
        if (keyIn.value.length < 6 && keyIn.value < 100000) {
          errorMessage.style.display = 'inline';
        }
        if (keyIn.value.length >= 6 && keyIn.value > 100000) {
          console.log(keyIn.value);
          errorMessage.style.display = 'none';
          if(keyIn.value.length<7 && keyIn.value.length < 7 && keyIn.value < 999999)  {
            if(localStorage.getItem("secretl") != null && localStorage.getItem("secretl") != "")  {
              const secretg = window.atob(localStorage.getItem("secretl"));
              console.log('secret retrieved: ',secretg);
              keys = [keyIn.value,secretg];
              isValidOtp = window.api.checkOtp(keys);
              console.log(isValidOtp);
            }
          }
          if (keyIn.value.length >= 8)  {
            if(localStorage.getItem("secretu") != null && localStorage.getItem("secretu") != "")  {
              const su = localStorage.getItem("secretu");
              const hash = await digestMessageHex(keyIn.value);
              if(su === hash)
                console.log('Secret user OK');
            }            
          }
        }        
      });
      homeBtn.addEventListener('click', () => {
        enterHome();
      });
      qrCode.addEventListener('mouseover', () => {
        qrCode.style.filter = 'blur(0px)';
      });
      qrCode.addEventListener('mouseleave', () => {
        qrCode.style.filter = 'blur(2px)';
      });
      secretCode.addEventListener('mouseover', () => {
        secretCode.style.filter = 'blur(0px)';
      });
      secretCode.addEventListener('mouseleave', () => {
        secretCode.style.filter = 'blur(2px)';
      });
    } else {
      console.error('Un botón no fue encontrado en el DOM.');
    }
  });
  function enterHome()  {
    setTimeout(window.location.replace("../index.html"), 2000);
  }
function genQR(dataQR)  {
  const typeNumber = 0;
  const errorCorrectionLevel = 'L';
  const qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(dataQR);
  qr.make();
  qrCode.innerHTML = qr.createImgTag();
  setTimeout(hideQRCode, 60000);
  setTimeout(hideSecret, 60000);
}
function hideQRCode() {
  qrCode.style.display = 'none';
}
function hideSecret() {
  secretCode.style.display = 'none';
}
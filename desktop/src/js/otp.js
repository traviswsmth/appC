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
        const keyLength = keyIn.value.length;
        if(localStorage.getItem("secretl") != null && localStorage.getItem("secretl") != "")  {
          console.log('The key has been generated before!');
          if (keyLength >= 8)  {
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
        }
      });
      keyIn.addEventListener('keyup', async () => {        
        keyIn.value = keyIn.value.replace(/[^0-9]/g, '');
        const keyValue = Number(keyIn.value);
        const keyLength = keyIn.value.length;
        if (keyLength < 6 && keyValue < 100000)
          errorMessage.style.display = 'inline';
        
        if (keyLength >= 6 && keyValue > 100000) {
          errorMessage.style.display = 'none';
          if(keyLength<7 && keyValue < 999999)  {
            if(localStorage.getItem("secretl") != null && localStorage.getItem("secretl") != "")  {
              const secretg = window.atob(localStorage.getItem("secretl"));
              //console.log('secret retrieved: ',secretg);
              keys = [keyValue.toString(),secretg];
              isValidOtp = window.api.checkOtp(keys);
              console.log(isValidOtp);
            }
          }
          if (keyLength >= 8)  {
            if(localStorage.getItem("secretu") != null && localStorage.getItem("secretu") != "")  {
              const su = localStorage.getItem("secretu");
              const hash = await digestMessageHex(keyValue.toString());
              if(su === hash)
                console.log('Secret user OK');
            }            
          }
        }        
      });
      homeBtn.addEventListener('click', () => {
        enterHome();
      });
      handleBlurEffect(qrCode);
      handleBlurEffect(secretCode);
    } else {
      console.error('Un botón no fue encontrado en el DOM.');
    }
  });

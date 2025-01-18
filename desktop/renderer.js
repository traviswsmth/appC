function enterPrices()  {
  setTimeout(window.location.replace("src/prices.html"), 2000);
}

function loadOtp(){
  setTimeout(window.location ="src/otp.html", 2000);
  }

  window.addEventListener('DOMContentLoaded', () => {
    const pricesBtn = document.getElementById('pricesBtn');
    const otpBtn = document.getElementById('otpBtn');
    if (pricesBtn && otpBtn) {
      otpBtn.addEventListener('mouseover', () =>  {
        loadOtp();
      });
      pricesBtn.addEventListener('click', () => {
        enterPrices();
      });
    } else {
      console.error('Un botón no fue encontrado en el DOM.');
    }
  });
function enterPrices()  {
  setTimeout(loadPrices, 2000);
}

function loadPrices(){
  window.location ="src/otp.html";
  }

  window.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('pricesBtn');
    if (button) {
      button.addEventListener('mouseover', () => {
        enterPrices();
      });
    } else {
      console.error('El botón no fue encontrado en el DOM.');
    }
  });
  
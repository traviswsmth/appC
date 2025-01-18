window.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('homeButton');
    if (button) {
      button.addEventListener('mouseover', () => {
        window.api.otp();
      });
    } else {
      console.error('El botón no fue encontrado en el DOM.');
    }
  });
  
function enterHome()  {
  setTimeout(window.location ="../index.html", 1000);
}

window.addEventListener('DOMContentLoaded', () => {
  const homeBtn = document.getElementById("homeBtn");
  const darkBtn = document.getElementById('darkBtn');
  console.log("Bootstrap:", typeof bootstrap); // ¿Sigue siendo undefined?
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      enterHome();
    });
    darkBtn.addEventListener('click', () => {
      toggleDark();
    });
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
});
function toggleDark() {
  console.log(document.body.style.backgroundColor);
  switch (document.body.style.backgroundColor)  {
    case 'lightblue':
      document.body.style.backgroundColor = 'black';
      break;
    case 'black':
      document.body.style.backgroundColor = 'lightblue';
      break;
    default:
      document.body.style.backgroundColor = 'black';
      break;
  }
  
}
function enterPrices()  {
  setTimeout(window.location.replace("src/prices.html")
  , 2000);
}

function loadOtp(){
  setTimeout(window.location.replace("src/otp.html")
  , 2000);
}

function loadFarming(){
  setTimeout(window.location.replace("src/farming.html")
  , 2000);
}
function loadCharts(){
  setTimeout(window.location.replace("src/charts.html")
  , 2000);
}
function loadPage(page){
  setTimeout(window.location.replace("src/",page,".html")
  , 2000);
}

window.addEventListener('DOMContentLoaded', () => {
  const pricesBtn = document.getElementById('pricesBtn');
  const otpBtn = document.getElementById('otpBtn');
  const darkBtn = document.getElementById('darkBtn');
  const farmBtn = document.getElementById('farmBtn');
  const chartsBtn = document.getElementById('chartsBtn');
  if (pricesBtn && otpBtn) {
    otpBtn.addEventListener('mouseover', () =>  {
      loadOtp();
    });
    pricesBtn.addEventListener('click', () => {
      enterPrices();
    });
    darkBtn.addEventListener('click', () => {
      toggleDark();
    });
    farmBtn.addEventListener('mouseover', () =>  {
      loadFarming();
    });
    chartsBtn.addEventListener('mouseover', () =>  {
      loadCharts();
    });
  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
});

function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}

$(() => {
  let url;

  let stocks = {
    
    'BTC': 'btc.v',
    'ETH': 'eth.v',
    'SOL': 'sol.v',
  };
  for (let symbol in stocks) {
    drawSymbol(symbol);
  }
  
  function fetchData() {
    for (let symbol in stocks) {
      url = `https://stooq.com/q/l/?s=${stocks[symbol]}&f=sd2t2ohlc&h&e=csv`;
      window.api.csv.parse(url, {
        download: true,
        delimiter: ',',
        complete: (results) => {
          try {
            const prices = results.data[1];
            const previousPrice = parseFloat(prices[3], 10);
            const currentPrice = parseFloat(prices[6], 10);
            let change = Math.round((currentPrice - previousPrice) * 100) / 100;
            let percentPos = financial((currentPrice / previousPrice * 100) - 100);
            let percentNeg = financial(100 - (currentPrice / previousPrice * 100));

            let percent = '';
            if (change >= 0) {
              change = `+${change}`;
              percent = `+${percentPos}%`;
            } else {
              percent = `-${percentNeg}%`;
            }
            // Actualizamos el DOM dinámicamente
            $(`#${symbol}-price`).text(currentPrice.toLocaleString());
            $(`#${symbol}-change`).text(change);
            $(`#${symbol}-percent`).text(percent);
          } catch(error)  {
            console.error(`Error al procesar los datos para ${symbol}:`, error);
            alert('Hubo un problema al procesar los datos del símbolo.');
          }          
        },
        error: (error) => {
          console.error('Error al descargar o procesar el archivo CSV:', error);
          alert('Hubo un problema al obtener los datos. Intenta nuevamente más tarde.');
        }
      });
    }
    getHour();
  }


  function addSymbol(symbol) {
   
    if (!stocks[symbol]) {
      stocks[symbol] = symbol;
      drawSymbol(symbol);
      fetchData();
    } else {
      alert(`${symbol} ya está en la lista.`);
    }
  }

  function drawSymbol(symbol) {
      const symbolRow = `
        <div class="row ${symbol}">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <i>${symbol}</i>
            <h3>
              <span id="${symbol}-price" class="price"></span>
              <small id="${symbol}-change" class="change"></small>
              <span id="${symbol}-percent" class="percent"></span>
            </h3>
          </div>
        </div>
      `;
      $('#prices-container').append(symbolRow);
  }

  
  function removeSymbol(symbol) {
    if (stocks[symbol]) {
      delete stocks[symbol];
      $(`.${symbol}`).remove();
    } else {
      alert(`${symbol} no está en la lista.`);
    }
  }

  // Event listeners para los botones de agregar/eliminar símbolos
  $('#add-symbol-btn').click(() => {
    const symbolInput = $('#symbol-input').val().trim();
    if (!symbolInput) {
      alert('Por favor ingrese un símbolo.');
    } else if (symbolInput && /^[a-zA-Z0-9._-]+$/.test(symbolInput)) {  // Validar formato del símbolo
      addSymbol(symbolInput);
      $('#symbol-input').val('');  // Limpiar el campo de entrada
    } else {
      alert('Por favor ingrese un símbolo válido.');
    }
  });

  $('#remove-symbol-btn').click(() => {
    const symbolInput = $('#symbol-input').val();
    if (symbolInput) {
      removeSymbol(symbolInput);
      $('#symbol-input').val('');
    }
  });

  setInterval(fetchData, 60000);
  fetchData();
});

function getHour()  {
  d = new Date();
  h = (d.getHours()).toString();
  m = (d.getMinutes()).toString();
  s = '';//(d.getSeconds()).toString();
  hour = h.concat(':',m,'',s);
  document.getElementById("timestamp").innerHTML = hour;
  return hour;
}

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
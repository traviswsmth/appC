window.addEventListener('DOMContentLoaded', () => {
  const othersBtn = document.getElementById('othersBtn');
  const otpBtn = document.getElementById('otpBtn');
  const darkBtn = document.getElementById('darkBtn');
  const farmBtn = document.getElementById('farmBtn');
  const stablesBtn = document.getElementById('stablesBtn');
  const ethBtn = document.getElementById('ethBtn');
  if (farmBtn && otpBtn) {
    otpBtn.addEventListener('click', () => {
      loadPage("src/otp");
    });
    othersBtn.addEventListener('click', () => {
      loadPage("src/othersy");
    });
    darkBtn.addEventListener('click', () => {
      toggleDark('lightgray');
    });
    farmBtn.addEventListener('click', () => {
      loadPage("src/farming");
    });
    stablesBtn.addEventListener('click', () => {
      loadPage("src/stables");
    });
    ethBtn.addEventListener('click', () => {
      loadPage("src/ethy");
    });
  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
});

function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}

$(() => {
  let stocks = {

    'BTC': 'btc.v',
    'ETH': 'eth.v',
    'SOL': 'sol.v',
  };
  for (let symbol in stocks) {
    drawSymbol(symbol);
  }

  function fetchData() {
    const infoLbl = document.getElementById('infoLbl');
    for (let symbol in stocks) {
      const urlStooq = `https://stooq.com/q/l/?s=${stocks[symbol]}&f=sd2t2ohlc&h&e=csv`;
      window.api.csv.parse(urlStooq, {
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
            $(`#${symbol}-price`).text(currentPrice.toLocaleString());
            $(`#${symbol}-change`).text(change);
            $(`#${symbol}-percent`).text(percent);
          } catch (error) {
            console.error(`Error al procesar los datos para ${symbol}:`, error);
            alert('Hubo un problema al procesar los datos del símbolo.');
          }
        },
        error: (error) => {
          infoLbl.innerHTML = 'Error connecting to internet...';
          if (sessionStorage.getItem('errfetchData'))
            return;
          console.error('Error al descargar o procesar el archivo CSV:', error);
          sessionStorage.setItem('errfetchData', error);
        }
      });
    }
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
  getHour();
  setInterval(fetchData, 90000);
  fetchData();
});

function getHour() {
  d = new Date();
  h = (d.getHours()).toString();
  m = (d.getMinutes()).toString();
  s = '';//(d.getSeconds()).toString();
  hour = h.concat(':', m, '', s);
  document.getElementById("timestamp").innerHTML = hour;
  return hour;
}

function getDate() {
  d = new Date();
  day = (d.getDate()).toString();
  m = (d.getMonth()).toString();
  y = (d.getFullYear()).toString();
  date = day.concat('-',m,'-',y);
  return date;
}

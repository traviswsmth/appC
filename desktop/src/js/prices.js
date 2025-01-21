/* global $ */
//const csv = require('papaparse');

function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}

$(() => {
  let url;
  // Definimos un array de símbolos iniciales (como ejemplos)
  let stocks = {
    'oil': 'CL.F',
    'gold': 'GC.F',
    'btc': 'btcusd'
  };
  for (let symbol in stocks) {
    drawSymbol(symbol);
  }
  // Función para actualizar los precios
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
  }

  // Función para agregar un símbolo dinámicamente
  function addSymbol(symbol) {
    // Solo agregamos el símbolo si no existe
    if (!stocks[symbol]) {
      stocks[symbol] = symbol;
      drawSymbol(symbol);
      fetchData();  // Actualizar los datos del nuevo símbolo
    } else {
      alert(`${symbol} ya está en la lista.`);
    }
  }

  function drawSymbol(symbol) {
      const symbolRow = `
        <div class="row ${symbol}">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <h1>${symbol}</h1>
            <h2>
              <span id="${symbol}-price" class="price"></span>
              <small id="${symbol}-change" class="change"></small>
              <span id="${symbol}-percent" class="percent"></span>
            </h2>
          </div>
        </div>
      `;
      $('#prices-container').append(symbolRow);  // Agregar la fila con el nuevo símbolo
  }

  // Función para eliminar un símbolo dinámicamente
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
      $('#symbol-input').val('');  // Limpiar el campo de entrada
    }
  });

  setInterval(fetchData, 60000);
  fetchData();
});

function enterHome()  {
  setTimeout(window.location ="../index.html", 2000);
}

window.addEventListener('DOMContentLoaded', () => {
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      enterHome();
    });
  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
});
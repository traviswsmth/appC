const today = new Date().toISOString().split('T')[0];
const storageKeyAvg = `apyAvg_${today}`;
const avgDataLS = localStorage.getItem(storageKeyAvg);
const yieldDataKey = `yData_${today}`;
const yDataLS = localStorage.getItem(storageKeyAvg);
const includedSymbols = ["USDT", "USDC", "GHO", "DAI",
  "FDUSD", "USDE", "FRAX", "CRVUSD", "USDC.E"];

window.addEventListener('DOMContentLoaded', async () => {
  const homeBtn = document.getElementById("homeBtn");
  document.getElementById("networkFilter").addEventListener("change", verifyLS);
  document.getElementById("platformFilter").addEventListener("change", verifyLS);
  document.getElementById("apyFilter").addEventListener("change", verifyLS);
  document.getElementById("sortFilter").addEventListener("change", verifyLS);
  const darkBtn = document.getElementById('darkBtn');
  const chartContainer = document.getElementById('apyChart');
  const ethBtn = document.getElementById("ethBtn");
  chartContainer.addEventListener("resize", () => {
    chartContainer.style.width = document.body.width;
  });
  await verifyLS();
  requestAnimationFrame(() => {
    const chartapys = LightweightCharts.createChart(chartContainer, {
      width: document.body.width,
      height: 300,
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.2,
          bottom: 0.2,
        },
      },
      layout: {
        textColor: '#ffffff',
        background: { type: 'solid', color: '#121212' },
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    });
    const { chartData, networkIndexMap } = loadChartData();
    const series = chartapys.addSeries(LightweightCharts.HistogramSeries);

    chartapys.applyOptions({
      crosshair: {
        vertLine: {
          labelVisible: false, // 🔥 Oculta la fecha en la línea vertical
        }
      },
      timeScale: {
        timeVisible: false, // Oculta fechas
        secondsVisible: false,
        rightOffset: 0,
        barSpacing: 46,
        tickMarkFormatter: (time) => {
          // Usamos el índice para mostrar el nombre de la red
          const networkName = Object.keys(networkIndexMap).find(
            key => networkIndexMap[key] === time);
          return networkName || "Unknown";
        }
      }
    });
    series.setData(chartData);

  });

  if (homeBtn && ethBtn) {
    homeBtn.addEventListener('click', () => {
      enterHome();
    });
    darkBtn.addEventListener('click', () => {
      toggleDark();
    });
    ethBtn.addEventListener('click', () => {
      loadPage('ethy');
    });

  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
});

async function fetchDefiLlamaAPY() {
  const url = "https://yields.llama.fi/pools";
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data.filter(pool =>
      includedSymbols.includes(pool.symbol) &&
      pool.apy >= 6 && pool.apy < 210 &&
      !excludedChains.includes(pool.chain) &&
      !excludedPlatforms.includes(pool.project)
    );
  } catch (error) {
    console.error("Error fetching data from DefiLlama:", error);
    return [];
  }
}

async function verifyLS() {
  const storedYield = localStorage.getItem(yieldDataKey);
  if (storedYield) {
    loadYieldData(JSON.parse(storedYield));
  } else {
    const yieldDataFetch = await fetchDefiLlamaAPY();
    if (yieldDataFetch.length > 0) {
      localStorage.setItem(yieldDataKey, JSON.stringify(yieldDataFetch));
      loadYieldData(yieldDataFetch);
    } else {
      console.warn("No yield data to store.");
    }
  }
}

async function loadYieldData(yieldData) {
  const tableBody = document.getElementById("yield-table");
  tableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
  const networkFilter = document.getElementById("networkFilter");
  const platformFilter = document.getElementById("platformFilter");
  const apyFilter = parseFloat(document.getElementById("apyFilter").value);
  const sortFilter = document.getElementById("sortFilter").value;

  const filteredByAPY = yieldData.filter(pool => pool.apy >= apyFilter);

  const networksByPlatform = {};
  const platformsByNetwork = {};

  filteredByAPY.forEach(pool => {
    if (!networksByPlatform[pool.project]) networksByPlatform[pool.project] = new Set();
    if (!platformsByNetwork[pool.chain]) platformsByNetwork[pool.chain] = new Set();

    networksByPlatform[pool.project].add(pool.chain);
    platformsByNetwork[pool.chain].add(pool.project);
  });

  const selectedNetwork = networkFilter.value;
  const selectedPlatform = platformFilter.value;

  let validNetworks = Object.keys(platformsByNetwork);
  let validPlatforms = Object.keys(networksByPlatform);

  // Apply cross filter
  if (selectedPlatform !== "all") validNetworks = [...networksByPlatform[selectedPlatform] || []];
  if (selectedNetwork !== "all") validPlatforms = [...platformsByNetwork[selectedNetwork] || []];

  networkFilter.innerHTML = `<option value='all'>Todas</option>` + validNetworks.map(n => `<option value='${n}'>${n}</option>`).join("");
  platformFilter.innerHTML = `<option value='all'>Todas</option>` + validPlatforms.map(p => `<option value='${p}'>${p}</option>`).join("");

  if (validNetworks.includes(selectedNetwork)) networkFilter.value = selectedNetwork;
  if (validPlatforms.includes(selectedPlatform)) platformFilter.value = selectedPlatform;

  let finalFilteredData = filteredByAPY.filter(pool =>
    (networkFilter.value === "all" || pool.chain === networkFilter.value) &&
    (platformFilter.value === "all" || pool.project === platformFilter.value)
  );

  finalFilteredData.sort((a, b) => {
    if (sortFilter === "apy-desc") return b.apy - a.apy;
    if (sortFilter === "apy-asc") return a.apy - b.apy;
    if (sortFilter === "name-asc") return a.project.localeCompare(b.project);
    if (sortFilter === "name-desc") return b.project.localeCompare(a.project);
  });

  saveDailyAPY(finalFilteredData);
  const chartData = finalFilteredData;
  const uniqueSymbols = [...new Set(chartData.map(item => item.symbol))];
  const uniqueChains = [...new Set(chartData.map(item => item.chain))];

  console.log(uniqueSymbols);
  console.log(uniqueChains);
  //const dataInputSaved = localStorage.getItem('ybt_',item.symbol,'_',item.chain.substr(0, 3),'_',item.project.substr(0, 4));
  //placeholder='${localStorage.getItem('ybt_',item.symbol,'_',item.chain.substr(0, 3),'_',item.project.substr(0, 4))}'></input

  tableBody.innerHTML = finalFilteredData.length ? finalFilteredData.map(item => {
    const inputId = `ybt_${item.symbol}_${item.chain.substr(0, 3)}_${item.project.substr(0, 4)}`;
    const savedValue = localStorage.getItem(inputId) || '';

    return `
      <tr>
          <td style='color:white;background-color:black'>${item.project}</td>
          <td style='color:white;background-color:black'>${item.symbol}</td>
          <td style='color:white;background-color:black'>${item.chain}</td>
          <td style='color:white;background-color:black'>${item.apy.toFixed(2)}%</td>
          <td style='color:white;background-color:black'>
            <input type='number' min='3' id='${inputId}' value='${savedValue}' 
              placeholder='${item.project.substr(0, 4)}'>
          </td>
      </tr>
  `;
  }).join("") : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";

  // Evento para guardar en localStorage al presionar "Enter"
  tableBody.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const input = event.target;
      if (input.tagName === "INPUT") {
        const id = input.id;
        const value = input.value.trim();

        if (value !== "") {
          localStorage.setItem(id, value);
          console.log(`Guardado en localStorage -> ${id}: ${value}`);
        } else  {
          localStorage.removeItem(id);
        }
      }
    }
  });

}

function toggleDark() {
  switch (document.body.style.backgroundColor) {
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

function saveDailyAPY(filteredData) {
  if (avgDataLS) {
    return;
  }

  const apyByNetwork = {};
  filteredData.forEach(pool => {
    if (pool.apy > 5 && pool.apy < 100) {
      if (!apyByNetwork[pool.chain]) {
        apyByNetwork[pool.chain] = { totalAPY: 0, count: 0 };
      }
      apyByNetwork[pool.chain].totalAPY += pool.apy;
      apyByNetwork[pool.chain].count++;
    } else {
      console.warn(`APY descartado por ser muy grande o inválido: ${pool.apy} en ${pool.chain}`);
    }
  });

  // Lightweight Charts
  const chartData = Object.keys(apyByNetwork).map(chain => ({
    time: today,
    value: (apyByNetwork[chain].totalAPY / apyByNetwork[chain].count).toFixed(2),
    chain: chain
  }));

  if (chartData.length > 0) {
    localStorage.setItem(storageKeyAvg, JSON.stringify(chartData));
    console.log("Promedio de APYs guardado:", chartData);
  } else {
    console.warn("No se guardaron datos en localStorage porque todos los APYs fueron descartados.");
  }
}

function loadChartData() {
  let savedDataChart = [];
  savedDataChart = localStorage.getItem(storageKeyAvg);
  if (savedDataChart) {
    let chartData = JSON.parse(savedDataChart);
    // Mapeamos cada cadena (red) a un índice numérico
    const networkIndexMap = {};
    let index = 1;

    chartData = chartData.map(entry => {
      if (!(entry.chain in networkIndexMap)) {
        networkIndexMap[entry.chain] = index++;
      }
      return {
        time: networkIndexMap[entry.chain], // Usamos un índice en lugar de la fecha
        value: parseFloat(entry.value),
        chain: entry.chain // Guardamos la red para etiquetado
      };
    });

    return { chartData, networkIndexMap };
  }
  console.log("No se cargaron los gráficos");
  return { chartData: [], networkIndexMap: {} };
}

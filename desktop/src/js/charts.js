const today = new Date().toISOString().split('T')[0];
const storageKey = `apyAvg_${today}`;
const savedData = localStorage.getItem(storageKey);
window.addEventListener('DOMContentLoaded', async() => {
  const homeBtn = document.getElementById("homeBtn");
  document.getElementById("networkFilter").addEventListener("change", verifyLS);
  document.getElementById("platformFilter").addEventListener("change", verifyLS);
  document.getElementById("apyFilter").addEventListener("change", verifyLS);
  document.getElementById("sortFilter").addEventListener("change", verifyLS);
  const chartContainer = document.getElementById('apyChart');
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
        rightOffset: 5,
        barSpacing: 26,
        tickMarkFormatter: (time) => {
          // Usamos el índice para mostrar el nombre de la red
          const networkName = Object.keys(networkIndexMap).find(key => networkIndexMap[key] === time);
          return networkName || "Unknown";
        }
      }
    });
    series.setData(chartData);

  });

  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      enterHome();
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
      const excludedChains = ["Moonbeam", "Kava", "Polynomial", "Core", 
        "Flare", "Neutron", "Gnosis", "Rootstock", "Bifrost Network",
        "zkSync Era", "Bsquared", "Linea",
        "Cronos_zkevm", "Nolus", "Neon", "Starknet", "Osmosis", "Kujira"];
      return data.data.filter(pool => 
        ["USDC", "DAI", "USDT"].includes(pool.symbol) && 
        pool.apy >= 6 && 
        !excludedChains.includes(pool.chain)
      );
  } catch (error) {
      console.error("Error obteniendo datos de DefiLlama:", error);
      return [];
  }
}

function getDateNow()  {
  d = new Date();
  console.log("Fecha actual:", d.toLocaleDateString());
  return d.toLocaleDateString();
}

async function verifyLS() {
  yieldDataLS = 'yieldData'.concat(getDateNow());
  const storedYield = sessionStorage.getItem(yieldDataLS);
  let yieldData;
  if (storedYield) {
    loadYieldData(JSON.parse(yieldDataLS));
  } else  {
    yieldData = await fetchDefiLlamaAPY();
    localStorage.setItem(yieldDataLS, JSON.stringify(yieldData));
    //loadYieldData(yieldData);
    if (yieldData.length > 0) {
      //saveDailyAPY(yieldData);
      loadYieldData(yieldData);
    } else {
      console.warn("No hay datos de yield para almacenar.");
    }
  }
}

async function loadYieldData(yieldData) {
  const tableBody = document.getElementById("yield-table");
  tableBody.innerHTML = "<tr><td colspan='4'>Cargando...</td></tr>";  
  const networkFilter = document.getElementById("networkFilter");
  const platformFilter = document.getElementById("platformFilter");
  const apyFilter = parseFloat(document.getElementById("apyFilter").value);
  const sortFilter = document.getElementById("sortFilter").value;
  
  const filteredByAPY = yieldData.filter(pool => pool.apy >= apyFilter);
  const validNetworks = [...new Set(filteredByAPY.map(pool => pool.chain))];
  const validPlatforms = [...new Set(filteredByAPY.map(pool => pool.project))];

  const selectedNetwork = networkFilter.value;
  const selectedPlatform = platformFilter.value;

  networkFilter.innerHTML = `<option value='all'>Todas</option>` + validNetworks.map(n => `<option value='${n}'>${n}</option>`).join("");
  platformFilter.innerHTML = `<option value='all'>Todas</option>` + validPlatforms.map(p => `<option value='${p}'>${p}</option>`).join("");

  if (validNetworks.includes(selectedNetwork)) networkFilter.value = selectedNetwork;
  if (validPlatforms.includes(selectedPlatform)) platformFilter.value = selectedPlatform;

  let finalFilteredData = filteredByAPY.filter(pool => 
      (networkFilter.value === "all" || pool.chain === networkFilter.value) &&
      (platformFilter.value === "all" || pool.project === platformFilter.value)
  );

  finalFilteredData.sort((a, b) => {
      if (sortFilter === "apy-desc") return b.apy - a.apy;  // APY + to -
      if (sortFilter === "apy-asc") return a.apy - b.apy;  // APY - to +
      if (sortFilter === "name-asc") return a.project.localeCompare(b.project);  // Platform A-Z
      if (sortFilter === "name-desc") return b.project.localeCompare(a.project);  // Platform Z-A
  });

  saveDailyAPY(finalFilteredData);

  tableBody.innerHTML = finalFilteredData.length ? finalFilteredData.map(item => `
      <tr>
          <td>${item.project}</td>
          <td>${item.symbol}</td>
          <td>${item.chain}</td>
          <td>${item.apy.toFixed(2)}%</td>
      </tr>
  `).join("") : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";
}

function saveDailyAPY(filteredData) {
  if (savedData) {
      //console.log("Promedio ya guardado para hoy:", JSON.parse(savedData));
      return;
  }

  // Agrupar por red y calcular promedios
  const apyByNetwork = {};
  filteredData.forEach(pool => {
    if (pool.apy > 5 && pool.apy < 100)  {
      if (!apyByNetwork[pool.chain]) {
        apyByNetwork[pool.chain] = { totalAPY: 0, count: 0 };
      }
      apyByNetwork[pool.chain].totalAPY += pool.apy;
      apyByNetwork[pool.chain].count++;
      }  else {
      console.warn(`APY descartado por ser muy grande o inválido: ${pool.apy} en ${pool.chain}`);
      }
  });

  // Convertir los datos en un formato para Lightweight Charts
  const chartData = Object.keys(apyByNetwork).map(chain => ({
      time: today,
      value: (apyByNetwork[chain].totalAPY / apyByNetwork[chain].count).toFixed(2), // Promedio con 2 decimales
      chain: chain
  }));

  if (chartData.length > 0) {
    localStorage.setItem(storageKey, JSON.stringify(chartData));
    console.log("Promedio de APYs guardado:", chartData);
  } else {
      console.warn("No se guardaron datos en localStorage porque todos los APYs fueron descartados.");
  }
}

function loadChartData() {
  //console.log(`Buscando en localStorage con clave: ${storageKey}`);
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    let chartData = JSON.parse(savedData);
    
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

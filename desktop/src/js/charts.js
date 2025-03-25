const today = new Date().toISOString().split('T')[0];
const storageKeyAvg = `apyAvg_${today}`;
const avgDataLS = localStorage.getItem(storageKeyAvg);
const yieldDataKey = `yData_${today}`;
const yDataLS = localStorage.getItem(storageKeyAvg);
const keyCustomProjects = "customProjectS";
const includedSymbols = ["USDT", "USDC", "GHO", "DAI",
  "FDUSD", "USDE", "FRAX", "CRVUSD", "USDC.E"];
const savedValuesYbt = {};
Object.keys(localStorage).forEach((key) => {
  if (key.startsWith("ybt")) {
    savedValuesYbt[key] = localStorage.getItem(key);
  }
});


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
  const savedProjectsAsign = JSON.parse(localStorage.getItem('ybt')) || [];
  const drawTableYields = finalFilteredData.length
    ? finalFilteredData
      .map((item) => {
        const inputId = `ybt_${item.symbol}_${item.chain.substr(0, 3)}_${item.project.substr(0, 4)}`;
        const savedValue = savedProjectsAsign.filter(item => item.project === inputId).map(item => item.asign);

        return `
      <tr>
          <td style='color:white;background-color:black'>${item.project}</td>
          <td style='color:white;background-color:black'>${item.symbol}</td>
          <td style='color:white;background-color:black'>${item.chain}</td>
          <td style='color:white;background-color:black'>${item.apy.toFixed(2)}%</td>
          <td style='color:white;background-color:black'>
            <input type='number' min='10' id='${inputId}' value='${savedValue}' 
              placeholder='${item.project.substr(0, 4)}' style='color:blue;background-color:gray;'>
          </td>
      </tr>
  `;
      })
      .join("")
    : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";

  // Fila de inputs para agregar nuevos proyectos
  const personalizatedRows = `
        <tr>
            <td style='color:white;background-color:black'>
              <input id='ybt_new_project' 
              style='color:white;background-color:lightgrey;' placeholder='Proyecto'>
            </td>
            <td style='color:white;background-color:black'>
              <input id='ybt_new_symbol' 
              style='color:white;background-color:lightgrey;' placeholder='Símbolo'>
            </td>
            <td style='color:white;background-color:black'>
              <input id='ybt_new_chain' 
              style='color:white;background-color:lightgrey;' placeholder='Red'>
            </td>
            <td style='color:white;background-color:black'>
              <input id='ybt_new_apy' type='number' min='6' step='0.1' 
              style='color:white;background-color:lightgrey;' placeholder='APY'>
            </td>
            <td style='color:white;background-color:black'>
              <h6>New Project</h6>
            </td>
        </tr>
    `;

  tableBody.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const input = event.target;
      const id = input.id;
      const value = input.value.trim();
      const savedProjects = JSON.parse(localStorage.getItem(keyCustomProjects)) || [];

      if (id.startsWith("ybt_new")) {
        const newProject = document.getElementById("ybt_new_project").value.trim();
        const newSymbol = document.getElementById("ybt_new_symbol").value.trim();
        const newChain = document.getElementById("ybt_new_chain").value.trim();
        const newApy = document.getElementById("ybt_new_apy").value.trim();
        //const newAsign = document.getElementById("ybt_new_asign").value.trim();
        if (newProject && newSymbol && newChain && newApy) {
          const newProjectData = {
            project: newProject,
            symbol: newSymbol,
            chain: newChain,
            apy: parseFloat(newApy),
            //asign: parseFloat(newAsign),
            keyid: newSymbol.concat('_',newChain.substr(0, 3),'_',newProject.substr(0, 4))
          };
//          const savedProjects = JSON.parse(localStorage.getItem(keyCustomProjects)) || [];
          savedProjects.push(newProjectData);
          localStorage.setItem(keyCustomProjects, JSON.stringify(savedProjects));

          console.log("Nuevo proyecto guardado:", newProjectData);
          document.getElementById("ybt_new_project").value = "";
          document.getElementById("ybt_new_symbol").value = "";
          document.getElementById("ybt_new_chain").value = "";
          document.getElementById("ybt_new_apy").value = "";
          //document.getElementById("ybt_new_asign").value = "";
        }
      } else {
        // Si el input pertenece a una fila existente, guardar o actualizar el valor en localStorage
        if (value !== "" && id) {
          const savedYbt = JSON.parse(localStorage.getItem('ybt')) || [];

          // Buscar si ya existe un proyecto con el mismo ID
          const index = savedYbt.findIndex(item => item.project === id);

          if (index !== -1) {
            // Si ya existe, actualizar el valor
            savedYbt[index].asign = value;
            console.log(`Actualizado en localStorage -> ${id}: ${value}`);
          } else {
            // Si no existe, agregarlo como nuevo
            savedYbt.push({ project: id, asign: value, apy: '' });
            console.log(`Guardado en localStorage -> ${id}: ${value}`);
          }
          localStorage.setItem('ybt', JSON.stringify(savedYbt));
        } else {
          // Si el valor es vacío, eliminar el item correspondiente
          const savedYbt = JSON.parse(localStorage.getItem('ybt')) || [];
          const updatedYbt = savedYbt.filter(item => item.project !== id);
          localStorage.setItem('ybt', JSON.stringify(updatedYbt));
        }
      }

    }
  });

  tableBody.innerHTML = drawTableYields.concat(loadCustomProjects())
    .concat(personalizatedRows);
}

function loadCustomProjects() {
  const savedProjects = JSON.parse(localStorage.getItem(keyCustomProjects)) || [];
  const savedProjectsAsign = JSON.parse(localStorage.getItem('ybt')) || [];
  
  const customRows = savedProjects.length
    ? savedProjects
      .map((item) => {
        // Add defensive checks for required properties
        const symbol = item.symbol || '';
        const chain = item.chain || '';
        const project = item.project || '';
        
        // Safely get first 3 chars of chain and first 4 chars of project
        const chainShort = chain.length >= 3 ? chain.substr(0, 3) : chain;
        const projectShort = project.length >= 4 ? project.substr(0, 4) : project;
        
        const inputAsignId = `ybt_${symbol}_${chainShort}_${projectShort}`;
        const inputApyId = `apy_${symbol}_${chainShort}_${projectShort}`;
        const savedValue = savedProjectsAsign.filter(asignItem => asignItem.project === inputAsignId).map(asignItem => asignItem.asign);
        
        return `
        <tr>
            <td style='color:white;background-color:black'>${project}</td>
            <td style='color:white;background-color:black'>${symbol}</td>
            <td style='color:white;background-color:black'>${chain}</td>
            <td style='color:white;background-color:black'>
              <input type='number' min='6' step='0.1' id='${inputApyId}' 
               data-field='apy' 
              value='${item.apy || ''}' style='color:white;background-color:gray'>
            </td>
            <td style='color:white;background-color:black'>
              <input type='number' min='10' id='${inputAsignId}'  
              value='${savedValue}' placeholder='${projectShort}' 
              style='color:blue;background-color:gray;'>
            </td>
        </tr>
        `;
      })
      .join("")
    : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";
  
  return customRows;
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

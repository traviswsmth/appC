const today = new Date().toISOString().split('T')[0];
const storageKeyAvg = `apyAvgE_${today}`;
const avgDataLS = localStorage.getItem(storageKeyAvg);
const yieldDataKey = `yDataE_${today}`;
const _yDataLS = localStorage.getItem(storageKeyAvg);
const keyCustomProjects = "customProjectsE";
const includedSymbols = ["ETH", "WETH"];

window.addEventListener('DOMContentLoaded', async () => {
  const homeBtn = document.getElementById("homeBtn");
  document.getElementById("networkFilter").addEventListener("change", verifyLS);
  document.getElementById("platformFilter").addEventListener("change", verifyLS);
  document.getElementById("apyFilter").addEventListener("change", verifyLS);
  document.getElementById("sortFilter").addEventListener("change", verifyLS);
  const darkBtn = document.getElementById('darkBtn');
  const chartContainer = document.getElementById('apyChart');
  const stablesBtn = document.getElementById("stablesBtn");
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
          labelVisible: false,
        }
      },
      timeScale: {
        timeVisible: false,
        secondsVisible: false,
        rightOffset: 1,
        barSpacing: 86,
        tickMarkFormatter: (time) => {
          const networkName = Object.keys(networkIndexMap).find(
            key => networkIndexMap[key] === time);
          return networkName || "Unknown";
        }
      }
    });
    series.setData(chartData);

  });

  if (homeBtn && stablesBtn) {
    homeBtn.addEventListener('click', () => {
      enterHome();
    });
    darkBtn.addEventListener('click', () => {
      toggleDark('grey');
    });
    stablesBtn.addEventListener('click', () => {
      loadPage('charts');
    });
  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
});

async function verifyLS() {
  const storedYield = sessionStorage.getItem(yieldDataKey);
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
  const savedProjectsAsign = JSON.parse(localStorage.getItem('ybe')) || [];
  const drawTableYields = finalFilteredData.length
    ? finalFilteredData
      .map((item) => {
        const inputIdAsign = `asg_${item.symbol}_${item.chain.substr(0, 3)}_${item.project.substr(0, 4)}`;
        const projectShort = item.project.length >= 4 ? item.project.substr(0, 4) : item.project;
        const savedValueAsign = savedProjectsAsign.filter(
          item => item.project === inputIdAsign.substr(4)).map(
            item => item.asign);

        return `
      <tr>
          <td style='color:white;background-color:black'>${item.project}</td>
          <td style='color:white;background-color:black'>${item.symbol}</td>
          <td style='color:white;background-color:black'>${item.chain}</td>
          <td style='color:white;background-color:black'>${item.apy.toFixed(2)}%</td>
          <td style='color:white;background-color:black'>
            <input type='number' min='0.05' step='0.05' id='${inputIdAsign}' value='${savedValueAsign}' 
              placeholder='${projectShort}' style='color:blue;background-color:gray;'>
          </td>
      </tr>
  `;
      }).join("") : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";
  const personalizatedRows = `
  <tr>
      <td style='color:white;background-color:black'>
        <input id='ybe_new_project'
        style='color:black;background-color:lightgrey;' placeholder='Project'>
      </td>
      <td style='color:white;background-color:black'>
        <input id='ybe_new_symbol'
        style='color:black;background-color:lightgrey;' placeholder='Symbol'>
      </td>
      <td style='color:white;background-color:black'>
        <input id='ybe_new_chain'
        style='color:black;background-color:lightgrey;' placeholder='Network'>
      </td>
      <td style='color:white;background-color:black'>
        <input type="number" step="0.1" min="6" id='ybe_new_apy'
        style='color:black;background-color:lightgrey;' placeholder='APY'>
      </td>
      <td style='color:white;background-color:black'>
        <h6>New Project</h6>
      </td>
  </tr>
`;
  tableBody.innerHTML = drawTableYields.concat(loadCustomProjects('customProjectsE','ybe',0.05))
    .concat(personalizatedRows);

  tableBody.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      const input = event.target;
      const id = input.id;
      const value = input.value.trim();
      const savedProjects = JSON.parse(localStorage.getItem(keyCustomProjects)) || [];
      const savedYbe = JSON.parse(localStorage.getItem('ybe')) || [];
      const newProject = document.getElementById("ybe_new_project").value.trim();
      const newSymbol = document.getElementById("ybe_new_symbol").value.trim();
      const newChain = document.getElementById("ybe_new_chain").value.trim();
      const newApy = document.getElementById("ybe_new_apy").value.trim();
      if (id.startsWith("ybe_new") && !(id.startsWith("apy_"))) {
        console.log('id pressed:', id);
        if (newProject && newSymbol && newChain && newApy) {
          const newProjectData = {
            project: newProject,
            symbol: newSymbol,
            chain: newChain,
            apy: parseFloat(newApy),
            keyId: newSymbol.concat('_', newChain.substr(0, 3), '_', newProject.substr(0, 4))
          };
          savedProjects.push(newProjectData);
          localStorage.setItem(keyCustomProjects, JSON.stringify(savedProjects));

          console.log("Nuevo proyecto guardado:", newProjectData);
          document.getElementById("ybe_new_project").value = "";
          document.getElementById("ybe_new_symbol").value = "";
          document.getElementById("ybe_new_chain").value = "";
          document.getElementById("ybe_new_apy").value = "";
        }
      } else if (id.startsWith("apy_") && !newProject) {
        if (value === '') {
          const updatedProjects = savedProjects.filter(item => item.keyId !== id.substr(4));
          localStorage.setItem(keyCustomProjects, JSON.stringify(updatedProjects));
          /*const savedYbe = JSON.parse(localStorage.getItem('ybe')) || [];
          const updatedAsign = savedYbe.filter(item => !item.project.includes(id));
          localStorage.setItem('ybe', JSON.stringify(updatedAsign));*/
          const row = input.closest('tr');
          if (row) {
            row.remove();
          }
          console.log("Deleted custom project, id: ", id.substr(4));
        } else if (value !== "" && id) {
          const index = savedProjects.findIndex(item => item.keyId === id.substr(4));
          if (index !== -1) {
            savedProjects[index].apy = value;
            console.log(`Updated in LS -> ${id}: ${value}`);
          } else {
            savedProjects.push({ apy: value });
            console.log(`Saved in LS -> ${id}: ${value}`);
          }
          localStorage.setItem(keyCustomProjects, JSON.stringify(savedProjects));
        }
      } else if (id.startsWith("asg_") && !newProject) {
        if (input.value === '') {
          const updatedAssign = savedYbe.filter(item => item.project !== id.substr(4));
          localStorage.setItem('ybe', JSON.stringify(updatedAssign));
        } else if (value !== "" && id) {
          const index = savedYbe.findIndex(item => item.project === id.substr(4));
          console.log(index);
          console.log(id.substr(4));
          if (index !== -1) {
            savedYbe[index].asign = value;
            console.log(`Updated in LS -> ${id.substr(4)}: ${value}`);
          } else {
            savedYbe.push({ project: id.substr(4), asign: value });
            console.log(`Saved in LS -> ${id.substr(4)}: ${value}`);
          }
          localStorage.setItem('ybe', JSON.stringify(savedYbe));
        }
      }

    }
  });

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
  if (avgDataLS) {
    let chartData = JSON.parse(avgDataLS);
    const networkIndexMap = {};
    let index = 1;

    chartData = chartData.map(entry => {
      if (!(entry.chain in networkIndexMap)) {
        networkIndexMap[entry.chain] = index++;
      }
      return {
        time: networkIndexMap[entry.chain],
        value: parseFloat(entry.value),
        chain: entry.chain
      };
    });

    return { chartData, networkIndexMap };
  }
  console.log("No se cargaron los gráficos");
  return { chartData: [], networkIndexMap: {} };
}

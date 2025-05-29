"use strict";
const today = new Date().toISOString().split('T')[0];
const storageKeyAvg = `apyAvgS_${today}`;
const avgDataLS = localStorage.getItem(storageKeyAvg);
const yieldDataKey = `yDataS_${today}`;
const _yDataLS = localStorage.getItem(storageKeyAvg);
const keyCustomProjects = "customProjectS";
const includedSymbols = ["USDT", "USDC", "USDC.E", "EURC", "GHO", "EURT", "USD₮0", "USDT.E"];

window.addEventListener('DOMContentLoaded', async () => {
  document.body.classList.add('fade-in');
  const homeBtn = document.getElementById("homeBtn");
  document.getElementById("networkFilter").addEventListener("change", verifyLS);
  document.getElementById("platformFilter").addEventListener("change", verifyLS);
  document.getElementById("apyFilter").addEventListener("change", verifyLS);
  document.getElementById("sortFilter").addEventListener("change", verifyLS);
  const darkBtn = document.getElementById('darkBtn');
  const chartContainer = document.getElementById('apyChart');
  const ethBtn = document.getElementById("ethBtn");
  const othersBtn = document.getElementById("othersBtn");
  const lpsBtn = document.getElementById("lpsBtn");
  await verifyLS();
  requestAnimationFrame(() => {
    const chartapys = LightweightCharts.createChart(chartContainer, {
      height: 300,
      autoSize: true,
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
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
    const { chartData, networkIndexMap } = loadChartData(storageKeyAvg);
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
        rightOffset: 0,
        barSpacing: 80,
        tickMarkFormatter: (time) => {
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
      toggleDark('grey');
    });
    ethBtn.addEventListener('click', () => {
      loadPage('ethy');
    });
    othersBtn.addEventListener('click', () => {
      loadPage('othersy');
    });
    lpsBtn.addEventListener('click', () => {
      loadPage('lps');
    });

  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
});

async function verifyLS() {
  const storedYield = localStorage.getItem(yieldDataKey);
  if (storedYield) {
    loadYieldData(JSON.parse(storedYield));
  } else {
    const yieldData = await fetchDefiLlamaAPY(8);
    if (yieldData.length) {
      localStorage.setItem(yieldDataKey, JSON.stringify(yieldData));
      loadYieldData(yieldData);
      deletePrevMonthLS(yieldDataKey);
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

  networkFilter.innerHTML = `<option value='all'>Todas</option>` +
    validNetworks.map(n => `<option value='${n}'>${n}</option>`).join("");
  platformFilter.innerHTML = `<option value='all'>Todas</option>` +
    validPlatforms.map(p => `<option value='${p}'>${p}</option>`).join("");

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

  const savedProjectsAsign = JSON.parse(localStorage.getItem('ybt')) || [];
  const drawTableYields = finalFilteredData.length
    ? finalFilteredData
      .map((item) => {
        let warnTvl = false;
        let rewardTkn;
        const inputIdAsign = `asg_${item.symbol}_${item.chain.substr(0, 3)}_${item.project.substr(0, 4)}`;
        const projectShort = item.project.length >= 4 ? item.project.substr(0, 4) : item.project;
        if (item.tvlUsd<100000)
          warnTvl = true;
        rewardTkn = item.rewardTokens &&
          item.rewardTokens.length > 0
          ? `<br/><small>${item.rewardTokens}</small>`
          : "";
        const savedValueAsign = savedProjectsAsign.filter(
          item => item.project === inputIdAsign.substr(4)).map(
            item => item.asign);

        return `
      <tr>
          <td title='${item.poolMeta ? item.poolMeta : ""}' style='${stylesTd}'>
            ${item.project}<small>${item.poolMeta ? "_" + item.poolMeta.substr(0, 4) : ""}</small></td>
          <td title='${item.tvlUsd.toLocaleString('en-US')}' style='${stylesTd}'>
            ${item.symbol}${warnTvl ? "!" : ""}${item.apyReward>item.apyBase?rewardTkn.substr(0, 31):''}</td>
          <td style='${stylesTd}'>${item.chain}</td>
          <td title='avg:${item.apyMean30d.toFixed(2)}${item.apyBase ? " - b:" + item.apyBase.toFixed(2) : ""}' 
            style='${stylesTd}'>${item.apy.toFixed(2)}%${item.apyBase<8 ? "*" : ""}</td>
          <td style='${stylesTd}'>
            <input type='number' min='30' step='10' id='${inputIdAsign}' value='${savedValueAsign}' 
              placeholder='${projectShort}' style='color:blue;background-color:gray;'>
          </td>
      </tr>
  `;
      }).join("") : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";
  const personalizatedRows = `
        <tr>
            <td style='${stylesTd}'>
              <input id='ybt_new_project' 
              style='${stylesTdNew}' placeholder='Project'>
            </td>
            <td style='${stylesTd}'>
              <input id='ybt_new_symbol' 
              style='${stylesTdNew}' placeholder='Symbol'>
            </td>
            <td style='${stylesTd}'>
              <input id='ybt_new_chain' 
              style='${stylesTdNew}' placeholder='Network'>
            </td>
            <td style='${stylesTd}'>
              <input id='ybt_new_apy' type='number' min='7' step='0.1' 
              style='${stylesTdNew}' placeholder='APY'>
            </td>
            <td style='${stylesTd}'>
              <h6>New Project</h6>
            </td>
        </tr>
    `;
  tableBody.innerHTML = drawTableYields.concat(loadCustomProjects(keyCustomProjects, 'ybt', 10))
    .concat(personalizatedRows);

  tableBody.addEventListener("keypress", function (event) {
    if (event.key === "Enter" || event.key === "-") {
      const input = event.target;
      const id = input.id;
      const value = input.value.trim();
      const savedProjects = JSON.parse(localStorage.getItem(keyCustomProjects)) || [];
      const savedYbt = JSON.parse(localStorage.getItem('ybt')) || [];
      const newProject = document.getElementById("ybt_new_project").value.trim();
      const newSymbol = document.getElementById("ybt_new_symbol").value.trim();
      const newChain = document.getElementById("ybt_new_chain").value.trim();
      const newApy = document.getElementById("ybt_new_apy").value.trim();
      if (id.startsWith("ybt_new") && !(id.startsWith("apy_"))) {
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
          document.getElementById("ybt_new_project").value = "";
          document.getElementById("ybt_new_symbol").value = "";
          document.getElementById("ybt_new_chain").value = "";
          document.getElementById("ybt_new_apy").value = "";
        }
      } else if (id.startsWith("apy_") && !newProject) {
        if (value === '' || value === '-') {
          const updatedProjects = savedProjects.filter(item => item.keyId !== id.substr(4));
          localStorage.setItem(keyCustomProjects, JSON.stringify(updatedProjects));
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
      } else if (id.startsWith("asg_")) {
        if (value === '' || value === '-') {
          const updatedAssign = savedYbt.filter(item => item.project !== id.substr(4));
          localStorage.setItem('ybt', JSON.stringify(updatedAssign));
        } else if (value !== "" && id) {
          const index = savedYbt.findIndex(item => item.project === id.substr(4));
          console.log(index);
          console.log(id.substr(4));
          if (index !== -1) {
            savedYbt[index].asign = value;
            console.log(`Updated in LS -> ${id.substr(4)}: ${value}`);
          } else {
            savedYbt.push({ project: id.substr(4), asign: value });
            console.log(`Saved in LS -> ${id.substr(4)}: ${value}`);
          }
          localStorage.setItem('ybt', JSON.stringify(savedYbt));
        }
      }
      location.reload();
    }
  });
  saveDailyAPY(finalFilteredData, storageKeyAvg);
}

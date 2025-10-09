"use strict";
const today = new Date().toISOString().split('T')[0];
const storageKeyAvg = `apyAvgL_${today}`;
const avgDataLS = localStorage.getItem(storageKeyAvg);
const yieldDataKey = `yDataL_${today}`;
const _yDataLS = localStorage.getItem(storageKeyAvg);
const keyCustomProjects = "customProjectsL";
const includedSymbols = ["USDC-USDT", "USDT-USDC", "USDT-USDC.E", "USDC-USDC.E", "USDT.E-USDC", "USDT.E-USDC.E",
  "USDE-USDC", "PYUSD-USDC", "EURS-USDT", "SUSDE-USDC", "HONEY-USDC", "CRVUSD-USDT", "SUSD-DAI", "USDE-USDT",
  "SUSD-CRVUSD", "SUSD-SUSDE", "FRAX-USDT", "CRVUSD-USDC", "SDAI-SUSDE", "FRAX-USDC",// "WETH-USDBC","WPOL-USDT",
  "SFRXUSD-SUSDE", "USDC-AXLUSDC", "HONEY-USDC", "USDT-WBTC-WETH", //"WBERA-HONEY",//"OAC-WBERA-IBGT-A", "HONEY-JITOSOL",
  "CUSD-USDC",//"WETH-USDC", "WETH-USDT", "WETH-USDS", "WETH-DAI", "CRVUSD-WETH", "FRAX-WETH", "WBTC.B-USDC","WPOL-USDC.E",
  "CRVUSD-USD₮0",//"ETH-USDT", "WEETH-USDC", "USDC-ETH", "USDC-WETH", "WBTC-USDC", "CRVUSD-ARB", "WETH-USDBC",
  //"USDC-WBTC", "USDC-WBNB", "BNB-USDC", "SOL-USDC", "USDT-XRP", "USDC-LINK", "ARB-USDC.E", "USDT-ABRA", "WPOL-USDC",
  //"ARB-USDC", "USDT-OP", "USDC-OP",// "ARB-USDT", "USDT-ARB", "USDC-ARB", "OP-USDT",// "OP-USDC", "SUSDE-USDT",
  "WBTC-WETH", "WETH-WBTC", //"WBNB-AAVE", "WETH-AAVE", "WBNB-AAVE", "NOT-USD₮", "WTTON-USD₮", "USDC.E-WETH.E",
  //"WETH-WEETH", "STONE-WETH", "WETH-STONE", "WETH-ETHFI", "ZRO-WETH", "WEETH-WETH","UNIETH-WETH", "MENDI-WETH",
  //"ZEREBRO-USDC", "CELO-USD₮", "USDT-WEGLD", "WSOL-ME", "OM-WETH", "WETH-WRSETH", "EZETH-WETH","WETH.E-WAVAX",
  //"SUI-STSUI", "WETH-CRV", "WETH-UNI", "LBTC-SUI", "DOGE-WETH", "TON-USD₮","WAVAX-FRAX", "WETH-GMX", "APE-WETH",
  //"WSTETH-WRSETH", "AURA-EZETH-WSTETH", "CRVUSDETHCRV", "CRVUSDETHCRV", "WETH-ODOS", "USDT-THE", "POL-WETH", "USDC-LYNX",
  "SW-USR", "DOLA-USR", "GHO-USR", "FRXUSD-SCUSD", "USR-USDC", "GHO-USDC", "AVUSD-USDC", "USDC.E-USDT.E", "PYUSD-CRVUSD",
  "AXLUSDC.E-USDC", "USDC-USDBC-AXLUSDC-CRVUSD", "USDC.E-USD₮0",// "CELO-CUSD", "USDC-OP"// "WAVAX-AVUSD", "CELO-WETH",
  "SUSDS-USDT", "USDS-USDC", "USDS-USDT", "DOLA-SUSDS", "FRXUSD-SUSDS", "USD3SUSDS","USDS-USDT", "USDC-USDF",
  "USD₮-USDC", "USD1-USDF", "USD1-USDC", //"USD1-1", "USD1-USD1", "USD1-USDT",//"RAM-USDC", "RAM-USDT", "ARB-RAM",
  "RLUSD-USDC", //"USD1-USDUC1", "USD1-1USDUC", "WSOL-USDUC🚀", "WETH-DEGEN", "CELO-USD₮", "SOL-ZEREBRO",
  //"WETH-SUNNY", "FTXTOKEN-WETH", "EIGEN-WETH", "WETH-SHIBA",// "ZRO-USDT","RED-VELO", "WSOL-NVDAX", "USDC-WTAO",
  "USDT-AUSD₮", //"RAM-USDC", "RAM-USDT", "ARB-RAM", "WETH-RAM", "W-USDC", "BTCGHOETH", "MXNE-USDC", "WETH-RAM",
  "CRV2POOL-MUSD-2POOL-MUSD", "USDC-ALUSD", "WETH-SHIBA", "RED-VELO",//"WSOL-NVDAX", "USDC-WTAO", "TRUMP-USDC",
  "EURC-USDC", "USDC-EURC", "AXLUSDC-USDT",//"WINR-USDC", "WETH-WINR", "XAI-WETH","FXUSDSTABILITYPOOLV2.0", 
  "USDC-MXNB", "USDC-JUSD", "USDF-USDC", "USDF-USDT", "FRXUSD-USDF", "FRXUSD-USDE", "CRVUSD-FRXUSD", "USDC-USD₮0"
];

window.addEventListener('DOMContentLoaded', async () => {
  const homeBtn = document.getElementById("homeBtn");
  document.getElementById("networkFilter").addEventListener("change", verifyLS);
  document.getElementById("platformFilter").addEventListener("change", verifyLS);
  document.getElementById("apyFilter").addEventListener("change", verifyLS);
  document.getElementById("tickerFilter").addEventListener("change", verifyLS);
  document.getElementById("sortFilter").addEventListener("change", verifyLS);
  const darkBtn = document.getElementById('darkBtn');
  const chartContainer = document.getElementById('apyChart');
  const stablesBtn = document.getElementById("stablesBtn");
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

  if (homeBtn && stablesBtn) {
    homeBtn.addEventListener('click', () => {
      enterHome();
    });
    darkBtn.addEventListener('click', () => {
      toggleDark('grey');
    });
    stablesBtn.addEventListener('click', () => {
      loadPage('stables');
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
    const yieldData = await fetchDefiLlamaAPY(12);
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
  const tickerFilter = document.getElementById("tickerFilter").value;
  const sortFilter = document.getElementById("sortFilter").value;

  const filteredByAPY = yieldData.filter(pool => pool.apy >= apyFilter);
  let filteredData = filteredByAPY.filter(pool => pool.apyMean30d > 11);// && pool.stablecoin == true);

  if (tickerFilter !== 'all') {
    const filteredByTicker = filteredByAPY.filter(pool => pool.symbol === tickerFilter);
    if (filteredByTicker.length > 0) {
      filteredData = filteredByTicker;
    }
  }
  const networksByPlatform = {};
  const platformsByNetwork = {};

  filteredData.forEach(pool => {
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

  let finalFilteredData = filteredData.filter(pool =>
    (networkFilter.value === "all" || pool.chain === networkFilter.value) &&
    (platformFilter.value === "all" || pool.project === platformFilter.value)
  );

  finalFilteredData.sort((a, b) => {
    if (sortFilter === "apy-desc") return b.apy - a.apy;
    if (sortFilter === "apy-asc") return a.apy - b.apy;
    if (sortFilter === "name-asc") return a.project.localeCompare(b.project);
    if (sortFilter === "name-desc") return b.project.localeCompare(a.project);
  });

  const savedProjectsAsign = JSON.parse(localStorage.getItem('ybl')) || [];
  const drawTableYields = finalFilteredData.length
    ? finalFilteredData
      .map((item) => {
        let warnTvl = false;
        let rewardTkn;
        const inputIdAsign = `asg_${item.symbol}_${item.chain.substr(0, 3)}_${item.project.substr(0, 4)}_
          ${item.poolMeta ? item.poolMeta.substr(0, 3) : ""}`;
        const projectShort = item.project.length >= 4 ? item.project.substr(0, 4) : item.project;
        if (item.tvlUsd < 100000)
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
            style='${stylesTd}'>${item.apy.toFixed(2)}%${item.apyBase < 9 ? "*" : ""}</td>
          <td style='${stylesTd}'>
            <input type='number' min='20' step='5' id='${inputIdAsign}' value='${savedValueAsign}' 
              placeholder='${projectShort}' style='color:blue;background-color:gray;'>
          </td>
      </tr>
  `;
      }).join("") : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";
  const personalizatedRows = `
  <tr>
      <td style='${stylesTd}'>
        <input id='ybl_new_project'
        style='${stylesTdNew}' placeholder='Site'>
      </td>
      <td style='${stylesTd}'>
        <input id='ybl_new_symbol'
        style='${stylesTdNew}' placeholder='Ticker'>
      </td>
      <td style='${stylesTd}'>
        <input id='ybl_new_chain'
        style='${stylesTdNew}' placeholder='Network'>
      </td>
      <td style='${stylesTd}'>
        <input type="number" step="0.1" min="7" id='ybl_new_apy'
        style='${stylesTdNew}' placeholder='APY'>
      </td>
      <td style='${stylesTd}'>
        <h6>New Project</h6>
      </td>
  </tr>
`;
  tableBody.innerHTML = drawTableYields.concat(loadCustomProjects(keyCustomProjects, 'ybl', 1))
    .concat(personalizatedRows);
saveDailyAPY(finalFilteredData, storageKeyAvg);
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady()  {
  const tableBody = document.getElementById("yield-table");

  tableBody.addEventListener("focusout", function (event) {
    //if (event.key === "Enter" || event.key === "-" || event.key === ",") {
      const input = event.target;
      const id = input.id;
      const value = input.value.trim();
      const savedProjects = JSON.parse(localStorage.getItem(keyCustomProjects)) || [];
      const savedybl = JSON.parse(localStorage.getItem('ybl')) || [];
      const newProject = document.getElementById("ybl_new_project").value.trim();
      const newSymbol = document.getElementById("ybl_new_symbol").value.trim();
      const newChain = document.getElementById("ybl_new_chain").value.trim();
      const newApy = document.getElementById("ybl_new_apy").value.trim();
      if (id.startsWith("ybl_new") && !(id.startsWith("apy_"))) {
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
          document.getElementById("ybl_new_project").value = "";
          document.getElementById("ybl_new_symbol").value = "";
          document.getElementById("ybl_new_chain").value = "";
          document.getElementById("ybl_new_apy").value = "";
        }
      } else if ((id.startsWith("apy_") || id.startsWith("-"))&& !newProject) {
        if (value === '' || value === '-') {
          const updatedProjects = savedProjects.filter(item => item.keyId !== id.substr(4));
          localStorage.setItem(keyCustomProjects, JSON.stringify(updatedProjects));
          const row = input.closest('tr');
          if (row) {
            row.remove();
          }
          console.log("Deleted custom project, id: ", id.substr(4));
        } else if ((value !== "" || event.key === ",") && id) {
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
        if (value === '' || value === '-') {
          const updatedAssign = savedybl.filter(item => item.project !== id.substr(4));
          localStorage.setItem('ybl', JSON.stringify(updatedAssign));
        } else if ((value !== "" || event.key === ",") && id) {
          const index = savedybl.findIndex(item => item.project === id.substr(4));
          console.log(index);
          console.log(id.substr(4));
          if (index !== -1) {
            savedybl[index].asign = value;
            console.log(`Updated in LS -> ${id.substr(4)}: ${value}`);
          } else {
            savedybl.push({ project: id.substr(4), asign: value });
            console.log(`Saved in LS -> ${id.substr(4)}: ${value}`);
          }
          localStorage.setItem('ybl', JSON.stringify(savedybl));
        }
      }
      location.reload();

    //}
  });
}
function onVolumeDown() {
 alert("On Volume Down") ;
}
function onVolumeUp() {
 alert("On Volume Up") ;
}
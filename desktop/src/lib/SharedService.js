"use strict";
const todayShared = new Date();
const excludedChains = ["Moonbeam", "Kava", "Polynomial", "Core", "Aurora",
  "Flare", "Neutron", "Gnosis", "Rootstock", "Bifrost Network", "LightLink", "Hemi",
  "Bsquared", "Moonriver", "IOTA EVM", "Cardano", "Telos", "Move", "Tac", "Sei", "Sui", 
  "Etherlink", "Mantle", "Berachain", "Polygon",  "Solana", "Linea", "Celo", //"Sonic",
  "Cronos", "Move", "Stellar", "Polygon zkEVM", "Blast", "zkSync Era", "Ethereum",
  "MultiversX", "Fraxtal", "Aptos", "Scroll", "Optimism", "Morph", "Avalanche",//"Ton"
  "Cronos_zkevm", "Nolus", "Neon", "Starknet", "Osmosis", "Kujira", "Fantom"];
const excludedPlatforms = ['bagful', 'psyoptions', 'yel-finance', 'goldlink', 'balmy', 
  'deltaprime', 'vela-exchange', 'degenprime', 'c3-exchange', "sonne-finance",
  'ensuro', 'impermax-v2','impermax-v3', 'clearpool-lending', 'arcadia-v2', 'euler-v2',
  "peapods-finance", "ramses-legacy", "echelon-market", "swop", "folks-finance-xchain",
  "aptin-finance-v2", "harbor-market", "kinza-finance", "holdstation-defutures"];
const stylesTd = 'color:white;background-color:black;';
const stylesTdNew = 'color:black;background-color:lightgrey;';

async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
}
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return window.btoa(binary);
}
async function digestMessageHex(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
function getFromLS(key) {
  const value = localStorage.getItem(key);
  return value && value !== "";
}
function saveToLS(key, value) {
  localStorage.setItem(key, value);
}
function handleBlurEffect(element) {
  element.addEventListener('mouseover', () => {
    element.style.filter = 'blur(0px)';
  });
  element.addEventListener('mouseleave', () => {
    element.style.filter = 'blur(2px)';
  });
}
function genQR(dataQR) {
  const typeNumber = 0;
  const errorCorrectionLevel = 'L';
  const qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(dataQR);
  qr.make();
  qrCode.innerHTML = qr.createImgTag();
  setTimeout(hideQRCode, 60000);
  setTimeout(hideSecret, 60000);
}
function hideQRCode() {
  qrCode.style.display = 'none';
}
function hideSecret() {
  secretCode.style.display = 'none';
}
function enterHome() {
  document.body.classList.add('page-transition');
  setTimeout(function () {
    window.location.replace("../../index.html")
  }, 1000);
}
function loadPage(page) {
  const link = page.concat(".html");
  document.body.classList.add('page-transition');
  setTimeout(function () {
    window.location.replace(link);
  }, 500);
}
function confirmDeleteSecret() {
  let conf = null;
  if (confirm("~WARNING~\nDelete and generate new OTP QR code?")) {
    txtDelOtp = "deleteotp";
    window.sessionStorage.setItem(txtDelOtp, 'true');
    if (confirm("~CONFIRM~\nConfirm delete and generate new OTP QR code")) {
      conf = "confirmDelete";
      window.localStorage.removeItem('secretl');
      window.sessionStorage.setItem(conf, 'true');
    } else {
      conf = "notConfirm";
    }
  } else {
    txtDelOtp = "notdeleteotp";
  }
  console.log(txtDelOtp);
  if (conf)
    console.log(conf);
}

async function fetchDefiLlamaAPY(minApy) {
  const url = "https://yields.llama.fi/pools";
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data.filter(pool =>
      includedSymbols.includes(pool.symbol) &&
      pool.apy >= minApy && pool.apy < 220 &&
      !excludedChains.includes(pool.chain) &&
      !excludedPlatforms.includes(pool.project) &&
      pool.tvlUsd > 25000// &&
      //(pool.apyMean30d > minApy || pool.apyBase > minApy)
    );
  } catch (error) {
    console.error("Error fetching data from DefiLlama:", error);
    return [];
  }
}

function loadCustomProjects(keyCustomProjects, lsAsignKey, min) {
  const savedProjects = JSON.parse(localStorage.getItem(keyCustomProjects)) || [];
  const savedProjectsAsign = JSON.parse(localStorage.getItem(lsAsignKey)) || [];

  const customRows = savedProjects.length
    ? savedProjects
      .map((item) => {
        const symbol = item.symbol || '';
        const chain = item.chain || '';
        const project = item.project || '';
        const keyId = item.keyId || '';

        const projectShort = project.length >= 4 ? project.substr(0, 4) : project;
        const inputApyId = `apy_${keyId}`;
        const inputAsignId = `asg_${keyId}`;
        const savedValueAsign = savedProjectsAsign.filter(
          asignItem => asignItem.project === keyId).map(
            asignItem => asignItem.asign);

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
              <input type='number' min='${min}' step='${min}' id='${inputAsignId}'  
              value='${savedValueAsign}' placeholder='${projectShort}' 
              style='color:blue;background-color:gray;'>
            </td>
        </tr>
        `;
      })
      .join("")
    : "<tr><td style='color:white;background-color:black' " +
    "colspan='5'>No custom projects saved yet</td></tr>";

  return customRows;
}

function toggleDark(colorBase) {
  switch (document.body.style.backgroundColor) {
    case colorBase:
      document.body.style.backgroundColor = 'black';
      break;
    case 'black':
      document.body.style.backgroundColor = colorBase;
      break;
    default:
      document.body.style.backgroundColor = 'black';
      break;
  }
}

function loadChartData(storageKeyAvg) {
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

function saveDailyAPY(filteredData, storageKeyAvg) {
  if (localStorage.getItem(storageKeyAvg)) {
    return;
  }
  deletePrevMonthLS(storageKeyAvg);
  const apyByNetwork = {};
  filteredData.forEach(pool => {
    if (pool.apy > 8 && pool.apy < 160) {
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

function deletePrevMonthLS(key) {
  const currentDate = todayShared;
  let firstChain;
  currentDate.setDate(1);
  if (key.length === 17)  {
    firstChain = key.substr(0,7);
  }
  if (key.length === 18)  {
    currentDate.setMonth(currentDate.getMonth() - 1);
    firstChain = key.substr(0,8);
  }
  const prevYear = currentDate.getFullYear();
  const prevMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const prefixToDelete = `${firstChain}${prevYear}-${prevMonth}-`;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefixToDelete)) {
      console.log('key deleted:',key);
      localStorage.removeItem(key);
    }
  });
}

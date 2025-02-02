window.addEventListener('DOMContentLoaded', () => {
  const homeBtn = document.getElementById("homeBtn");
  loadYieldData();
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

      return data.data
          .filter(pool => 
              ["USDC", "DAI", "USDT"].includes(pool.symbol) && 
              pool.chain === "Ethereum"
          ) // Filtramos solo stablecoins en Ethereum
          .map(pool => ({
              platform: pool.project,
              symbol: pool.symbol,
              apy: pool.apy.toFixed(2) // Convertimos APY a 2 decimales
          }));
  } catch (error) {
      console.error("Error obteniendo datos de DefiLlama:", error);
      return [];
  }
}

async function loadYieldData() {
  const tableBody = document.getElementById("yield-table");
  tableBody.innerHTML = "<tr><td colspan='3'>Cargando...</td></tr>";

  const yieldData = await fetchDefiLlamaAPY();

  tableBody.innerHTML = yieldData.length ? yieldData.map(item => `
      <tr>
          <td>${item.platform}</td>
          <td>${item.symbol}</td>
          <td>${item.apy}%</td>
      </tr>
  `).join("") : "<tr><td colspan='3'>No hay datos disponibles</td></tr>";
}

//document.addEventListener("DOMContentLoaded", loadYieldData);
window.addEventListener('DOMContentLoaded', async() => {
  const homeBtn = document.getElementById("homeBtn");
  document.getElementById("networkFilter").addEventListener("change", loadYieldData);
  document.getElementById("platformFilter").addEventListener("change", loadYieldData);
  document.getElementById("apyFilter").addEventListener("change", loadYieldData);
  const ctx = document.getElementById("apyChart").getContext("2d");
  await loadYieldData();
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      enterHome();
    });
    
  } else {
    console.error('Un botón no fue encontrado en el DOM.');
  }
  new Chart(ctx, {
    type: "line",
    data: {
        labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
        datasets: [{
            label: "Evolución del APY",
            data: [4.2, 4.5, 5.1, 6.2, 5.8],
            borderColor: "#007bff",
            backgroundColor: "rgba(0, 123, 255, 0.2)",
            fill: true
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false
      }
  });
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

async function loadYieldData() {
  const tableBody = document.getElementById("yield-table");
  tableBody.innerHTML = "<tr><td colspan='4'>Cargando...</td></tr>";
  const yieldData = await fetchDefiLlamaAPY();
  
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

  // 📌 Aplicar la ordenación según la selección del usuario
  finalFilteredData.sort((a, b) => {
      if (sortFilter === "apy-desc") return b.apy - a.apy;  // APY Mayor a Menor
      if (sortFilter === "apy-asc") return a.apy - b.apy;  // APY Menor a Mayor
      if (sortFilter === "name-asc") return a.project.localeCompare(b.project);  // Plataforma A-Z
      if (sortFilter === "name-desc") return b.project.localeCompare(a.project);  // Plataforma Z-A
  });

  // 📌 Renderizar la tabla con los datos ordenados
  tableBody.innerHTML = finalFilteredData.length ? finalFilteredData.map(item => `
      <tr>
          <td>${item.project}</td>
          <td>${item.symbol}</td>
          <td>${item.chain}</td>
          <td>${item.apy.toFixed(2)}%</td>
      </tr>
  `).join("") : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";
}

// 📌 Agregar el evento al selector de ordenación
document.getElementById("sortFilter").addEventListener("change", loadYieldData);

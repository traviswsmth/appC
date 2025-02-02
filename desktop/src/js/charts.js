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
      return data.data.filter(pool => 
          ["USDC", "DAI", "USDT"].includes(pool.symbol) && pool.apy >= 5
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
  
  // 📌 Filtrar primero los datos según el APY seleccionado
  const filteredByAPY = yieldData.filter(pool => pool.apy >= apyFilter);

  // 📌 Extraer solo redes y plataformas con al menos un pool que cumpla la condición
  const validNetworks = [...new Set(filteredByAPY.map(pool => pool.chain))];
  const validPlatforms = [...new Set(filteredByAPY.map(pool => pool.project))];

  // 📌 Guardar la selección del usuario antes de regenerar opciones
  const selectedNetwork = networkFilter.value;
  const selectedPlatform = platformFilter.value;

  // 📌 Regenerar los selects solo con valores válidos
  networkFilter.innerHTML = `<option value='all'>Todas</option>` + validNetworks.map(n => `<option value='${n}'>${n}</option>`).join("");
  platformFilter.innerHTML = `<option value='all'>Todas</option>` + validPlatforms.map(p => `<option value='${p}'>${p}</option>`).join("");

  // 📌 Restaurar selección del usuario si sigue siendo válida
  if (validNetworks.includes(selectedNetwork)) networkFilter.value = selectedNetwork;
  if (validPlatforms.includes(selectedPlatform)) platformFilter.value = selectedPlatform;

  // 📌 Filtrar datos según la red y plataforma seleccionada
  const finalFilteredData = filteredByAPY.filter(pool => 
      (networkFilter.value === "all" || pool.chain === networkFilter.value) &&
      (platformFilter.value === "all" || pool.project === platformFilter.value)
  );

  // 📌 Renderizar la tabla con los datos finales
  tableBody.innerHTML = finalFilteredData.length ? finalFilteredData.map(item => `
      <tr>
          <td>${item.project}</td>
          <td>${item.symbol}</td>
          <td>${item.chain}</td>
          <td>${item.apy.toFixed(2)}%</td>
      </tr>
  `).join("") : "<tr><td colspan='4'>No hay datos disponibles</td></tr>";
}

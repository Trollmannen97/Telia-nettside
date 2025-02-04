const backendUrl = "https://telia-backend.onrender.com"; // Oppdater med riktig backend-URL
let teliaData = null;

/****************************************************
 * 1) ADMIN LOGIN SYSTEM
 ****************************************************/
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      loadData();
    } else {
      document.getElementById("errorMessage").innerText = data.message;
    }
  } catch (error) {
    console.error("Innloggingsfeil:", error);
  }
}

function logout() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("loginContainer").style.display = "block";
}

/****************************************************
 * 2) HENT DATA FRA BACKEND OG FYLL SKJEMA
 ****************************************************/
async function loadData() {
  try {
    const response = await fetch(`${backendUrl}/api/prices`);
    const data = await response.json();

    // Debugging: Sjekk hva backend returnerer
    console.log("Data fra backend:", data);

    teliaData = {
      abonnementer: data.abonnementer || [],
      rabatter: data.rabatter || { hovednummer: [], familie: {} },
      simKort: {
        normal: data.simKort?.normal ?? 0,
        teliaX: data.simKort?.teliaX ?? 0,
        klokke: data.simKort?.klokke,
      },
      tilleggsProdukter: data.tilleggsProdukter || [],
    };

    buildAbonnementEditor();
    buildRabattEditor();
    buildSimEditor();
    buildAddonsEditor();
  } catch (error) {
    console.error("Kunne ikke laste data fra backend:", error);
  }
}

function buildAbonnementEditor() {
  const container = document.getElementById("abonnementContainer");
  container.innerHTML = "";
  teliaData.abonnementer.forEach((plan) => {
    container.innerHTML += `
            <div>
                <label>${plan.navn}:</label>
                <input type="number" id="plan-${plan.id}" value="${plan.pris}">
            </div>
        `;
  });
}

function buildRabattEditor() {
  const container = document.getElementById("rabattContainer");
  container.innerHTML = ""; // Tømmer container før vi bygger innholdet

  if (!teliaData.rabatter) {
    console.warn("Rabatter mangler eller er tom:", teliaData.rabatter);
    container.innerHTML = "<p>Ingen rabatter funnet</p>";
    return;
  }

  // 🟢 Håndter "hovednummer" rabatter (array)
  if (Array.isArray(teliaData.rabatter.hovednummer)) {
    teliaData.rabatter.hovednummer.forEach((r, index) => {
      container.innerHTML += `
        <div>
          <label>Hovednummer rabatt ${index + 1}:</label>
          <input type="number" id="rabatt-hovednummer-${index}" value="${r}">
        </div>
      `;
    });
  }

  // 🟢 Håndter "familie" rabatter (objekt)
  if (teliaData.rabatter.familie) {
    Object.entries(teliaData.rabatter.familie).forEach(([key, value]) => {
      container.innerHTML += `
        <div>
          <label>Familierabatt (${key}):</label>
          <input type="number" id="rabatt-familie-${key}" value="${value}">
        </div>
      `;
    });
  }
}

function buildSimEditor() {
  const container = document.getElementById("simContainer");
  container.innerHTML = `
        <label>Normal SIM-kort pris:</label>
        <input type="number" id="sim-normal" value="${teliaData.simKort.normal.pris}">
        <label>Telia X SIM-kort pris:</label>
        <input type="number" id="sim-teliaX" value="${teliaData.simKort.teliaX.pris}">
        <label>Klokke SIM-kort pris:</label>
        <input type="number" id="sim-klokke" value="${teliaData.simKort.klokke.pris}">
    `;
}

function buildAddonsEditor() {
  const container = document.getElementById("addonsContainer");
  container.innerHTML = "";
  teliaData.tilleggsProdukter.forEach((addon) => {
    container.innerHTML += `
            <div>
                <label>${addon.navn}:</label>
                <input type="number" id="addon-${addon.id}" value="${addon.pris}">
            </div>
        `;
  });
}

/****************************************************
 * 3) LAGRE ENDRINGER TIL BACKEND
 ****************************************************/
async function saveChanges() {
  // Sjekk om `teliaData` er definert
  if (!teliaData) {
    console.error("teliaData er ikke lastet inn.");
    return;
  }

  // Bygger opp riktig JSON-format for backend
  const updatedData = {
    abonnementer: teliaData.abonnementer.map((plan) => ({
      id: plan.id,
      pris: parseFloat(document.getElementById(`plan-${plan.id}`).value),
    })),
    rabatter: {
      hovednummer: teliaData.rabatter.hovednummer.map((r, index) =>
        parseFloat(document.getElementById(`rabatt-hovednummer-${index}`).value)
      ),
      familie: Object.fromEntries(
        Object.entries(teliaData.rabatter.familie).map(([key, value]) => [
          key,
          parseFloat(document.getElementById(`rabatt-familie-${key}`).value),
        ])
      ),
    }, // Sikrer at rabatter ikke er undefined
    simKort: [
      {
        id: "sim_normal",
        pris: parseFloat(document.getElementById("sim-normal").value),
      },
      {
        id: "sim_teliaX",
        pris: parseFloat(document.getElementById("sim-teliaX").value),
      },
    ],
    tilleggsProdukter: teliaData.tilleggsProdukter.map((addon) => ({
      id: addon.id,
      pris: parseFloat(document.getElementById(`addon-${addon.id}`).value),
    })),
  };

  try {
    const response = await fetch(`${backendUrl}/api/update-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    const result = await response.json();
    document.getElementById("saveMessage").innerText = result.message;
    console.log("Oppdatering vellykket:", result);
  } catch (error) {
    console.error("Kunne ikke lagre data til backend:", error);
  }
}

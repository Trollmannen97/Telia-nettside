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
    teliaData = await response.json();

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
  container.innerHTML = "";
  teliaData.rabatter.hovednummer.forEach((r) => {
    container.innerHTML += `
            <div>
                <label>${r.type} rabatt:</label>
                <input type="number" id="rabatt-${r.id}" value="${r.rabatt}">
            </div>
        `;
  });
}

function buildSimEditor() {
  const container = document.getElementById("simContainer");
  container.innerHTML = `
        <label>Normal SIM-kort pris:</label>
        <input type="number" id="sim-normal" value="${teliaData.simKort.normal}">
        <label>Telia X SIM-kort pris:</label>
        <input type="number" id="sim-teliaX" value="${teliaData.simKort.teliaX}">
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
  const updatedData = {
    abonnementer: teliaData.abonnementer.map((plan) => ({
      id: plan.id,
      pris: parseFloat(document.getElementById(`plan-${plan.id}`).value),
    })),
    rabatter: teliaData.rabatter.hovednummer.map((rabatt) => ({
      id: rabatt.id,
      rabatt: parseFloat(document.getElementById(`rabatt-${rabatt.id}`).value),
    })),
    simKort: [
      {
        type: "normal",
        pris: parseFloat(document.getElementById("sim-normal").value),
      },
      {
        type: "teliaX",
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

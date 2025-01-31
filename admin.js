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
 * 2) HENT JSON-DATA OG FYLL SKJEMA
 ****************************************************/
async function loadData() {
  try {
    const response = await fetch(`${backendUrl}/api/prices`);
    const data = await response.json();

    // Strukturér dataen slik frontend forventer
    teliaData = {
      abonnementer: data.filter((item) => item.type === "abonnement"),
      rabatter: {
        hovednummer: data
          .filter((item) => item.type === "rabatt")
          .map((r) => r.pris),
      },
      simKort: {
        normal: data.find((item) => item.id === "sim_normal")?.pris || 0,
        teliaX: data.find((item) => item.id === "sim_teliaX")?.pris || 0,
      },
      tilleggsProdukter: data.filter((item) => item.type === "tillegg"),
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
  teliaData.abonnementer.forEach((plan, index) => {
    container.innerHTML += `
            <div>
                <label>${plan.navn}:</label>
                <input type="number" id="plan-${index}" value="${plan.pris}">
            </div>
        `;
  });
}

function buildRabattEditor() {
  const container = document.getElementById("rabattContainer");
  container.innerHTML = "";
  teliaData.rabatter.hovednummer.forEach((r, index) => {
    container.innerHTML += `
            <div>
                <label>Hovednummer rabatt ${index + 1}:</label>
                <input type="number" id="rabatt-${index}" value="${r}">
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
  teliaData.tilleggsProdukter.forEach((addon, index) => {
    container.innerHTML += `
            <div>
                <label>${addon.navn}:</label>
                <input type="number" id="addon-${index}" value="${addon.pris}">
            </div>
        `;
  });
}

/****************************************************
 * 3) LAGRE ENDRINGER TIL JSON
 ****************************************************/
function saveChanges() {
  teliaData.abonnementer.forEach((plan, index) => {
    plan.pris = document.getElementById(`plan-${index}`).value;
  });

  teliaData.rabatter.hovednummer.forEach((r, index) => {
    teliaData.rabatter.hovednummer[index] = document.getElementById(
      `rabatt-${index}`
    ).value;
  });

  teliaData.simKort.normal = document.getElementById("sim-normal").value;
  teliaData.simKort.teliaX = document.getElementById("sim-teliaX").value;

  teliaData.tilleggsProdukter.forEach((addon, index) => {
    addon.pris = document.getElementById(`addon-${index}`).value;
  });

  // Her må en backend-løsning brukes for å lagre filen
  console.log("Nye data:", teliaData);
  document.getElementById("saveMessage").innerText = "Endringer lagret!";
}

async function saveChanges() {
  // Bygger opp riktig JSON-format for backend
  const updatedData = {
    abonnementer: teliaData.abonnementer.map((plan, index) => ({
      id: plan.id,
      pris: parseFloat(document.getElementById(`plan-${index}`).value),
    })),
    rabatter: teliaData.rabatter.hovednummer.map((pris, index) => ({
      id: `rabatt_${index}`,
      pris: parseFloat(document.getElementById(`rabatt-${index}`).value),
    })),
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
    tilleggsProdukter: teliaData.tilleggsProdukter.map((addon, index) => ({
      id: addon.id,
      pris: parseFloat(document.getElementById(`addon-${index}`).value),
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

let teliaData = null;

/****************************************************
 * 1) ADMIN LOGIN SYSTEM
 ****************************************************/
const adminCredentials = { username: "teliaAdmin", password: "superhemmelig" };

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (
    username === adminCredentials.username &&
    password === adminCredentials.password
  ) {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadData();
  } else {
    document.getElementById("errorMessage").innerText =
      "Feil brukernavn eller passord.";
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
    const response = await fetch(
      "/Telia-nettside/Telia-kalkulator/prices.json"
    );
    teliaData = await response.json();

    buildAbonnementEditor();
    buildRabattEditor();
    buildSimEditor();
    buildAddonsEditor();
  } catch (error) {
    console.error("Kunne ikke laste JSON:", error);
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
  teliaData.abonnementer.forEach((plan, index) => {
    plan.pris = parseFloat(document.getElementById(`plan-${index}`).value);
  });

  teliaData.rabatter.hovednummer.forEach((r, index) => {
    teliaData.rabatter.hovednummer[index] = parseFloat(
      document.getElementById(`rabatt-${index}`).value
    );
  });

  teliaData.simKort.normal = parseFloat(
    document.getElementById("sim-normal").value
  );
  teliaData.simKort.teliaX = parseFloat(
    document.getElementById("sim-teliaX").value
  );

  teliaData.tilleggsProdukter.forEach((addon, index) => {
    addon.pris = parseFloat(document.getElementById(`addon-${index}`).value);
  });

  try {
    const response = await fetch("http://localhost:3000/api/update-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teliaData),
    });

    const result = await response.json();
    document.getElementById("saveMessage").innerText = result.message;
    console.log("Oppdatering vellykket:", result);
  } catch (error) {
    console.error("Kunne ikke lagre JSON-data:", error);
  }
}

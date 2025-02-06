const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function toggleTheme() {
  let currentTheme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";

  if (currentTheme === "light") {
    document.body.classList.add("dark-mode");
    themeIcon.src = "/Telia-nettside/icons/dark-icon.svg"; // Bytt til mørkt ikon
    localStorage.setItem("theme", "dark"); // Lagre valg i nettleseren
  } else {
    document.body.classList.remove("dark-mode");
    themeIcon.src = "/Telia-nettside/icons/light-icon.svg"; // Bytt til lyst ikon
    localStorage.setItem("theme", "light");
  }
}

// Funksjon for å vise/skjule rabatt-knappen dynamisk
function toggleNewCustomerDiscount() {
  const plan = document.getElementById("plan");
  const discountContainer = document.getElementById(
    "newCustomerDiscountContainer"
  );

  if (plan.options[plan.selectedIndex].text.includes("Telia X Start")) {
    discountContainer.style.display = "flex"; // Viser rabatt-knappen
  } else {
    discountContainer.style.display = "none"; // Skjuler rabatt-knappen
    document.getElementById("newCustomer").checked = false; // Tilbakestill rabatt
    applyNewCustomerDiscount(); // Oppdater pris
  }
}

// Funksjon for å aktivere rabatt og oppdatere prisen
let newCustomerDiscountApplied = false; // Global variabel for rabattstatus

function applyNewCustomerDiscount() {
  const newCustomerCheckbox = document.getElementById("newCustomer");

  // Oppdater rabattstatus basert på om bryteren er aktivert eller ikke
  newCustomerDiscountApplied = newCustomerCheckbox.checked;

  // Kjør totalprisberegningen for å oppdatere prisen riktig
  calculateTotalPrice();
}

// Lytt til endringer i abonnementet og vis/skjul rabatt-knappen
document
  .getElementById("plan")
  .addEventListener("change", toggleNewCustomerDiscount);

// Sjekk lagret tema når siden lastes
document.addEventListener("DOMContentLoaded", () => {
  let savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.src = "/icons/dark-icon.svg";
  }
  themeToggle.addEventListener("click", toggleTheme);
});

/****************************************************
 * 1) GLOBALE VARIABLER ELLER KONSTANTER
 ****************************************************/
let teliaData = null;
// Her vil vi lagre innholdet fra prices.json (abonnementer, rabatter, simKort, tilleggsProdukter, etc.)

/****************************************************
 * 2) HENT Backend Data
 ****************************************************/
const backendUrl = "https://telia-backend.onrender.com"; // Bytt til din faktiske Render-URL

async function fetchTeliaData(forceReload = false) {
  if (!forceReload && teliaData) return teliaData;

  try {
    const response = await fetch(`${backendUrl}/api/prices`);
    const data = await response.json();

    if (!data || !data.abonnementer) {
      throw new Error("Ugyldig dataformat fra backend");
    }

    teliaData = {
      abonnementer: data.abonnementer, // Hovedabonnementer
      rabatter: data.rabatter || { hovednummer: [] }, // Rabattstruktur
      simKort: data.simKort || { normal: 0, teliaX: 0 }, // SIM-kort priser
      tilleggsProdukter: data.tilleggsProdukter || [], // Tilleggstjenester
    };

    return teliaData;
  } catch (error) {
    console.error("Kunne ikke laste data fra backend:", error);
    return null;
  }
}

/****************************************************
 * 3) FYLL <select id="plan"> DYNAMISK
 ****************************************************/
async function buildMainPlanOptions() {
  const data = await fetchTeliaData();
  if (!data) return;

  const planSelect = document.getElementById("plan");
  if (!planSelect) {
    console.error("Fant ikke #plan i HTML.");
    return;
  }
  planSelect.innerHTML = ""; // Fjern evt. placeholder

  // data.abonnementer er en array med { id, navn, pris }
  data.abonnementer.forEach((ab) => {
    const opt = document.createElement("option");
    opt.value = ab.pris; // Fortsatt 'pris' som .value, så rest av koden funker
    opt.textContent = `${ab.navn} - ${ab.pris} kr`;
    planSelect.appendChild(opt);
  });
}

async function buildAddons() {
  const data = await fetchTeliaData();
  if (!data || !data.tilleggsProdukter) return;

  const addonContainer = document.getElementById("addonContainer");
  if (!addonContainer) {
    console.error("Fant ikke #addonContainer i HTML.");
    return;
  }

  addonContainer.innerHTML = ""; // Tøm container før vi fyller den

  data.tilleggsProdukter.forEach((addon) => {
    const img = document.createElement("img");
    img.src = `/Telia-nettside/Bilder/${addon.navn
      .toLowerCase()
      .replace(/\s+/g, "_")}.png`; // Bruker navn som filnavn
    img.alt = addon.navn;
    img.classList.add("addon-icon");
    img.setAttribute("data-price", addon.pris);
    img.onclick = () => toggleAddon(img);

    addonContainer.appendChild(img);
  });
}

// Funksjon for å velge/avvelge en tilleggstjeneste
function toggleAddon(element) {
  element.classList.toggle("selected");
  const price = parseFloat(element.getAttribute("data-price")) || 0;
  updateTotalPrice(element.classList.contains("selected") ? price : -price);
}

/****************************************************
 * 4) FYLL <select class="family-plan-select"> DYNAMISK
 ****************************************************/
async function buildFamilyPlanOptions(selectElement) {
  const data = await fetchTeliaData();
  if (!data) return;

  selectElement.innerHTML = "";
  data.abonnementer.forEach((ab) => {
    const opt = document.createElement("option");
    opt.value = ab.pris;
    opt.textContent = `${ab.navn} - ${ab.pris} kr`;
    selectElement.appendChild(opt);
  });
}

/****************************************************
 * 4b) FYLL <select class="family-extra-discount"> DYNAMISK
 *     (Kalles inni addFamilyPlan() etter at newDiv
 *      er lagt til i DOM.)
 ****************************************************/
async function buildFamilyExtraDiscountSelect(selectElement) {
  const data = await fetchTeliaData();
  if (!data) return;

  // Leser “ekstraProsent” fra JSON, eller fallback til [0,10,15,20]
  const prosenter = data.rabatter.familie.ekstraProsent || [0, 10, 15, 20];
  selectElement.innerHTML = "";
  prosenter.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p === 0 ? "Ingen ekstra rabatt" : p + "%";
    selectElement.appendChild(opt);
  });
}
/****************************************************
 * 4c) FYLL <select id="discount"> med hovednummer-rabatter
 ****************************************************/
async function buildHovednummerDiscountSelect() {
  const data = await fetchTeliaData();
  if (!data || !data.rabatter || !Array.isArray(data.rabatter.hovednummer)) {
    console.error("Rabattdata for hovednummer mangler eller er feil format.");
    return;
  }

  const discountSelect = document.getElementById("discount");
  if (!discountSelect) {
    console.error("Fant ikke #discount i HTML.");
    return;
  }

  discountSelect.innerHTML = ""; // Tømmer <select>

  // Legg til "Ingen rabatt" som standardvalg
  const defaultOption = document.createElement("option");
  defaultOption.value = "0";
  defaultOption.textContent = "Ingen rabatt";
  discountSelect.appendChild(defaultOption);

  // Bruk den riktige arrayen `hovednummer`
  data.rabatter.hovednummer.forEach((prosent) => {
    const opt = document.createElement("option");
    opt.value = prosent;
    opt.textContent = `${prosent}%`;
    discountSelect.appendChild(opt);
  });

  // Sett standard til "Ingen rabatt"
  discountSelect.value = "0";

  // Koble event for å kjøre calculateTotalPrice() når man endrer rabatt
  discountSelect.addEventListener("change", calculateTotalPrice);
}

/****************************************************
 * 5) NÅ BYTTER VI UT DIN HARDCODEDE <option>
 *    I addFamilyPlan() MED EN TOM <select>, SOM SÅ FYLLES
 *    AV buildFamilyPlanOptions(...).
 ****************************************************/
function addFamilyPlan() {
  const familyPlans = document.getElementById("familyPlans");

  const newDiv = document.createElement("div");
  newDiv.classList.add("family-plan");

  newDiv.innerHTML = `
    <select class="family-plan-select"></select>
    <label for="familyExtraDiscount">Ekstra rabatt:</label>
    <select class="family-extra-discount" onchange="calculateTotalPrice()">
    </select>
    <div class="sim-options">
      <label for="twinsim">TvillingSIM:</label>
      <select class="twinsim-select" onchange="updateSimPrice(this)">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
      <label for="datasim">DataSIM:</label>
      <select class="datasim-select" onchange="updateSimPrice(this)">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
      <label for="klokke">Smartklokke:</label>
      <select class="klokke-select" onchange="updateSimPrice(this)">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
      <span class="family-plan-price">SIM-kort: 0.00 kr</span>
    </div>
    <div class="device-payment-container">
      <label for="devicePayment">Svitsj/delbetaling (kr/mnd):</label>
      <input
        type="number"
        class="device-payment"
        value="0"
        min="0"
        onchange="calculateTotalPrice()"
      />
    </div>
    <div class="addons-container"></div> <!-- Dynamisk generert -->
    <button type="button" class="remove-family-plan" onclick="removeFamilyPlan(this)">Fjern</button>
  `;

  familyPlans.appendChild(newDiv);

  const familySelect = newDiv.querySelector(".family-plan-select");
  buildFamilyPlanOptions(familySelect);

  const discountSelect = newDiv.querySelector(".family-extra-discount");
  buildFamilyExtraDiscountSelect(discountSelect);

  // Kaller en ny funksjon for å bygge tilleggstjenester dynamisk
  buildFamilyAddons(newDiv.querySelector(".addons-container"));
}

async function buildFamilyAddons(container) {
  const data = await fetchTeliaData();
  if (!data || !data.tilleggsProdukter) return;

  container.innerHTML = ""; // Tøm container før vi fyller den

  data.tilleggsProdukter.forEach((addon) => {
    const img = document.createElement("img");
    img.src = `/Telia-nettside/Bilder/${addon.navn
      .toLowerCase()
      .replace(/\s+/g, "_")}.png`;
    img.alt = addon.navn;
    img.classList.add("addon-icon");
    img.setAttribute("data-price", addon.pris);
    img.onclick = () => toggleAddon(img);

    container.appendChild(img);
  });
}

/****************************************************
 * 6) KJØR buildMainPlanOptions() VED OPPSTART
 ****************************************************/
// I stedet for dine gamle 'toggleCustomerType()' i global scope,
// gjør vi:

window.addEventListener("DOMContentLoaded", async () => {
  await buildMainPlanOptions(); // Bygger <select id="plan">
  await buildHovednummerDiscountSelect(); // Bygger <select id="discount">
  await buildAddons(); // Bygg tilleggstjenester for enkel kunde
  toggleCustomerType(); // Viser/skjuler enkel/familie-seksjon
});

// Funksjon for å vise/skjule elementer basert på kundetypefunction toggleCustomerType() {
function toggleCustomerType() {
  const singlePlanOptions = document.getElementById("singlePlanOptions");
  const familySection = document.getElementById("familySection");
  const addonContainer = document.querySelector(".addon-container");

  if (document.getElementById("single").checked) {
    console.log("Enkel kunde er valgt.");
    singlePlanOptions.style.display = "block";
    familySection.style.display = "none";
    addonContainer.style.display = "block"; // Viser tilleggstjenester
  } else if (document.getElementById("family").checked) {
    console.log("Familie er valgt.");
    singlePlanOptions.style.display = "none";
    familySection.style.display = "block";
    addonContainer.style.display = "none"; // Skjuler tilleggstjenester
  } else {
    console.error("Ingen gyldig radioknapp er valgt.");
  }
}

// Funksjon for å håndtere tilleggstjenester
function toggleAddon(element) {
  // Hent prisen fra data-attributten
  const addonPrice = parseFloat(element.getAttribute("data-price")) || 0;

  // Toggle 'selected'-klassen og oppdater totalprisen
  const isSelected = element.classList.toggle("selected");
  updateTotalPrice(isSelected ? addonPrice : -addonPrice);
}

// Oppdaterer totalprisen
function updateTotalPrice(amount) {
  const totalDisplay = document.getElementById("finalPrice"); // Elementet som viser totalprisen
  const currentTotal = parseFloat(totalDisplay.dataset.total) || 0;
  const newTotal = currentTotal + amount;

  // Oppdater data-attributten og visningsverdien
  totalDisplay.dataset.total = newTotal;
  totalDisplay.innerText = `Endelig pris: ${newTotal.toFixed(2)} kr`;
}

// Funksjon for å fjerne et familieabonnement
function removeFamilyPlan(element) {
  const familyPlans = document.getElementById("familyPlans");
  const plan = element.parentElement;

  if (familyPlans.contains(plan)) {
    familyPlans.removeChild(plan);
  }
}

// Funksjon for å hente familierabatten basert på valgt plan

function getFamilyDiscount(planValue, planText, isMainNumber) {
  if (!teliaData || !teliaData.rabatter || !teliaData.rabatter.familie) {
    console.warn("⚠️ Feil: Rabatter for familie er ikke definert.");
    return 0; // Returnerer 0 for å unngå feilen
  }

  const fam = teliaData.rabatter.familie;

  if (isMainNumber) {
    return 0;
  }

  if (planText.includes("Telia X Start")) {
    return fam.teliaX || 0; // Unngå undefined-feil
  }
  if (
    planText.includes("Telia X") &&
    !planText.includes("Telia X Ung") &&
    planValue >= 399
  ) {
    return fam.teliaX || 0;
  }
  if (
    planText.includes("5GB") ||
    planText.includes("10GB") ||
    planText.includes("Junior")
  ) {
    return fam.teliaMobile || 0; // Her oppstod feilen, sikrer at den ikke krasjer
  }

  return 0;
}

// Funksjon for å beregne prisen på TvillingSIM og DataSIM
// Funksjon for å beregne prisen på TvillingSIM, DataSIM og KlokkeSIM
function calculateSimPrice(
  planType,
  twinSimCount,
  dataSimCount,
  klokkeSimCount
) {
  if (!teliaData) {
    console.warn("teliaData ikke lastet - returnerer 0");
    return { twinSimPrice: 0, dataSimPrice: 0, klokkeSimPrice: 0 };
  }

  const sim = teliaData.simKort; // Henter SIM-kort priser fra JSON
  let twinSimPrice = 0;
  let dataSimPrice = 0;
  let klokkeSimPrice = klokkeSimCount * (sim.klokke?.pris || 30); // Setter 30 kr som fallback-pris hvis klokke-SIM ikke finnes i databasen

  const totalSimCount = twinSimCount + dataSimCount;

  // **Sjekk om det er Telia X Max Pluss**
  if (planType.includes("Max Pluss")) {
    const freeSimCards = sim.teliaX?.gratisSim || 0; // Bruker gratisSim fra databasen
    const simPricePerUnit = sim.teliaX?.pris || 89; // Telia X SIM-pris

    let chargeable = totalSimCount - freeSimCards; // Hvor mange SIM som skal betales for

    if (chargeable <= 0) {
      twinSimPrice = 0;
      dataSimPrice = 0;
    } else {
      // **Fordel gratis-SIM mellom Tvilling og Data**
      let leftoverTwinSim = Math.min(twinSimCount, freeSimCards);
      let leftoverFreeSlots = freeSimCards - leftoverTwinSim;
      let leftoverDataSim = Math.min(dataSimCount, leftoverFreeSlots);

      const chargeableTwinSim = twinSimCount - leftoverTwinSim;
      const chargeableDataSim = dataSimCount - leftoverDataSim;

      twinSimPrice = chargeableTwinSim * simPricePerUnit;
      dataSimPrice = chargeableDataSim * simPricePerUnit;
    }
  } else if (planType.includes("Telia X")) {
    const simPricePerUnit = sim.teliaX?.pris || 89; // Telia X SIM-pris
    twinSimPrice = twinSimCount * simPricePerUnit;
    dataSimPrice = dataSimCount * simPricePerUnit;
  } else {
    const simPricePerUnit = sim.normal?.pris || 49; // Standard SIM-pris
    twinSimPrice = twinSimCount * simPricePerUnit;
    dataSimPrice = dataSimCount * simPricePerUnit;
  }

  return { twinSimPrice, dataSimPrice, klokkeSimPrice };
}

// Funksjon for å vise detaljert resultat
function updateResultDisplay() {
  // Hent HTML-elementene for å vise valgt informasjon
  const selectedPlanElement = document.getElementById("selectedPlan");
  const discountDetailsElement = document.getElementById("discountDetails");
  const simDetailsElement = document.getElementById("simDetails");
  const addonDetailsElement = document.getElementById("addonDetails");
  const devicePaymentDiv = document.getElementById("devicePaymentDetails");

  // Sjekk om elementene eksisterer
  if (
    !selectedPlanElement ||
    !discountDetailsElement ||
    !simDetailsElement ||
    !addonDetailsElement ||
    !devicePaymentDiv
  ) {
    console.error("Ett eller flere nødvendige HTML-elementer ble ikke funnet.");
    return;
  }

  // Tøm innholdet i elementene for å starte på nytt
  selectedPlanElement.innerHTML = "";
  discountDetailsElement.innerHTML = "";
  simDetailsElement.innerHTML = "";
  addonDetailsElement.innerHTML = "";
  devicePaymentDiv.innerHTML = "";

  // **Vis hovedabonnementet**
  const plan = document.getElementById("plan");
  if (!plan || plan.selectedIndex === -1) {
    console.warn("Abonnement er ikke lastet inn enda.");
    return;
  }

  // ✅ **Nå deklareres `planName` før den brukes**
  const planNameFull = plan.options[plan.selectedIndex].text;
  let selectedPlanPrice = parseFloat(plan.value);
  let planName = planNameFull.split(" - ")[0];

  // ✅ **Sjekk om rabatt er aktivert OG trekk fra rabatten før visning**
  const newCustomerCheckbox = document.getElementById("newCustomer");
  const newCustomerDiscountApplied = newCustomerCheckbox.checked;

  if (planName.includes("Telia X Start") && newCustomerDiscountApplied) {
    selectedPlanPrice -= 50;
  }

  // Hent den valgte rabattprosenten for hovednummeret
  const discountSelect = document.getElementById("discount");
  if (!discountSelect) {
    console.error("Elementet med ID 'discount' ble ikke funnet.");
    return;
  }
  const discountValue = discountSelect.value || "0";
  const discountPercentage = parseFloat(discountValue) || 0;

  // ✅ **Riktig rabattberegning for hovedabonnementet**
  const mainDiscountAmount = (selectedPlanPrice * discountPercentage) / 100;
  const discountedMainPlanPrice = selectedPlanPrice - mainDiscountAmount;

  // ✅ **Nå vises riktig pris i prisdetaljene!**
  let plansDetails = `<p>Hovedabonnement: ${planName} - ${discountedMainPlanPrice.toFixed(
    2
  )} kr</p>`;

  // Oppdater rabatt-detaljer
  let discountDetails = "";
  if (discountPercentage > 0) {
    discountDetails += `<p>Hovedabonnement: ${discountPercentage}% rabatt (${mainDiscountAmount.toFixed(
      2
    )} kr trukket fra)</p>`;
  } else {
    discountDetails += `<p>Hovedabonnement: Ingen rabatt</p>`;
  }

  // ======================================
  // Definer strengvariabler for SIM og Delbetaling
  // før vi bruker dem
  // ======================================
  let simDetails = "";
  let devicePaymentDetails = "";

  // ======================================
  // Hent delbetaling for enkel kunde
  // ======================================
  const singleDevicePaymentInput = document.getElementById(
    "singleDevicePayment"
  );
  if (singleDevicePaymentInput) {
    const singleDevicePayment = parseFloat(singleDevicePaymentInput.value) || 0;
    if (singleDevicePayment > 0) {
      devicePaymentDetails += `<p>Svitsj/delbetaling: ${singleDevicePayment.toFixed(
        2
      )} kr</p>`;
    }
  }

  // **Familieabonnement**
  const familyPlans = document.getElementsByClassName("family-plan");
  for (let i = 0; i < familyPlans.length; i++) {
    const familyPlanDiv = familyPlans[i];
    const planSelect = familyPlanDiv.querySelector(".family-plan-select");
    const familyPlanNameFull =
      planSelect.options[planSelect.selectedIndex].text;
    const familyPlanPrice = parseFloat(planSelect.value);
    const familyPlanName = familyPlanNameFull.split(" - ")[0];

    // Beregn rabatt for familieabonnementet
    const discount = getFamilyDiscount(familyPlanPrice, familyPlanName, false);
    const discountedPrice = familyPlanPrice - discount;

    // Legg til i oversikten
    plansDetails += `<p>Familieabonnement ${
      i + 1
    }: ${familyPlanName} - ${discountedPrice.toFixed(2)} kr</p>`;

    // Legg til rabattinformasjon
    if (discount > 0) {
      discountDetails += `<p>${familyPlanName}: Rabatt på ${discount} kr</p>`;
    } else {
      discountDetails += `<p>${familyPlanName}: Ingen rabatt</p>`;
    }

    // Ekstra rabatt
    const extraDiscountSelect = familyPlanDiv.querySelector(
      ".family-extra-discount"
    );
    const extraDiscountPercentage = parseFloat(extraDiscountSelect.value) || 0;
    if (extraDiscountPercentage > 0) {
      discountDetails += `<p>${familyPlanName}: Ekstra rabatt ${extraDiscountPercentage}%</p>`;
    }
  }

  // Oppdater 'Valgt Abonnement'
  selectedPlanElement.innerHTML = plansDetails;

  // Oppdater 'Rabatt'
  discountDetailsElement.innerHTML = discountDetails;

  // ============== Hovedabonnementets SIM-valg ============
  const twinSimCountMain = parseInt(
    document.getElementById("singleTwinsimSelect").value
  );
  const dataSimCountMain = parseInt(
    document.getElementById("singleDatasimSelect").value
  );

  if (twinSimCountMain > 0) {
    const twinSimPriceMain = planName.includes("Telia X") ? 89 : 49;
    simDetails += `<p>Hovedabonnement - TvillingSIM: ${twinSimCountMain} x ${twinSimPriceMain} kr</p>`;
  }
  if (dataSimCountMain > 0) {
    const dataSimPriceMain = planName.includes("Telia X") ? 89 : 49;
    simDetails += `<p>Hovedabonnement - DataSIM: ${dataSimCountMain} x ${dataSimPriceMain} kr</p>`;
  }

  // ============== Familieabonnementenes SIM-valg ===========
  for (let i = 0; i < familyPlans.length; i++) {
    const familyPlanDiv = familyPlans[i];
    const twinSimCount =
      parseInt(familyPlanDiv.querySelector(".twinsim-select").value) || 0;
    const dataSimCount =
      parseInt(familyPlanDiv.querySelector(".datasim-select").value) || 0;
    const planSelect = familyPlanDiv.querySelector(".family-plan-select");
    const familyPlanNameFull =
      planSelect.options[planSelect.selectedIndex].text;
    const familyPlanName = familyPlanNameFull.split(" - ")[0];

    if (twinSimCount > 0) {
      const twinSimPrice = familyPlanName.includes("Telia X") ? 89 : 49;
      simDetails += `<p>${familyPlanName} - TvillingSIM: ${twinSimCount} x ${twinSimPrice} kr</p>`;
    }
    if (dataSimCount > 0) {
      const dataSimPrice = familyPlanName.includes("Telia X") ? 89 : 49;
      simDetails += `<p>${familyPlanName} - DataSIM: ${dataSimCount} x ${dataSimPrice} kr</p>`;
    }

    // Delbetaling for familie
    const devicePaymentInput = familyPlanDiv.querySelector(".device-payment");
    if (devicePaymentInput) {
      const devicePayment = parseFloat(devicePaymentInput.value) || 0;
      if (devicePayment > 0) {
        devicePaymentDetails += `<p>Svitsj/delbetaling: ${devicePayment.toFixed(
          2
        )} kr</p>`;
      }
    }
  }

  // Oppdater 'SIM-valg'
  simDetailsElement.innerHTML = simDetails || "<p>Ingen SIM-valg</p>";

  // Oppdater delbetaling i DOM (devicePaymentDetails)
  devicePaymentDiv.innerHTML =
    devicePaymentDetails || "<p>Ingen delbetaling/Svitsj valgt</p>";

  // ========== Tilleggstjenester =========
  const selectedAddons = document.querySelectorAll(".addon-icon.selected");
  let addonDetails = "";
  selectedAddons.forEach(function (addon) {
    const addonName = addon.alt;
    const addonPrice = parseFloat(addon.getAttribute("data-price"));
    addonDetails += `<p>${addonName} - ${addonPrice.toFixed(2)} kr</p>`;
  });
  addonDetailsElement.innerHTML =
    addonDetails || "<p>Ingen tilleggstjenester valgt</p>";
}

// Funksjon for å oppdatere SIM-prisen når brukeren endrer antall SIM-kort
function updateSimPrice(element) {
  // Finn det overordnede plan-elementet (kan være enkel kunde eller familieplan)
  const planDiv =
    element.closest(".family-plan") ||
    document.getElementById("singlePlanOptions");
  let planType = "";

  // Sjekk om det er en familieplan eller enkel kunde
  if (planDiv.querySelector(".family-plan-select")) {
    // Familieplan
    planType = planDiv.querySelector(
      ".family-plan-select option:checked"
    ).textContent;
  } else {
    // Enkel kunde
    const planSelect = document.getElementById("plan");
    planType = planSelect.options[planSelect.selectedIndex].text;
  }

  // Hent antall TvillingSIM og DataSIM
  const twinSimCount =
    parseInt(planDiv.querySelector(".twinsim-select").value) || 0;
  const dataSimCount =
    parseInt(planDiv.querySelector(".datasim-select").value) || 0;
  const klokkeSimCount =
    parseInt(planDiv.querySelector(".klokke-select")?.value) || 0;

  const simPrices = calculateSimPrice(
    planType,
    twinSimCount,
    dataSimCount,
    klokkeSimCount
  );
  const totalSimPrice =
    simPrices.twinSimPrice + simPrices.dataSimPrice + simPrices.klokkeSimPrice;

  const simPriceElement =
    planDiv.querySelector(".family-plan-price") ||
    document.getElementById("singleSimPrice");
  if (simPriceElement) {
    simPriceElement.textContent = `SIM-kort: ${totalSimPrice.toFixed(2)} kr`;
  }
}
//Funksjonen for totalpris
// Funksjonen for totalpris
function calculateTotalPrice() {
  let totalPrice = 0;

  // Hent hovedabonnementet
  const plan = document.getElementById("plan");
  if (!plan || plan.selectedIndex === -1) {
    console.warn("Abonnement er ikke lastet inn enda.");
    return;
  }

  const planNameFull = plan.options[plan.selectedIndex].text;
  const planName = planNameFull.split(" - ")[0];
  let planPrice = parseFloat(plan.value);

  // 🔹 Sjekk om det er Telia X Start og om rabatt er aktivert
  if (planName.includes("Telia X Start") && newCustomerDiscountApplied) {
    planPrice -= 50; // Trekk fra rabatten
  }

  // Hent rabattprosent for hovednummeret
  const discountSelect = document.getElementById("discount");
  const discountPercentage = parseFloat(discountSelect.value) || 0;

  // Beregn rabattert pris for hovedabonnement
  // Beregn rabattert pris for hovedabonnement
  let discountedMainPlanPrice = planPrice; // Start med planPrice som standard
  const mainDiscountAmount = (planPrice * discountPercentage) / 100;
  discountedMainPlanPrice -= mainDiscountAmount; // Trekk rabatten

  // ✅ Nå er discountedMainPlanPrice definert før bruk
  totalPrice += discountedMainPlanPrice;

  // **Håndter SIM-kostnader for hovedabonnementet via calculateSimPrice**
  const twinSimCountMain = parseInt(
    document.getElementById("singleTwinsimSelect").value
  );
  const dataSimCountMain = parseInt(
    document.getElementById("singleDatasimSelect").value
  );
  const klokkeSimCountMain =
    parseInt(document.getElementById("singleKlokkeSelect").value) || 0; // Henter klokke-SIM antall

  const {
    twinSimPrice: mainTwinSimPrice,
    dataSimPrice: mainDataSimPrice,
    klokkeSimPrice: mainKlokkeSimPrice,
  } = calculateSimPrice(
    planNameFull,
    twinSimCountMain,
    dataSimCountMain,
    klokkeSimCountMain
  );

  totalPrice += mainTwinSimPrice + mainDataSimPrice + mainKlokkeSimPrice; // Inkluderer klokke-SIM i totalen

  // Hent feltet for enkel kundes delbetaling (hvis det finnes)
  const singleDevicePaymentInput = document.getElementById(
    "singleDevicePayment"
  );
  let singleDevicePayment = 0;
  if (singleDevicePaymentInput) {
    singleDevicePayment = parseFloat(singleDevicePaymentInput.value) || 0;
  }
  totalPrice += singleDevicePayment;

  // **Familieabonnementer**
  const familyPlans = document.querySelectorAll(".family-plan");
  familyPlans.forEach(function (planDiv) {
    let planPrice = parseFloat(
      planDiv.querySelector(".family-plan-select").value
    );
    const planTextFull = planDiv.querySelector(
      ".family-plan-select option:checked"
    ).textContent;
    const planText = planTextFull.split(" - ")[0];

    // Familierabatt og evt. ekstra rabatt
    const discount = getFamilyDiscount(planPrice, planText, false);
    const discountedPlanPrice = planPrice - discount;

    const extraDiscountSelect = planDiv.querySelector(".family-extra-discount");
    const extraDiscountPercentage = parseFloat(extraDiscountSelect.value) || 0;
    const extraDiscountAmount =
      (discountedPlanPrice * extraDiscountPercentage) / 100;
    const finalPlanPrice = discountedPlanPrice - extraDiscountAmount;

    // **SIM-kostnader for familie**
    const twinSimCount =
      parseInt(planDiv.querySelector(".twinsim-select").value) || 0;
    const dataSimCount =
      parseInt(planDiv.querySelector(".datasim-select").value) || 0;
    const klokkeSimCount =
      parseInt(planDiv.querySelector(".klokke-select")?.value) || 0; // Henter klokke-SIM for familie

    const { twinSimPrice, dataSimPrice, klokkeSimPrice } = calculateSimPrice(
      planTextFull,
      twinSimCount,
      dataSimCount,
      klokkeSimCount
    );

    // Hent inn delbetalingsverdi
    const devicePaymentInput = planDiv.querySelector(".device-payment");
    const devicePayment = devicePaymentInput
      ? parseFloat(devicePaymentInput.value) || 0
      : 0;

    // Legg alt til totalen
    totalPrice +=
      finalPlanPrice +
      twinSimPrice +
      dataSimPrice +
      klokkeSimPrice +
      devicePayment; // Inkluderer klokke-SIM
  });

  // **Legg til prisene for alle valgte addons**
  const allSelectedAddons = document.querySelectorAll(".addon-icon.selected");
  let addonsSum = 0;
  allSelectedAddons.forEach(function (addon) {
    const addonPrice = parseFloat(addon.getAttribute("data-price")) || 0;
    addonsSum += addonPrice;
  });

  // Legg addonsSummen til totalPrice
  totalPrice += addonsSum;

  // Oppdater totalen i DOM
  document.getElementById("finalPrice").textContent =
    "Endelig pris: " + totalPrice.toFixed(2) + " kr";

  // Oppdater detaljvisningen
  updateResultDisplay();
}

/****************************************************
 * 1) GLOBALE VARIABLER ELLER KONSTANTER
 ****************************************************/
let teliaData = null;
// Her vil vi lagre innholdet fra prices.json (abonnementer, rabatter, simKort, tilleggsProdukter, etc.)

/****************************************************
 * 2) HENT JSON-FIL (prices.json)
 ****************************************************/
async function fetchTeliaData() {
  if (teliaData) return teliaData; // Hvis vi allerede har lastet data, bruk det
  try {
    const response = await fetch("/Telia-nettside/prices.json");
    // juster stien om nødvendig, eller bruk full URL fra GitHub Pages

    const data = await response.json();
    teliaData = data; // Lagre i global variabel
    return data;
  } catch (error) {
    console.error("Kunne ikke laste prices.json:", error);
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
    <div class="addons">
      <!-- Her kunne du OGSÅ generert addon <img> dynamisk om du vil -->
      <img src="/Telia-nettside/Bilder/maxlogo.webp" alt="Max" class="addon-icon" data-price="89" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/Storytel's_logo.png" alt="Storytel" class="addon-icon" data-price="199" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/via.png" alt="Viaplay" class="addon-icon" data-price="149" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/218706.png" alt="Telia Sky" class="addon-icon" data-price="69" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/trygg.webp" alt="Telia Trygg" class="addon-icon" data-price="109" onclick="toggleAddon(this)">
    </div>
    <button type="button" class="remove-family-plan" onclick="removeFamilyPlan(this)">Fjern</button>
  `;

  familyPlans.appendChild(newDiv);

  const familySelect = newDiv.querySelector(".family-plan-select");
  buildFamilyPlanOptions(familySelect);

  const discountSelect = newDiv.querySelector(".family-extra-discount");
  buildFamilyExtraDiscountSelect(discountSelect);
}

/****************************************************
 * 6) KJØR buildMainPlanOptions() VED OPPSTART
 ****************************************************/
// I stedet for dine gamle 'toggleCustomerType()' i global scope,
// gjør vi:
window.addEventListener("DOMContentLoaded", async () => {
  await buildMainPlanOptions(); // Fyll <select id="plan">
  toggleCustomerType(); // Vis/skjul riktig seksjon
});

// Funksjon for å vise/skjule elementer basert på kundetypefunction toggleCustomerType() {
function toggleCustomerType() {
  const singlePlanOptions = document.getElementById("singlePlanOptions");
  const familySection = document.getElementById("familySection");

  if (document.getElementById("single").checked) {
    console.log("Enkel kunde er valgt.");
    singlePlanOptions.style.display = "block"; // Vis enkel kunde-seksjon
    familySection.style.display = "none"; // Skjul familie-seksjon
  } else if (document.getElementById("family").checked) {
    console.log("Familie er valgt.");
    singlePlanOptions.style.display = "none"; // Skjul enkel kunde-seksjon
    familySection.style.display = "block"; // Vis familie-seksjon
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
  const familyDiscountRates = {
    teliaX: 100, // 100 kr rabatt for Telia X-abonnement
    teliaMobile: 30, // 30 kr rabatt for Telia Junior, 5GB og 10GB
  };

  if (isMainNumber) {
    // Ingen rabatt for hovednummeret
    return 0;
  }

  if (planText.includes("Telia X Start")) {
    return familyDiscountRates.teliaX;
  }

  if (
    planText.includes("Telia X") &&
    !planText.includes("Telia X Ung") &&
    planValue >= 399
  ) {
    return familyDiscountRates.teliaX;
  }

  if (
    planText.includes("5GB") ||
    planText.includes("10GB") ||
    planText.includes("Junior")
  ) {
    return familyDiscountRates.teliaMobile;
  }

  return 0; // Ingen rabatt hvis ingen betingelser er oppfylt
}

// Funksjon for å beregne prisen på TvillingSIM og DataSIM

function calculateSimPrice(planType, twinSimCount, dataSimCount) {
  let twinSimPrice = 0;
  let dataSimPrice = 0;
  const totalSimCount = twinSimCount + dataSimCount;
  const simPricePerUnit = 89; // Pris for Telia X (Max, Max Pluss etc.) eller 49 for vanlige

  if (planType.includes("Max Pluss")) {
    // Telia X Max Pluss har 2 gratis SIM-kort
    const freeSimCards = 2;
    let chargeable = totalSimCount - freeSimCards;

    // Hvis totalSimCount <= 2 er alt gratis
    if (chargeable <= 0) {
      twinSimPrice = 0;
      dataSimPrice = 0;
    } else {
      // chargeable > 0 betyr at vi har f.eks. 3 eller flere SIM-kort
      // Vi må fordele "chargeable" antall på tvilling vs data for å få riktig linjepris
      // Eksempel: 3 TvillingSIM => 2 gratis, 1 betalt
      // Eksempel: 1 Tvilling + 2 Data => 3 totalt => 1 betalt osv.

      // Hvor mange av TvillingSIM er "gratis"?
      // Om brukeren har f.eks. twinSimCount = 3, dataSimCount = 0 => 3 total
      // De to første TvillingSIM er gratis, den tredje er betalt
      // => leftoverTwinSim = 1 => twinSimPrice = 1 * 89

      // Om brukeren har 1 Tvilling og 2 Data => 3 total => 1 betalt
      // Vi “bruker opp” gratis-SIM først på TvillingSIM og evt. DataSIM:

      // Trekker fra tvillingSIM først
      let leftoverTwinSim = Math.min(twinSimCount, freeSimCards);
      let leftoverFreeSlots = freeSimCards - leftoverTwinSim;

      // Bruker eventuelle resterende gratis-slots på dataSIM
      let leftoverDataSim = Math.min(dataSimCount, leftoverFreeSlots);

      // Nå har vi brukt opp 'leftoverTwinSim + leftoverDataSim' gratis SIM.
      // Resten av TvillingSIM/dataSIM belastes.
      const chargeableTwinSim = twinSimCount - leftoverTwinSim;
      const chargeableDataSim = dataSimCount - leftoverDataSim;

      twinSimPrice = chargeableTwinSim * simPricePerUnit;
      dataSimPrice = chargeableDataSim * simPricePerUnit;
    }
  } else if (planType.includes("Telia X")) {
    // Telia X (uten Max Pluss) tar 89 kr pr. SIM fra første kort
    twinSimPrice = twinSimCount * 89;
    dataSimPrice = dataSimCount * 89;
  } else {
    // For alle andre abonnement (f.eks. Telia Mobil 5GB/10GB osv.) er prisen 49 kr pr. SIM
    twinSimPrice = twinSimCount * 49;
    dataSimPrice = dataSimCount * 49;
  }

  return { twinSimPrice, dataSimPrice };
}

// Funksjon for å vise detaljert resultat
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
  const planNameFull = plan.options[plan.selectedIndex].text;
  const selectedPlanPrice = parseFloat(plan.value);

  // Ekstraher kun abonnementsnavnet uten pris
  const planName = planNameFull.split(" - ")[0];

  // Hent den valgte rabattprosenten for hovednummeret
  const discountSelect = document.getElementById("discount");
  if (!discountSelect) {
    console.error("Elementet med ID 'discount' ble ikke funnet.");
    return;
  }
  const discountValue = discountSelect.value || "0";
  const discountPercentage = parseFloat(discountValue) || 0;

  // Beregn rabattbeløpet for hovedabonnementet
  const mainDiscountAmount = (selectedPlanPrice * discountPercentage) / 100;
  const discountedMainPlanPrice = selectedPlanPrice - mainDiscountAmount;

  // Oppdater oversikt for hovedabonnement
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

  // Beregn SIM-prisen
  const simPrices = calculateSimPrice(planType, twinSimCount, dataSimCount);
  const totalSimPrice = simPrices.twinSimPrice + simPrices.dataSimPrice;

  // Oppdater visningen av SIM-prisen
  const simPriceElement = planDiv.querySelector(".family-plan-price");
  if (simPriceElement) {
    simPriceElement.textContent = `SIM-kort: ${totalSimPrice.toFixed(2)} kr`;
  }
}
//Funksjonen for totalpris
function calculateTotalPrice() {
  let totalPrice = 0;

  // Hent hovedabonnementet
  const plan = document.getElementById("plan");
  const planNameFull = plan.options[plan.selectedIndex].text;
  const planName = planNameFull.split(" - ")[0];
  let planPrice = parseFloat(plan.value);

  // Hent rabattprosent for hovednummeret
  const discountSelect = document.getElementById("discount");
  const discountPercentage = parseFloat(discountSelect.value) || 0;

  // Beregn rabattert pris for hovedabonnement
  const mainDiscountAmount = (planPrice * discountPercentage) / 100;
  const discountedMainPlanPrice = planPrice - mainDiscountAmount;
  totalPrice += discountedMainPlanPrice;

  // **Håndter SIM-kostnader for hovedabonnementet via calculateSimPrice**
  const twinSimCountMain = parseInt(
    document.getElementById("singleTwinsimSelect").value
  );
  const dataSimCountMain = parseInt(
    document.getElementById("singleDatasimSelect").value
  );

  const { twinSimPrice: mainTwinSimPrice, dataSimPrice: mainDataSimPrice } =
    calculateSimPrice(planNameFull, twinSimCountMain, dataSimCountMain);

  totalPrice += mainTwinSimPrice + mainDataSimPrice;

  // Hent feltet for enkel kundes delbetaling (hvis det finnes)
  const singleDevicePaymentInput = document.getElementById(
    "singleDevicePayment"
  );
  let singleDevicePayment = 0;
  if (singleDevicePaymentInput) {
    singleDevicePayment = parseFloat(singleDevicePaymentInput.value) || 0;
  }
  totalPrice += singleDevicePayment;
  // Nå kan du sjekke verdien

  // **Familieabonnementer*
  const familyPlans = document.querySelectorAll(".family-plan");
  familyPlans.forEach(function (planDiv) {
    // 1) Finn pris, tekst, rabatt osv.
    let planPrice = parseFloat(
      planDiv.querySelector(".family-plan-select").value
    );
    const planTextFull = planDiv.querySelector(
      ".family-plan-select option:checked"
    ).textContent;
    const planText = planTextFull.split(" - ")[0];

    // 2) Familierabatt og evt. ekstra rabatt
    const discount = getFamilyDiscount(planPrice, planText, false);
    const discountedPlanPrice = planPrice - discount;

    const extraDiscountSelect = planDiv.querySelector(".family-extra-discount");
    const extraDiscountPercentage = parseFloat(extraDiscountSelect.value) || 0;
    const extraDiscountAmount =
      (discountedPlanPrice * extraDiscountPercentage) / 100;
    const finalPlanPrice = discountedPlanPrice - extraDiscountAmount;

    // 3) SIM-kostnader
    const twinSimCount =
      parseInt(planDiv.querySelector(".twinsim-select").value) || 0;
    const dataSimCount =
      parseInt(planDiv.querySelector(".datasim-select").value) || 0;
    const { twinSimPrice, dataSimPrice } = calculateSimPrice(
      planTextFull,
      twinSimCount,
      dataSimCount
    );

    // 4) Hent inn delbetalingsverdi
    const devicePaymentInput = planDiv.querySelector(".device-payment");
    const devicePayment = devicePaymentInput
      ? parseFloat(devicePaymentInput.value) || 0
      : 0;

    // 5) Legg alt til totalen
    totalPrice += finalPlanPrice + twinSimPrice + dataSimPrice + devicePayment;
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

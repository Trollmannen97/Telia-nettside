// Funksjon for å vise/skjule elementer basert på kundetypefunction toggleCustomerType() {
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
// Kjør funksjonen for å sette initial visning
toggleCustomerType();


  if (singleRadio.checked) {
    // Enkel kunde er valgt
    setDisplay(familySection, "none");
    setDisplay(familyDiscountSection, "none");
    setDisplay(singlePlanOptions, "block");
    setDisplay(singleSimOptions, "flex");
    setDisplay(familySimOptions, "none");
    setDisplay(addonsSection, "block");
  } else {
    // Familie er valgt
    setDisplay(familySection, "block");
    setDisplay(familyDiscountSection, "block");
    setDisplay(singlePlanOptions, "none");
    setDisplay(singleSimOptions, "none");
    setDisplay(familySimOptions, "flex");
    setDisplay(addonsSection, "none");
  }
}

// Funksjon for å legge til et nytt familieabonnement
function addFamilyPlan() {
  const familyPlans = document.getElementById("familyPlans");

  // Opprette en ny div for familieabonnement med tilleggstjenester
  const newDiv = document.createElement("div");
  newDiv.classList.add("family-plan");

  // Bruk malstreng for bedre lesbarhet
  newDiv.innerHTML = `
    <select class="family-plan-select">
      <option value="129">Telia Junior 1GB - 129kr</option>
      <option value="179">Telia Junior 5GB - 179kr</option>
      <option value="329">Telia 5GB - 329 kr</option>
      <option value="379">Telia 10GB - 379 kr</option>
      <option value="329">Telia 10GB Ung - 329 kr</option>
      <option value="429">Telia X Start - 429 kr</option>
      <option value="399">Telia X Ung - 399 kr</option>
      <option value="499">Telia X Basic - 499 kr</option>
      <option value="599">Telia X Max - 599 kr</option>
      <option value="699">Telia X Max Pluss - 699 kr</option>
      <option value="1099">Telia X + Viaplay Total - 1099 kr</option>
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
    <div class="addons">
      <img src="/Telia-nettside/Bilder/maxlogo.webp" alt="Max" class="addon-icon" data-price="89" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/Storytel's_logo.png" alt="Storytel" class="addon-icon" data-price="199" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/via.png" alt="Viaplay" class="addon-icon" data-price="149" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/218706.png" alt="Telia Sky" class="addon-icon" data-price="69" onclick="toggleAddon(this)">
      <img src="/Telia-nettside/Bilder/trygg.webp" alt="Telia Trygg" class="addon-icon" data-price="109" onclick="toggleAddon(this)">
    </div>
    <button type="button" class="remove-family-plan" onclick="removeFamilyPlan(this)">Fjern</button>
  `;

  familyPlans.appendChild(newDiv);
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
  let simPricePerUnit = 49; // Standardpris

  if (planType.includes("Max Pluss")) {
    const freeSimCards = 2;
    const chargeableSimCount = Math.max(0, totalSimCount - freeSimCards);
    simPricePerUnit = 89;
    twinSimPrice = chargeableSimCount * simPricePerUnit;
    dataSimPrice = chargeableSimCount * simPricePerUnit;
  } else if (planType.includes("Telia X")) {
    simPricePerUnit = 89;
    twinSimPrice = twinSimCount * simPricePerUnit;
    dataSimPrice = dataSimCount * simPricePerUnit;
  } else {
    // For andre abonnementer beholder vi standardprisen på 49
    twinSimPrice = twinSimCount * simPricePerUnit;
    dataSimPrice = dataSimCount * simPricePerUnit;
  }

  return { twinSimPrice, dataSimPrice };
}

// Funksjon for å vise detaljert resultat
function updateResultDisplay() {
  // Hent HTML-elementene for å vise valgt informasjon
  const selectedPlanElement = document.getElementById("selectedPlan");
  const discountDetailsElement = document.getElementById("discountDetails");
  const simDetailsElement = document.getElementById("simDetails");
  const addonDetailsElement = document.getElementById("addonDetails");

  // Sjekk om elementene eksisterer
  if (
    !selectedPlanElement ||
    !discountDetailsElement ||
    !simDetailsElement ||
    !addonDetailsElement
  ) {
    console.error("Ett eller flere nødvendige HTML-elementer ble ikke funnet.");
    return;
  }

  // Tøm innholdet i elementene for å starte på nytt
  selectedPlanElement.innerHTML = "";
  discountDetailsElement.innerHTML = "";
  simDetailsElement.innerHTML = "";
  addonDetailsElement.innerHTML = "";

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

  // Debugging
  console.log("Discount select element:", discountSelect);
  console.log("Discount value:", discountValue);
  console.log(
    "discountPercentage:",
    discountPercentage,
    "Type:",
    typeof discountPercentage
  );

  // **Beregn rabattbeløpet for hovedabonnementet**
  const mainDiscountAmount = (selectedPlanPrice * discountPercentage) / 100;
  const discountedMainPlanPrice = selectedPlanPrice - mainDiscountAmount;

  // **Vis hovedabonnementet med rabattert pris**
  let plansDetails = `<p>Hovedabonnement: ${planName} - ${discountedMainPlanPrice.toFixed(
    2
  )} kr</p>`;

  // **Vis rabattinformasjon for hovedabonnementet**
  let discountDetails = "";

  if (Number(discountPercentage) > 0) {
    discountDetails += `<p>Hovedabonnement: ${discountPercentage}% rabatt (${mainDiscountAmount.toFixed(
      2
    )} kr trukket fra)</p>`;
  } else {
    discountDetails += `<p>Hovedabonnement: Ingen rabatt</p>`;
  }

  // **Legg til familieabonnementene**
  const familyPlans = document.getElementsByClassName("family-plan");
  for (let i = 0; i < familyPlans.length; i++) {
    const familyPlanDiv = familyPlans[i];
    const planSelect = familyPlanDiv.querySelector(".family-plan-select");
    const familyPlanNameFull =
      planSelect.options[planSelect.selectedIndex].text;
    const familyPlanPrice = parseFloat(planSelect.value);

    // Ekstraher kun abonnementsnavnet uten pris
    const familyPlanName = familyPlanNameFull.split(" - ")[0];

    // Beregn rabatt for familieabonnementet
    const discount = getFamilyDiscount(familyPlanPrice, familyPlanName, false);
    const discountedPrice = familyPlanPrice - discount;

    // Legg til familieabonnementet til 'plansDetails'
    plansDetails += `<p>Familieabonnement ${
      i + 1
    }: ${familyPlanName} - ${discountedPrice.toFixed(2)} kr</p>`;

    // Legg til rabattinformasjon for familieabonnementet
    if (discount > 0) {
      discountDetails += `<p>${familyPlanName}: Rabatt på ${discount} kr</p>`;
    } else {
      discountDetails += `<p>${familyPlanName}: Ingen rabatt</p>`;
    }
  }

  // **Oppdater 'Valgt Abonnement' med alle abonnementer**
  selectedPlanElement.innerHTML = plansDetails;

  // **Oppdater 'Rabatt' med rabattinformasjon**
  discountDetailsElement.innerHTML = discountDetails;

  // **Vis SIM-valg**
  let simDetails = "";

  // **Hovedabonnementets SIM-valg**
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

  // **Familieabonnementenes SIM-valg**
  for (let i = 0; i < familyPlans.length; i++) {
    const familyPlanDiv = familyPlans[i];
    const twinSimCount = parseInt(
      familyPlanDiv.querySelector(".twinsim-select").value
    );
    const dataSimCount = parseInt(
      familyPlanDiv.querySelector(".datasim-select").value
    );

    // Hent planens navn for hver familieplan
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
  }

  // **Oppdater 'SIM-valg' med SIM-detaljer**
  simDetailsElement.innerHTML = simDetails || "<p>Ingen SIM-valg</p>";

  // **Vis tilleggstjenester**
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

// Funksjon for å beregne totalprisen i kalkulatoren.
function calculateTotalPrice() {
  let totalPrice = 0;

  // Hent hovedabonnementet
  const plan = document.getElementById("plan");
  const planNameFull = plan.options[plan.selectedIndex].text;
  const selectedPlanPrice = parseFloat(plan.value);

  // Ekstraher kun abonnementsnavnet uten pris
  const planName = planNameFull.split(" - ")[0];
  let planPrice = selectedPlanPrice;

  // Hent den valgte rabattprosenten for hovednummeret
  const discountSelect = document.getElementById("discount");
  const discountPercentage = parseFloat(discountSelect.value) || 0;

  // Beregn rabattbeløpet for hovedabonnementet
  const mainDiscountAmount = (planPrice * discountPercentage) / 100;
  const discountedMainPlanPrice = planPrice - mainDiscountAmount;

  // Legg til hovedabonnementets pris til totalprisen
  totalPrice += discountedMainPlanPrice;

  // Håndter SIM-kostnader for hovedabonnementet
  const twinSimCountMain = parseInt(
    document.getElementById("singleTwinsimSelect").value
  );
  const dataSimCountMain = parseInt(
    document.getElementById("singleDatasimSelect").value
  );

  // Beregn SIM-priser for hovedabonnementet
  let simPriceMain = 0;
  let simPricePerUnitMain = planName.includes("Telia X") ? 89 : 49;
  simPriceMain += twinSimCountMain * simPricePerUnitMain;
  simPriceMain += dataSimCountMain * simPricePerUnitMain;

  // Legg til SIM-kostnader til totalpris
  totalPrice += simPriceMain;

  // Håndter familieabonnementer
  const familyPlans = document.querySelectorAll(".family-plan");
  familyPlans.forEach(function (plan) {
    let planPrice = parseFloat(plan.querySelector(".family-plan-select").value);
    const planTextFull = plan.querySelector(
      ".family-plan-select option:checked"
    ).textContent;
    const planText = planTextFull.split(" - ")[0];

    // Beregn rabatt for familieabonnementet
    const discount = getFamilyDiscount(planPrice, planText, false);
    let discountedPlanPrice = planPrice - discount;

    // Logg rabattberegning
    console.log(
      `Plan: ${planText}, Original pris: ${planPrice}, Rabatt: ${discount}, Pris etter rabatt: ${discountedPlanPrice}`
    );

    // Hent SIM-kostnadene for familieabonnementet
    const twinSimCount = parseInt(plan.querySelector(".twinsim-select").value);
    const dataSimCount = parseInt(plan.querySelector(".datasim-select").value);

    // Beregn SIM-priser for familieabonnementet
    let simPrice = 0;
    let simPricePerUnit = planText.includes("Telia X") ? 89 : 49;
    simPrice += twinSimCount * simPricePerUnit;
    simPrice += dataSimCount * simPricePerUnit;

    // Legg til planpris og SIM-kostnader til totalpris
    totalPrice += discountedPlanPrice + simPrice;

    // Logg totalpris etter hvert abonnement
    console.log(`Totalpris etter ${planText}: ${totalPrice}`);
  });

  // Oppdater totalprisen i DOM
  document.getElementById("finalPrice").textContent =
    "Endelig pris: " + totalPrice.toFixed(2) + " kr";

  // Logg sluttresultatet
  console.log("Endelig totalpris:", totalPrice);

  // Oppdater resultatvisningen
  updateResultDisplay();
}

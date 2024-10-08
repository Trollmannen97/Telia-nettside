// Funksjon for å vise/skjule familiefelt basert på kundetype
function toggleCustomerType() {
  var familySection = document.getElementById("familySection");
  var singleRadio = document.getElementById("single");
  if (singleRadio.checked) {
    familySection.style.display = "none";
  } else {
    familySection.style.display = "block";
  }
}

// Funksjon for å vise/skjule familiefelt og familierabatt basert på kundetype
function toggleCustomerType() {
  var familySection = document.getElementById("familySection");
  var familyDiscountSection = document.querySelector(
    ".form-group.family-discount"
  ); // Legger til en klasse for familierabatt
  var singleRadio = document.getElementById("single");
  if (singleRadio.checked) {
    familySection.style.display = "none";
    familyDiscountSection.style.display = "none"; // Skjul familierabatten når enkel kunde er valgt
  } else {
    familySection.style.display = "block";
    familyDiscountSection.style.display = "block"; // Vis familierabatten når familie er valgt
  }
}

// Funksjon for å legge til et nytt familieabonnement
function addFamilyPlan() {
  var familyPlans = document.getElementById("familyPlans");

  // Opprette en ny div for familieabonnement med tilleggstjenester
  var newDiv = document.createElement("div");
  newDiv.classList.add("family-plan");
  newDiv.innerHTML = `
      <select class="family-plan-select">
          <option value="129">Telia Junior 1GB - 129kr</option>
          <option value="179">Telia Junior 3GB - 179kr</option>
          <option value="299">Telia 5GB - 299 kr</option>
          <option value="349">Telia 10GB - 349 kr</option>
          <option value="399">Telia X Start - 399 kr</option>
          <option value="399">Telia X Ung - 399 kr</option>
          <option value="479">Telia X Basic - 479 kr</option>
          <option value="579">Telia X Max - 579 kr</option>
          <option value="679">Telia X Max Pluss - 679 kr</option>
          <option value="1099">Telia X + Viaplay Total - 1099 kr</option>
      </select>
    <!-- Ny seksjon for TvillingSIM og DataSIM -->
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
         <!-- Denne er viktig, familie-plan-price må være med -->
        <span class="family-plan-price">SIM-kort: 0.00 kr</span>
    </div>
      
      <div class="addons">
          <img src="/Telia-nettside/Bilder/mx3.webp" alt="Max" class="addon-icon" data-price="89" onclick="toggleAddon(this)">
          <img src="/Telia-nettside//Bilder/Storytel's_logo.png" alt="Storytel" class="addon-icon" data-price="199" onclick="toggleAddon(this)">
          <img src="/Telia-nettside//Bilder/via.png" alt="Viaplay" class="addon-icon" data-price="149" onclick="toggleAddon(this)">
          <img src="/Telia-nettside//Bilder/218706.png" alt="Telia Sky" class="addon-icon" data-price="69" onclick="toggleAddon(this)">
          <img src="/Telia-nettside//Bilder/trygg.webp" alt="Telia Trygg" class="addon-icon" data-price="69" onclick="toggleAddon(this)">
      </div>
      <button type="button" class="remove-family-plan" onclick="removeFamilyPlan(this)">Fjern</button>
  `;
  familyPlans.appendChild(newDiv);
}

// Funksjon for å håndtere tilleggstjenester
function toggleAddon(element) {
  // Hent prisen fra data-attributten
  var addonPrice = parseFloat(element.getAttribute("data-price"));

  // Hvis ikonet allerede er valgt (class="selected"), fjern prisen
  if (element.classList.contains("selected")) {
    element.classList.remove("selected");
    updateTotalPrice(-addonPrice); // Fjern prisen fra totalsummen
  } else {
    element.classList.add("selected");
    updateTotalPrice(addonPrice); // Legg til prisen i totalsummen
  }
}

// Oppdaterer totalprisen
function updateTotalPrice(amount) {
  var totalDisplay = document.getElementById("finalPrice"); // Elementet som viser totalprisen
  var currentTotal = parseFloat(
    totalDisplay.innerText.replace("Endelig pris: ", "").replace(" kr", "")
  );
  var newTotal = currentTotal + amount;

  // Oppdater totalprisen
  totalDisplay.innerText = "Endelig pris: " + newTotal.toFixed(2) + " kr";
}

// Funksjon for å fjerne et familieabonnement
function removeFamilyPlan(element) {
  var familyPlans = document.getElementById("familyPlans");
  familyPlans.removeChild(element.parentElement);
}

// Funksjon for å hente familierabatten basert på valgt plan
function getFamilyDiscount(planValue, planText, isMainNumber) {
  const familyDiscountRates = {
    teliaX: 100, // 100 kr rabatt for Telia X-abonnement
    teliaMobile: 30, // 30 kr rabatt for Telia Junior, 5GB og 10GB
  };

  // Telia X-abonnementer (planValue >= 399) gir 100 kr rabatt, men IKKE for Telia X Ung eller hovednummeret
  if (planValue >= 399 && !isMainNumber && !planText.includes("Telia X Ung")) {
    return familyDiscountRates.teliaX;
  }
  // Telia 5GB og 10GB, samt Junior-abonnementer gir 30 kr rabatt
  else if (planValue >= 129 && planValue <= 359 && !isMainNumber) {
    return familyDiscountRates.teliaMobile;
  }
  return 0; // Ingen rabatt for hovednummer eller hvis rabatt ikke gjelder
}

// Funksjon for å beregne prisen
function calculatePrice() {
  var plan = document.getElementById("plan");
  var discount = document.getElementById("discount");
  var familyDiscount = document.getElementById("familyDiscount"); // Rabatt for familien
  var singleRadio = document.getElementById("single");
  var resultDisplay = document.getElementById("priceDetails"); // Element for å vise detaljerte priser
  var totalDisplay = document.getElementById("finalPrice"); // Element for å vise sluttresultatet

  if (!plan || !discount || !singleRadio) {
    console.error("Ett eller flere elementer ble ikke funnet i DOM-en.");
    return;
  }

  var selectedPlan = parseFloat(plan.value);
  var selectedDiscount = parseFloat(discount.value); // Rabatt for hovednummeret
  var selectedFamilyDiscount = parseFloat(familyDiscount.value); // Rabatt for familien
  var isFamily = !singleRadio.checked;

  var finalPrice = selectedPlan;

  // Beregn rabatt for hovednummeret
  if (selectedDiscount > 0) {
    finalPrice -= selectedPlan * (selectedDiscount / 100);
  }

  // Start med hovednummeret i resultatlisten
  var detailedResult = `<p>Hovednummer 1: ${
    plan.options[plan.selectedIndex].text.split("-")[0]
  } - ${finalPrice.toFixed(2)} kr</p>`;

  // Håndter familierabatt hvis familie er valgt
  if (isFamily) {
    var familyPlans = document.getElementsByClassName("family-plan-select");
    var familyTotal = finalPrice; // Start med hovednummerets pris

    // Beregne rabatter for alle familiemedlemmer
    for (var i = 0; i < familyPlans.length; i++) {
      var familyPlanValue = parseFloat(familyPlans[i].value);
      var familyPlanText =
        familyPlans[i].options[familyPlans[i].selectedIndex].text; // Henter abonnementsnavnet
      var familyDiscountAmount = getFamilyDiscount(
        familyPlanValue,
        familyPlanText,
        false
      ); // Send også planText

      // Prisen for ekstra nummer etter familierabatt
      var discountedFamilyPrice = familyPlanValue - familyDiscountAmount;

      // Hvis abonnementsplanen er Telia X eller Telia 5GB/10GB, legg til familierabattprosent
      if (
        !familyPlanText.includes("Telia x Start") && // Sjekk at det ikke er Telia x Start
        !familyPlanText.includes("Telia X Ung") && // Legg til sjekk for Telia X Ung
        (familyPlanValue >= 399 ||
          (familyPlanValue >= 299 && familyPlanValue <= 359))
      ) {
        if (selectedFamilyDiscount > 0) {
          discountedFamilyPrice -=
            discountedFamilyPrice * (selectedFamilyDiscount / 100);
        }
      }

      // Hent kostnader for TvillingSIM og DataSIM
      var familyPlanDiv = familyPlans[i].closest(".family-plan");
      var twinSimCount = parseInt(
        familyPlanDiv.querySelector(".twinsim-select").value
      );
      var dataSimCount = parseInt(
        familyPlanDiv.querySelector(".datasim-select").value
      );
      var twinSimPrice = twinSimCount * 49; // TvillingSIM koster 49 kr per SIM for vanlige abonnement
      var dataSimPrice = dataSimCount * 49; // DataSIM koster 49 kr per SIM for vanlige abonnement

      // Hvis Telia X, endre prisen
      if (familyPlanText.includes("Telia X")) {
        twinSimPrice = twinSimCount * 89; // TvillingSIM koster 89 kr for Telia X
        dataSimPrice = dataSimCount * 89; // DataSIM koster 89 kr for Telia X
      }

      // Hvis Telia X Max Pluss, gir 2 gratis SIM-kort
      if (familyPlanText.includes("Max Pluss")) {
        var totalSimCount = twinSimCount + dataSimCount;
        var chargeableSimCount = Math.max(0, totalSimCount - 2); // Gratis for de første to
        twinSimPrice = chargeableSimCount * 89;
        dataSimPrice = chargeableSimCount > 0 ? chargeableSimCount * 89 : 0; // Gratis om ingen ekstra SIM
      }

      // Legg til SIM-prisene til familiemedlemmet
      var simPriceDetails = "";
      if (twinSimCount > 0) {
        simPriceDetails += ` + TvillingSIM - ${twinSimPrice} kr`;
      }
      if (dataSimCount > 0) {
        simPriceDetails += ` + DataSIM - ${dataSimPrice} kr`;
      }

      familyTotal += discountedFamilyPrice + twinSimPrice + dataSimPrice;

      // Legg til familiemedlemmets plan i resultatlisten
      detailedResult += `<p>Nummer ${i + 2}: ${
        familyPlans[i].options[familyPlans[i].selectedIndex].text.split("-")[0]
      } - ${discountedFamilyPrice.toFixed(2)} kr${simPriceDetails}</p>`;
    }

    finalPrice = familyTotal; // Oppdater totalpris med familieabonnementer
  }

  // Oppdater resultatvisningen med detaljerte priser
  resultDisplay.innerHTML = detailedResult;

  // Oppdater endelig pris
  totalDisplay.innerText = "Endelig pris: " + finalPrice.toFixed(2) + " kr";
}

// Hent kostnader for TvillingSIM og DataSIM
var familyPlanDiv = familyPlans[i].closest(".family-plan");
var twinSimCount = parseInt(
  familyPlanDiv.querySelector(".twinsim-select").value
);
var dataSimCount = parseInt(
  familyPlanDiv.querySelector(".datasim-select").value
);

var twinSimPrice = twinSimCount * 49; // TvillingSIM koster 49 kr per SIM for vanlige abonnement
var dataSimPrice = dataSimCount * 49; // DataSIM koster 49 kr per SIM for vanlige abonnement

// Hvis Telia X, endre prisen for både TvillingSIM og DataSIM
if (familyPlanText.includes("Telia X")) {
  twinSimPrice = twinSimCount * 89; // TvillingSIM koster 89 kr for Telia X
  dataSimPrice = dataSimCount * 89; // DataSIM koster også 89 kr for Telia X
}

// Hvis Telia X Max Pluss, gir 2 gratis SIM-kort
if (familyPlanText.includes("Max Pluss")) {
  var totalSimCount = twinSimCount + dataSimCount;
  var chargeableSimCount = Math.max(0, totalSimCount - 2); // Gratis for de første to SIM-kortene
  twinSimPrice = chargeableSimCount * 89;
  dataSimPrice = chargeableSimCount > 0 ? chargeableSimCount * 89 : 0; // Gratis om ingen ekstra SIM
}

// Legg til SIM-prisene til familiemedlemmet
var simPriceDetails = "";
if (twinSimCount > 0) {
  simPriceDetails += ` + TvillingSIM - ${twinSimPrice} kr`;
}
if (dataSimCount > 0) {
  simPriceDetails += ` + DataSIM - ${dataSimPrice} kr`;
}

familyTotal += discountedFamilyPrice + twinSimPrice + dataSimPrice;

// Legg til familiemedlemmets plan i resultatlisten
detailedResult += `<p>Nummer ${i + 2}: ${
  familyPlans[i].options[familyPlans[i].selectedIndex].text.split("-")[0]
} - ${discountedFamilyPrice.toFixed(2)} kr${simPriceDetails}</p>`;

{
  // Oppdater resultatvisningen med detaljerte priser
  resultDisplay.innerHTML = detailedResult;

  // Oppdater endelig pris
  totalDisplay.innerText = "Endelig pris: " + finalPrice.toFixed(2) + " kr";
}

// Funksjon for å oppdatere prisen basert på valg av TvillingSIM og DataSIM
function updateSimPrice(selectElement) {
  var familyPlanDiv = selectElement.closest(".family-plan");
  var selectedPlan = parseFloat(
    familyPlanDiv.querySelector(".family-plan-select").value
  );
  var planType = familyPlanDiv.querySelector(
    ".family-plan-select option:checked"
  ).textContent;

  var twinSimSelect = familyPlanDiv.querySelector(".twinsim-select");
  var dataSimSelect = familyPlanDiv.querySelector(".datasim-select");

  var twinSimCount = parseInt(twinSimSelect.value);
  var dataSimCount = parseInt(dataSimSelect.value);

  var twinSimPrice = 0;
  var dataSimPrice = 0;

  // Sjekk om abonnementet er Telia X Max Pluss, som gir 2 gratis SIM-kort
  if (planType.includes("Max Pluss")) {
    var totalSimCount = twinSimCount + dataSimCount;
    var chargeableSimCount = Math.max(0, totalSimCount - 2); // Gratis for de første to
    twinSimPrice = chargeableSimCount * 89; // Pris per ekstra TvillingSIM for Telia X Max Pluss
    dataSimPrice = 0; // Ingen tillegg for DataSIM med Telia X Max Pluss
  } else if (planType.includes("Telia X")) {
    twinSimPrice = twinSimCount * 89; // 89 NOK per TvillingSIM
    dataSimPrice = dataSimCount * 89; // 89 NOK per DataSIM
  } else {
    // Pris for Telia Mobil og andre abonnementer
    twinSimPrice = twinSimCount * 49; // 49 NOK per TvillingSIM
    dataSimPrice = dataSimCount * 49; // 49 NOK per DataSIM
  }

  var totalSimPrice = twinSimPrice + dataSimPrice;

  // Oppdater familieplanens totale pris for TvillingSIM og DataSIM
  familyPlanDiv.querySelector(".family-plan-price").textContent =
    "SIM-kort: " + totalSimPrice.toFixed(2) + " kr";

  // Oppdater totalprisen i kalkulatoren
  calculatePrice();
}

// Funksjon for å beregne totalprisen i kalkulatoren
function calculateTotalPrice() {
  var familyPlans = document.querySelectorAll(".family-plan");
  var totalPrice = 0;

  familyPlans.forEach(function (plan) {
    var planPrice = parseFloat(plan.querySelector(".family-plan-select").value);
    var simPrice =
      parseFloat(
        plan
          .querySelector(".family-plan-price")
          .textContent.replace("SIM-kort: ", "")
          .replace(" kr", "")
      ) || 0;
    totalPrice += planPrice + simPrice;
  });

  document.getElementById("finalPrice").textContent =
    "Endelig pris: " + totalPrice.toFixed(2) + " kr";
}

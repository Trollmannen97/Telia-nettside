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
          <option value="329">Telia 5GB - 329 kr</option>
          <option value="379">Telia 10GB - 379 kr</option>
          <option value="429">Telia X Start - 429 kr</option>
          <option value="399">Telia X Ung - 399 kr</option>
          <option value="499">Telia X Basic - 499 kr</option>
          <option value="599">Telia X Max - 599 kr</option>
          <option value="699">Telia X Max Pluss - 699 kr</option>
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
          <img src="/Telia-nettside/Bilder/maxlogo.webp" alt="Max" class="addon-icon" data-price="89" onclick="toggleAddon(this)">
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

  // Spesialtilfelle for Telia X Start - Ingen rabatt på hovednummer, og fastpris på 299 for familie
  if (planText.includes("Telia X Start")) {
    return isMainNumber ? 0 : 100; // Fast rabatt på 100 for familie, tilsvarer fastpris på 299
  }

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

  var planName = plan.options[plan.selectedIndex].text;
  var finalPrice = selectedPlan;

  // Spesialtilfelle for hovednummeret - Telia X Start har fast pris på 379 uten rabatt
  if (planName.includes("Telia X Start") && !isFamily) {
    finalPrice = 379;
  } else {
    // Beregn rabatt for hovednummeret
    if (selectedDiscount > 0) {
      finalPrice -= selectedPlan * (selectedDiscount / 100);
    }
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

      // Spesialtilfelle for Telia X Start som familie
      var discountedFamilyPrice;
      if (familyPlanText.includes("Telia X Start")) {
        discountedFamilyPrice = 379; // Fast pris for Telia X Start som familie
      } else {
        // Beregn familierabatt for andre abonnementer
        var familyDiscountAmount = getFamilyDiscount(
          familyPlanValue,
          familyPlanText,
          false
        );
        discountedFamilyPrice = familyPlanValue - familyDiscountAmount;

        // Hvis plan ikke er Telia X Start eller Telia X Ung, legg til ekstra familierabatt
        if (
          !familyPlanText.includes("Telia X Start") &&
          !familyPlanText.includes("Telia X Ung") &&
          selectedFamilyDiscount > 0
        ) {
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
      var twinSimPrice = 0;
      var dataSimPrice = 0;

      // Hvis Telia X Max Pluss, gir 2 gratis SIM-kort
      if (familyPlanText.includes("Max Pluss")) {
        var totalSimCount = twinSimCount + dataSimCount;
        var chargeableSimCount = Math.max(0, totalSimCount - 2); // Gratis for de første to SIM-kortene
        twinSimPrice = chargeableSimCount * 89; // Pris per ekstra TvillingSIM for Telia X Max Pluss
        dataSimPrice = chargeableSimCount > 0 ? chargeableSimCount * 89 : 0; // Gratis om ingen ekstra SIM
      } else if (familyPlanText.includes("Telia X")) {
        twinSimPrice = twinSimCount * 89; // 89 NOK per TvillingSIM
        dataSimPrice = dataSimCount * 89; // 89 NOK per DataSIM
      } else {
        // Pris for Telia Mobil og andre abonnementer
        twinSimPrice = twinSimCount * 49; // 49 NOK per TvillingSIM
        dataSimPrice = dataSimCount * 49; // 49 NOK per DataSIM
      }

      familyTotal += discountedFamilyPrice + twinSimPrice + dataSimPrice;

      // Legg til familiemedlemmets plan i resultatlisten
      detailedResult += `<p>Nummer ${i + 2}: ${
        familyPlans[i].options[familyPlans[i].selectedIndex].text.split("-")[0]
      } - ${discountedFamilyPrice.toFixed(2)} kr</p>`;
    }

    finalPrice = familyTotal; // Oppdater totalpris med familieabonnementer
  }

  // Oppdater resultatvisningen med detaljerte priser
  resultDisplay.innerHTML = detailedResult;

  // Oppdater endelig pris
  totalDisplay.innerText = "Endelig pris: " + finalPrice.toFixed(2) + " kr";

  // Kall funksjonen for å oppdatere den nye resultatvisningen
  updateResultDisplay();
}

// Hent kostnader for TvillingSIM og DataSIM
var familyPlanDiv = familyPlans[i].closest(".family-plan");
var twinSimCount = parseInt(
  familyPlanDiv.querySelector(".twinsim-select").value
);
var dataSimCount = parseInt(
  familyPlanDiv.querySelector(".datasim-select").value
);
var twinSimPrice = 0;
var dataSimPrice = 0;

// Hvis Telia X, endre prisen for både TvillingSIM og DataSIM
if (familyPlanText.includes("Telia X")) {
  twinSimPrice = twinSimCount * 89; // TvillingSIM koster 89 kr for Telia X
  dataSimPrice = dataSimCount * 89; // DataSIM koster også 89 kr for Telia X
}

// Hvis Telia X Max Pluss, gir 2 gratis SIM-kort
if (familyPlanText.includes("Max Pluss")) {
  var totalSimCount = twinSimCount + dataSimCount;
  var chargeableSimCount = Math.max(0, totalSimCount - 2); // Gratis for de første to SIM-kortene

  // Oppdater prisene for TvillingSIM og DataSIM
  if (chargeableSimCount > 0) {
    if (twinSimCount > 2) {
      twinSimPrice = (twinSimCount - 2) * 89; // Kun belaste for TvillingSIM utover de to gratis
      dataSimPrice = dataSimCount * 89; // Belaste for alle DataSIM
    } else {
      twinSimPrice = 0; // Alle TvillingSIM er gratis
      dataSimPrice = Math.max(0, totalSimCount - 2) * 89; // Belaste for DataSIM utover de to gratis
    }
  } else {
    twinSimPrice = 0; // Ingen belastes
    dataSimPrice = 0; // Ingen belastes
  }
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
    dataSimPrice = chargeableSimCount > 0 ? chargeableSimCount * 89 : 0; // Ingen tillegg for DataSIM hvis ingen ekstra SIM utover de første to
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

// Funksjon for å oppdatere tilleggstjenester basert på valgt abonnement
function updateAdditionalServices() {
  var planSelect = document.getElementById("plan");
  var selectedPlan = planSelect.options[planSelect.selectedIndex].text;

  var teliaSkyIcon = document.querySelector(".addon-icon[alt='Telia Sky']");

  if (selectedPlan.includes("Telia X")) {
    // Telia Sky er inkludert i Telia X-abonnementer
    teliaSkyIcon.classList.add("selected");
    teliaSkyIcon.setAttribute("data-price", "0"); // Sett prisen til 0
    teliaSkyIcon.onclick = null; // Fjern klikk-funksjonen for å gjøre den ikke-deaktiverbar
  } else {
    // Telia Sky er en betalt tilleggstjeneste for andre abonnementer
    teliaSkyIcon.classList.remove("selected");
    teliaSkyIcon.setAttribute("data-price", "69"); // Gjenopprett prisen til 69 kr
    teliaSkyIcon.onclick = function () {
      toggleAddon(teliaSkyIcon);
    }; // Tillat valg
  }

  // Oppdater totalprisen for å reflektere endringene
  calculatePrice();
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

// Kall funksjonen når abonnementet endres
document
  .getElementById("plan")
  .addEventListener("change", updateAdditionalServices);

// Initialiser tilleggstjenester ved sideinnlasting
window.onload = function () {
  updateAdditionalServices();
};

// Funksjon for å vise detaljert resultat
function updateResultDisplay() {
  // Hent HTML-elementene for å vise valgt informasjon
  var selectedPlanElement = document.getElementById("selectedPlan");
  var discountDetailsElement = document.getElementById("discountDetails");
  var simDetailsElement = document.getElementById("simDetails");
  var addonDetailsElement = document.getElementById("addonDetails");

  // Tøm innholdet i elementene for å starte på nytt
  selectedPlanElement.innerHTML = "";
  discountDetailsElement.innerHTML = "";
  simDetailsElement.innerHTML = "";
  addonDetailsElement.innerHTML = "";

  // Vis valgt abonnement
  var plan = document.getElementById("plan");
  var planName = plan.options[plan.selectedIndex].text;
  var selectedPlanPrice = parseFloat(plan.value);
  selectedPlanElement.innerHTML = `<p>${planName} - ${selectedPlanPrice.toFixed(
    2
  )} kr</p>`;

  // Vis rabattinformasjon
  var discount = document.getElementById("discount");
  var discountPercentage = parseFloat(discount.value);
  discountDetailsElement.innerHTML = `<p>Rabatt: ${discountPercentage}%</p>`;

  // Vis SIM-valg
  var simDetails = "";
  var familyPlans = document.getElementsByClassName("family-plan");
  for (var i = 0; i < familyPlans.length; i++) {
    var familyPlanDiv = familyPlans[i].closest(".family-plan");
    var familyPlanDiv = familyPlans[i];
    var twinSimCount = parseInt(
      familyPlanDiv.querySelector(".twinsim-select").value
    );
    var dataSimCount = parseInt(
      familyPlanDiv.querySelector(".datasim-select").value
    );

    if (twinSimCount > 0) {
      simDetails += `<p>TvillingSIM: ${twinSimCount} x 49 kr</p>`;
    }
    if (dataSimCount > 0) {
      simDetails += `<p>DataSIM: ${dataSimCount} x 49 kr</p>`;
    }
  }
  simDetailsElement.innerHTML = simDetails || "<p>Ingen SIM valgt</p>";

  // Vis tilleggstjenester
  var selectedAddons = document.querySelectorAll(".addon-icon.selected");
  var addonDetails = "";
  selectedAddons.forEach(function (addon) {
    var addonName = addon.alt;
    var addonPrice = parseFloat(addon.getAttribute("data-price"));
    addonDetails += `<p>${addonName} - ${addonPrice.toFixed(2)} kr</p>`;
  });
  addonDetailsElement.innerHTML =
    addonDetails || "<p>Ingen tilleggstjenester valgt</p>";
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

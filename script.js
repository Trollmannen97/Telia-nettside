document.getElementById("sokeboks").addEventListener("input", function () {
  let filter = this.value.toLowerCase();
  let rows = document.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    let product = row.children[0].textContent.toLowerCase();
    let price = row.children[1].textContent.toLowerCase();
    let description = row.children[2].textContent.toLowerCase();

    if (
      product.includes(filter) ||
      price.includes(filter) ||
      description.includes(filter)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

// JavaScript for å toggle dropdowns
function toggleDropdown(element) {
  const content = element.nextElementSibling;
  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
}

function toggleDropdown(element) {
  const content = element.nextElementSibling;
  if (content.classList.contains("show")) {
    content.classList.remove("show");
    element.classList.remove("open");
  } else {
    content.classList.add("show");
    element.classList.add("open");
  }
}

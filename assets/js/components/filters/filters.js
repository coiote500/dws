function filterProducts() {
  var raca = document.getElementById("racaFilter").value;
  var cor = document.getElementById("corFilter").value;
  var sangue = document.getElementById("sangueFilter").value;
  var products = document.querySelectorAll(".product");
  products.forEach(function (product) {
    var show = true;
    if (raca && product.getAttribute("data-raca") !== raca) show = false;
    if (cor && product.getAttribute("data-cor") !== cor) show = false;
    if (sangue && product.getAttribute("data-sangue") !== sangue) show = false;
    product.style.display = show ? "block" : "none";
  });
}
document
  .getElementById("racaFilter")
  .addEventListener("change", filterProducts);
document.getElementById("corFilter").addEventListener("change", filterProducts);
document
  .getElementById("sangueFilter")
  .addEventListener("change", filterProducts);

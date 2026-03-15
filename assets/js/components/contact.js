document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;
    if (!name || !email || !message) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    if (!email.includes("@")) {
      alert("Email inválido.");
      return;
    }
    alert("Mensagem enviada! Entraremos em contato em breve.");
    document.getElementById("contactForm").reset();
  });

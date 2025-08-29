document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorMsg = document.querySelector(".login-error");
  const successMsg = document.querySelector(".login-success");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.token) {
          // ✅ On stocke le token
          localStorage.setItem("authToken", data.token);

          // ✅ Affiche message succès
          errorMsg.style.display = "none";
          successMsg.textContent = "Connexion réussie";
          successMsg.style.display = "block";
          successMsg.style.color = "red";

          // ✅ Redirection après 1s
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } else {
          errorMsg.textContent = "Aucun token reçu !";
          errorMsg.style.display = "block";
          successMsg.style.display = "none";
        }
      } else {
        errorMsg.textContent = "Email ou mot de passe incorrect";
        errorMsg.style.display = "block";
        successMsg.style.display = "none";
      }
    } catch (err) {
      console.error("❌ Erreur :", err);
      errorMsg.textContent = "Erreur serveur";
      errorMsg.style.display = "block";
      successMsg.style.display = "none";
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorMsg = document.querySelector(".login-error");

  // 🔹 Nouveau message succès
  const successMsg = document.createElement("p");
  successMsg.classList.add("login-success");
  successMsg.style.display = "none";
  successMsg.style.color = "green";
  successMsg.style.marginTop = "10px";
  successMsg.innerText = "Connexion réussie ✅";
  form.appendChild(successMsg);

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        errorMsg.innerText = "Erreur dans l’identifiant ou le mot de passe";
        errorMsg.style.display = "block";
        successMsg.style.display = "none";
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      // ✅ Connexion réussie
      console.log("✅ Connexion réussie, token stocké :", data.token);
      errorMsg.style.display = "none"; // cacher l'erreur si elle était affichée
      successMsg.style.display = "block"; // montrer le message de succès

    } catch (err) {
      errorMsg.innerText = "Erreur serveur";
      errorMsg.style.display = "block";
      successMsg.style.display = "none";
      console.error(err);
    }
  });
});
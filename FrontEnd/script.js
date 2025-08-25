document.addEventListener("DOMContentLoaded", () => {
    init();
});

async function init() {
    const portfolioSection = document.querySelector("#portfolio");
    const gallery = portfolioSection?.querySelector(".gallery");

    if (!portfolioSection || !gallery) {
        console.error("❌ Section #portfolio ou galerie introuvable !");
        return;
    }

    try {
        // 🔹 Récupération des projets et catégories
        const [worksResponse, categoriesResponse] = await Promise.all([
            fetch("http://localhost:5678/api/works"),
            fetch("http://localhost:5678/api/categories")
        ]);

        const works = await worksResponse.json();
        const categoriesFromAPI = await categoriesResponse.json();
        const categories = [{ id: 0, name: "Tous" }, ...categoriesFromAPI];

        // ✅ Sauvegarde des works pour réutilisation dans les modales
        localStorage.setItem("works", JSON.stringify(works));

        // 🔹 Création des boutons de filtre
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        categories.forEach(category => {
            const btn = document.createElement("button");
            btn.innerText = category.name;
            btn.classList.add("filter-btn");
            if (category.id === 0) btn.classList.add("active");

            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const filtered = category.id === 0
                    ? works
                    : works.filter(work => work.categoryId === category.id);

                displayWorks(filtered);
            });

            buttonContainer.appendChild(btn);
        });

        portfolioSection.insertBefore(buttonContainer, gallery);

        // 🔹 Affichage initial
        displayWorks(works);

        // 🔹 Gestion du login
        const loginLink = document.querySelector('nav ul li:nth-child(3)');
        if (loginLink) {
            loginLink.addEventListener('click', e => {
                e.preventDefault();
                console.log('%cLog in', "font-family:'Syne',sans-serif;font-weight:700;font-size:30px;color:#1D6154");
                createLoginModal();
            });
        }

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des données :", error);
    }
}

// 🔹 Fonction pour afficher les projets
function displayWorks(worksArray) {
    const gallery = document.querySelector("#portfolio .gallery");
    gallery.innerHTML = "";

    worksArray.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement("figcaption");
        figcaption.innerText = work.title;

        figure.append(img, figcaption);
        gallery.appendChild(figure);
    });

    // Ajout espace vide pour ouvrir la modale galerie
    const emptySpace = document.createElement("div");
    emptySpace.classList.add("empty-space");
    emptySpace.style.height = "150px";
    emptySpace.style.cursor = "pointer";
    gallery.appendChild(emptySpace);

    emptySpace.addEventListener("click", () => {
        modalGallery(worksArray);
    });
}

// 🔹 Modale login
function createLoginModal() {
    if (document.querySelector(".login-overlay")) return; // éviter doublon

    const overlay = document.createElement("div");
    overlay.classList.add("login-overlay");

    const modal = document.createElement("div");
    modal.classList.add("login-modal");

    const title = document.createElement("h2");
    title.innerText = "Log in";

    const form = document.createElement("form");
    form.innerHTML = `
        <label>Email</label>
        <textarea name="email" rows="1" class="login-input"></textarea>
        <label>Mot de passe</label>
        <textarea name="password" rows="1" class="login-input"></textarea>
        <p class="login-error" style="display:none"></p>
        <button type="submit">Se connecter</button>
        <p class="login-forgot">Mot de passe oublié</p>
    `;

    modal.append(title, form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const email = form.email.value.trim();
        const password = form.password.value.trim();
        const errorMsg = form.querySelector(".login-error");

        try {
            const response = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                errorMsg.innerText = "Erreur dans l’identifiant ou le mot de passe";
                errorMsg.style.display = "block";
                return;
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "edition.html";

        } catch (err) {
            errorMsg.innerText = "Erreur serveur";
            errorMsg.style.display = "block";
            console.error(err);
        }
    });
}

// 🔹 Modale galerie
function modalGallery(worksArray) {
    if (document.querySelector(".gallery-overlay")) return; // éviter doublon

    const overlay = document.createElement("div");
    overlay.classList.add("gallery-overlay");

    const modal = document.createElement("div");
    modal.classList.add("gallery-modal");

    const closeBtn = document.createElement("span");
    closeBtn.innerText = "✖";
    closeBtn.classList.add("gallery-close");
    closeBtn.addEventListener("click", () => overlay.remove());

    const title = document.createElement("h2");
    title.innerText = "Galerie photo";

    const container = document.createElement("div");
    container.classList.add("gallery-images");

    worksArray.forEach(work => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("img-wrapper");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement("span");
        deleteBtn.innerText = "🗑️";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => wrapper.remove());

        wrapper.append(img, deleteBtn);
        container.appendChild(wrapper);
    });

    // Ligne de séparation (au-dessus du bouton)
    const separator = document.createElement("div");
    separator.classList.add("separator");

    // Bouton Ajouter une photo
    const addBtn = document.createElement("button");
    addBtn.innerText = "Ajouter une photo";
    addBtn.classList.add("add-photo-btn");

    console.log("Bouton ajouté :", addBtn); // ✅ Test

    // ✅ Vérification console
    addBtn.addEventListener("click", () => {
        console.log("✅ Bouton Ajouter une photo cliqué");
        openAddPhotoModal();
    });

    modal.append(closeBtn, title, container, separator, addBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

// 🔹 Modale "Ajout photo"
async function openAddPhotoModal() { 

    console.log("✅ Fonction openAddPhotoModal appelée !");
    if (document.querySelector(".add-photo-overlay")) return; // éviter doublon

    const overlay = document.createElement("div");
    overlay.classList.add("add-photo-overlay");

    const modal = document.createElement("div");
    modal.classList.add("add-photo-modal");

    // Flèche retour
    const backBtn = document.createElement("span");
    backBtn.innerText = "←";
    backBtn.classList.add("back-btn");
    backBtn.addEventListener("click", () => {
        overlay.remove();
        const works = JSON.parse(localStorage.getItem("works") || "[]");
        modalGallery(works);
    });

    // Croix fermeture
    const closeBtn = document.createElement("span");
    closeBtn.innerText = "✖";
    closeBtn.classList.add("close-btn");
    closeBtn.addEventListener("click", () => overlay.remove());

    // Titre
    const title = document.createElement("h3");
    title.innerText = "Ajout photo";

    // Cadre upload
    const uploadBox = document.createElement("div");
    uploadBox.classList.add("upload-box");

    const mountainIcon = document.createElement("img");
    mountainIcon.src = "assets/icons/picture-svgrepo-com1.png";
    mountainIcon.alt = "Upload image";
    mountainIcon.classList.add("mountain-icon");

    const addPhotoBtn = document.createElement("button");
    addPhotoBtn.innerText = "+ Ajouter une photo";
    addPhotoBtn.classList.add("upload-btn");

    const fileInfo = document.createElement("p");
    fileInfo.innerText = "jpg, png : 4mo max";

    uploadBox.append(mountainIcon, addPhotoBtn, fileInfo);

    // Champ titre
    const labelTitre = document.createElement("label");
    labelTitre.innerText = "Titre";
    const inputTitre = document.createElement("textarea");
    inputTitre.rows = 1;
    inputTitre.classList.add("title-input");
    inputTitre.value = ""; // vide par défaut

    // Champ catégorie
    const labelCategorie = document.createElement("label");
    labelCategorie.innerText = "Catégorie";
    const selectCategorie = document.createElement("select");
    selectCategorie.classList.add("category-select");

    // Option vide par défaut
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.innerText = ""; // reste vide
    defaultOption.selected = true;
    selectCategorie.appendChild(defaultOption);

    // Récupération des catégories
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        const categories = await response.json();
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.innerText = cat.name;
            selectCategorie.appendChild(option);
        });
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des catégories :", err);
    }

    // Séparateur
    const separator2 = document.createElement("div");
    separator2.classList.add("separator2");

    // Bouton Valider
    const validateBtn = document.createElement("button");
    validateBtn.innerText = "Valider";
    validateBtn.classList.add("validate-btn");

    modal.append(backBtn, closeBtn, title, uploadBox, labelTitre, inputTitre, labelCategorie, selectCategorie, separator2, validateBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}
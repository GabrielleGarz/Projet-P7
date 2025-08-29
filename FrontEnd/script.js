// ============================
// 🔹 Chargement initial
// ============================
document.addEventListener("DOMContentLoaded", async () => {
    await init();            // construit galerie + filtres
    handleUserToken();       // ajuste l’interface si connecté
});

// ============================
// 🔹 Initialisation portfolio
// ============================
async function init() {
    const portfolioSection = document.querySelector("#portfolio");
    const gallery = portfolioSection?.querySelector(".gallery");

    if (!portfolioSection || !gallery) {
        console.error("❌ Section #portfolio ou galerie introuvable !");
        return;
    }

    try {
        const [worksResponse, categoriesResponse] = await Promise.all([
            fetch("http://localhost:5678/api/works"),
            fetch("http://localhost:5678/api/categories")
        ]);

        const works = await worksResponse.json();
        const categoriesFromAPI = await categoriesResponse.json();
        const categories = [{ id: 0, name: "Tous" }, ...categoriesFromAPI];

        localStorage.setItem("works", JSON.stringify(works));

        // Création des boutons de filtre
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

        displayWorks(works);

        // Login redirection
        const loginLink = document.querySelector('nav ul li:nth-child(3)');
        if (loginLink) {
            loginLink.addEventListener('click', e => {
                e.preventDefault();
                window.location.href = "login.html";
            });
        }

        // Bouton "Modifier" ouvre la galerie
        const editBtn = document.getElementById("edit-button");
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                modalGallery(works);
            });
        }

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des données :", error);
    }
}

// ============================
// 🔹 Affichage des projets
// ============================
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
}

// ============================
// 🔹 Modale Galerie
// ============================
function modalGallery(worksArray) {
    // Supprime la modale si elle existe
    const existing = document.querySelector(".gallery-overlay");
    if (existing) existing.remove();

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

        // Bouton supprimer avec icône poubelle
        const deleteBtn = document.createElement("span");
        deleteBtn.classList.add("delete-btn");

        const deleteIcon = document.createElement("img");
        deleteIcon.src = "assets/icons/bin.png";
        deleteIcon.alt = "Supprimer";
        deleteIcon.style.width = "20px";
        deleteIcon.style.height = "20px";
        deleteIcon.style.cursor = "pointer";

        deleteIcon.addEventListener("click", () => wrapper.remove());
        deleteBtn.appendChild(deleteIcon);

        wrapper.append(img, deleteBtn);
        container.appendChild(wrapper);
    });

    const separator = document.createElement("div");
    separator.classList.add("separator");

    const addBtn = document.createElement("button");
    addBtn.innerText = "Ajouter une photo";
    addBtn.classList.add("add-photo-btn");
    addBtn.addEventListener("click", () => openAddPhotoModal());

    modal.append(closeBtn, title, container, separator, addBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

// ============================
// 🔹 Modale Ajout photo
// ============================
async function openAddPhotoModal() {
    // Supprime la modale galerie si elle existe
    const galleryOverlay = document.querySelector(".gallery-overlay");
    if (galleryOverlay) galleryOverlay.remove();

    if (document.querySelector(".add-photo-overlay")) return;

    const overlay = document.createElement("div");
    overlay.classList.add("add-photo-overlay");

    const modal = document.createElement("div");
    modal.classList.add("add-photo-modal");

    // Bouton retour
    const backBtn = document.createElement("span");
    backBtn.innerText = "←";
    backBtn.classList.add("back-btn");
    backBtn.addEventListener("click", () => {
        overlay.remove();
        const works = JSON.parse(localStorage.getItem("works") || "[]");
        modalGallery(works);
    });

    // Bouton fermeture
    const closeBtn = document.createElement("span");
    closeBtn.innerText = "✖";
    closeBtn.classList.add("close-btn");
    closeBtn.addEventListener("click", () => overlay.remove());

    const title = document.createElement("h3");
    title.innerText = "Ajout photo";

    const uploadBox = document.createElement("div");
    uploadBox.classList.add("upload-box");

    const mountainIcon = document.createElement("img");
    mountainIcon.src = "assets/icons/picture-svgrepo-com1.png";
    mountainIcon.alt = "Upload image";
    mountainIcon.classList.add("mountain-icon");

    const addPhotoBtn = document.createElement("button");
    addPhotoBtn.innerText = "+ Ajouter une photo";
    addPhotoBtn.classList.add("upload-btn");
    addPhotoBtn.addEventListener("click", () => {
        alert("URL de la photo : http://localhost:5678/images/hotel-first-arte-new-delhi1651878429528.png");
    });

    const fileInfo = document.createElement("p");
    fileInfo.innerText = "jpg, png : 4mo max";

    uploadBox.append(mountainIcon, addPhotoBtn, fileInfo);

    // Textareas
    const labelTitre = document.createElement("label");
    labelTitre.innerText = "Titre";
    const inputTitre = document.createElement("textarea");
    inputTitre.rows = 1;
    inputTitre.classList.add("title-input");

    const labelCategorie = document.createElement("label");
    labelCategorie.innerText = "Catégorie";
    const selectCategorie = document.createElement("select");
    selectCategorie.classList.add("category-select");

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.innerText = "";
    defaultOption.selected = true;
    selectCategorie.appendChild(defaultOption);

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

    const separator2 = document.createElement("div");
    separator2.classList.add("separator2");

    // Bouton Valider (ouvre la preview)
    const validateBtn = document.createElement("button");
    validateBtn.innerText = "Valider";
    validateBtn.classList.add("validate-btn");
    validateBtn.addEventListener("click", () => {
        overlay.remove();
        openPreviewModal("http://localhost:5678/images/hotel-first-arte-new-delhi1651878429528.png");
    });

    modal.append(backBtn, closeBtn, title, uploadBox, labelTitre, inputTitre, labelCategorie, selectCategorie, separator2, validateBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

// ============================
// 🔹 Troisième modale (preview)
// ============================
async function openPreviewModal(imageUrl) {
    const existing = document.querySelector(".preview-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.classList.add("preview-overlay");

    const modal = document.createElement("div");
    modal.classList.add("preview-modal");
    modal.style.border = "3px solid #ADD8E6"; // cadre bleu clair
    modal.style.padding = "20px";

    // Bouton retour
    const backBtn = document.createElement("span");
    backBtn.innerText = "←";
    backBtn.classList.add("back-btn");
    backBtn.style.cursor = "pointer";
    backBtn.addEventListener("click", () => {
        overlay.remove();
        openAddPhotoModal();
    });

    // Bouton fermeture
    const closeBtn = document.createElement("span");
    closeBtn.innerText = "✖";
    closeBtn.classList.add("close-btn");
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", () => overlay.remove());

    // Titre
    const title = document.createElement("h3");
    title.innerText = "Ajout photo";

    // Image
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Photo sélectionnée";
    img.style.width = "100%";
    img.style.display = "block";
    img.style.marginBottom = "10px";

    // Textarea Titre
    const labelTitre = document.createElement("label");
    labelTitre.innerText = "Titre";
    const inputTitre = document.createElement("textarea");
    inputTitre.rows = 1;
    inputTitre.classList.add("title-input");

    // Textarea Catégorie
    const labelCategorie = document.createElement("label");
    labelCategorie.innerText = "Catégorie";
    const selectCategorie = document.createElement("select");
    selectCategorie.classList.add("category-select");

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.innerText = "";
    defaultOption.selected = true;
    selectCategorie.appendChild(defaultOption);

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

    // Bouton Valider
    const validateBtn = document.createElement("button");
    validateBtn.innerText = "Valider";
    validateBtn.classList.add("validate-btn");
    validateBtn.style.display = "block";
    validateBtn.style.margin = "20px auto";
    validateBtn.addEventListener("click", () => {
        alert("Valider : la photo sera ajoutée à la galerie !");
        overlay.remove();
    });

    modal.append(backBtn, closeBtn, title, img, labelTitre, inputTitre, labelCategorie, selectCategorie, validateBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

// ============================
// 🔹 Gestion interface si connecté
// ============================
function handleUserToken() {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Bandeau noir
    let editBanner = document.getElementById("edit-banner");
    if (!editBanner) {
        editBanner = document.createElement("div");
        editBanner.id = "edit-banner";
        editBanner.className = "edit-banner";
        editBanner.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Mode édition`;
        document.body.prepend(editBanner);
    }
    editBanner.style.display = "block";

    // Bouton "Modifier"
    const editBtn = document.getElementById("edit-button");
    if (editBtn) editBtn.style.display = "inline-block";

    // Cacher les filtres
    const filters = document.querySelector(".button-container");
    if (filters) filters.style.display = "none";

    // Login → logout
    const loginLink = document.querySelector("nav ul li:nth-child(3)");
    if (loginLink) {
        loginLink.textContent = "logout";
        loginLink.addEventListener("click", e => {
            e.preventDefault();
            localStorage.removeItem("authToken");
            window.location.reload();
        });
    }
}
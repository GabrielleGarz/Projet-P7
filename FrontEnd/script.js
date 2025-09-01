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
// 🔹 Modale Ajout photo (2e modale)
// ============================
async function openAddPhotoModal() {
    // Masque temporairement la modale galerie si elle existe
    const galleryOverlay = document.querySelector(".gallery-overlay");
    if (galleryOverlay) galleryOverlay.style.display = "none"; // juste masquer

    // Empêche plusieurs modales identiques
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
        if (galleryOverlay) galleryOverlay.style.display = "flex";
    });

    // Bouton fermeture
    const closeBtn = document.createElement("span");
    closeBtn.innerText = "✖";
    closeBtn.classList.add("close-btn");
    closeBtn.addEventListener("click", () => {
        overlay.remove();
        if (galleryOverlay) galleryOverlay.style.display = "flex";
    });

    const title = document.createElement("h3");
    title.innerText = "Ajout photo";

    // Zone upload
    const uploadBox = document.createElement("div");
    uploadBox.classList.add("upload-box");

    const mountainIcon = document.createElement("img");
    mountainIcon.src = "assets/icons/picture-svgrepo-com1.png";
    mountainIcon.alt = "Upload image";
    mountainIcon.classList.add("mountain-icon");

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png, image/jpeg";
    fileInput.style.display = "none";

    const addPhotoBtn = document.createElement("button");
    addPhotoBtn.innerText = "+ Ajouter une photo";
    addPhotoBtn.classList.add("upload-btn");
    addPhotoBtn.addEventListener("click", () => fileInput.click());

    // Quand on choisit une image → ouvrir la 3e modale
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            overlay.remove();
            openPreviewModal(fileUrl, file); // ✅ passe le vrai file
        }
    });

    const fileInfo = document.createElement("p");
    fileInfo.innerText = "jpg, png : 4mo max";

    uploadBox.append(mountainIcon, addPhotoBtn, fileInfo, fileInput);

    // Champs formulaire (facultatif dans cette 2e modale)
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

    // Bouton Valider corrigé ✅
    const validateBtn = document.createElement("button");
    validateBtn.innerText = "Valider";
    validateBtn.classList.add("validate-btn");
    validateBtn.addEventListener("click", () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Veuillez d’abord sélectionner une image.");
            return;
        }
        const fileUrl = URL.createObjectURL(file);
        overlay.remove();
        openPreviewModal(fileUrl, file); // ✅ passe le vrai file
    });

    modal.append(
        backBtn,
        closeBtn,
        title,
        uploadBox,
        labelTitre,
        inputTitre,
        labelCategorie,
        selectCategorie,
        separator2,
        validateBtn
    );

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => {
        if (e.target === overlay) overlay.remove();
        if (galleryOverlay) galleryOverlay.style.display = "flex";
    });
}
 
/*function refresh gallery*/
function refreshModalGallery() {
    const overlay = document.querySelector(".gallery-overlay");
    if (!overlay) return;

    const container = overlay.querySelector(".gallery-images");
    if (!container) return;

    container.innerHTML = "";

    const works = JSON.parse(localStorage.getItem("works") || "[]");

    works.forEach(work => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("img-wrapper");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement("span");
        deleteBtn.classList.add("delete-btn");

        const deleteIcon = document.createElement("img");
        deleteIcon.src = "assets/icons/bin.png";
        deleteIcon.alt = "Supprimer";
        deleteIcon.style.width = "20px";
        deleteIcon.style.height = "20px";
        deleteIcon.style.cursor = "pointer";

        deleteIcon.addEventListener("click", async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return alert("Vous devez être connecté pour supprimer");

            try {
                const res = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("❌ Suppression échouée");

                const updatedWorks = JSON.parse(localStorage.getItem("works") || "[]").filter(w => w.id !== work.id);
                localStorage.setItem("works", JSON.stringify(updatedWorks));
                refreshModalGallery();
                displayWorks(updatedWorks);
            } catch (err) {
                console.error(err);
                alert("Erreur lors de la suppression");
            }
        });

        deleteBtn.appendChild(deleteIcon);
        wrapper.append(img, deleteBtn);
        container.appendChild(wrapper);
    });
}

// ============================
// 🔹 Troisième modale (preview) complète avec suppression de doublons
// ============================
async function openPreviewModal(fileUrl, file) {
    const existing = document.querySelector(".preview-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.classList.add("preview-overlay");

    const modal = document.createElement("div");
    modal.classList.add("preview-modal");

    const backBtn = document.createElement("span");
    backBtn.innerText = "←";
    backBtn.classList.add("back-btn");
    backBtn.addEventListener("click", () => {
        overlay.remove();
        openAddPhotoModal();
    });

    const closeBtn = document.createElement("span");
    closeBtn.innerText = "✖";
    closeBtn.classList.add("close-btn");
    closeBtn.addEventListener("click", () => overlay.remove());

    const title = document.createElement("h3");
    title.innerText = "Ajout photo";

    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("preview-img-wrapper");

    const img = document.createElement("img");
    img.src = fileUrl;
    img.alt = "Photo sélectionnée";
    img.classList.add("preview-img");

    imgWrapper.appendChild(img);

    const labelTitre = document.createElement("label");
    labelTitre.innerText = "Titre";
    const inputTitre = document.createElement("textarea");
    inputTitre.rows = 1;
    inputTitre.classList.add("title-input");

    const fieldTitre = document.createElement("div");
    fieldTitre.classList.add("field-group");
    fieldTitre.append(labelTitre, inputTitre);

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

    const fieldCategorie = document.createElement("div");
    fieldCategorie.classList.add("field-group");
    fieldCategorie.append(labelCategorie, selectCategorie);

    const separator3 = document.createElement("div");
    separator3.classList.add("separator3");

    // Bouton Valider
    const validateBtn2 = document.createElement("button");
    validateBtn2.innerText = "Valider";
    validateBtn2.classList.add("validate-btn");
    validateBtn2.style.display = "block";
    validateBtn2.style.margin = "20px auto";

validateBtn2.addEventListener("click", async () => {
    const titre = inputTitre.value.trim();
    const categorieId = selectCategorie.value;

    if (!titre || !categorieId || !file) {
        alert("Veuillez remplir tous les champs et choisir une photo.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Vous devez être connecté pour ajouter une photo.");
        return;
    }

    const formData = new FormData();
    formData.append("title", titre);
    formData.append("category", categorieId);
    formData.append("image", file);

    try {
        // 1️⃣ Upload de la nouvelle photo
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) throw new Error("❌ Upload échoué");

        const newWork = await response.json();
        alert("✅ Photo ajoutée à la galerie !");
        overlay.remove(); // ferme la 3e modale

        // 2️⃣ Récupère toutes les images depuis l’API
        const res = await fetch("http://localhost:5678/api/works");
        let works = await res.json();

        // 3️⃣ Supprime les doublons par URL
        const seenUrls = new Set();
        const uniqueWorks = [];

        for (const work of works) {
            if (!seenUrls.has(work.imageUrl)) {
                seenUrls.add(work.imageUrl);
                uniqueWorks.push(work);
            } else {
                // Supprime le doublon via API
                await fetch(`http://localhost:5678/api/works/${work.id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
            }
        }

        // 4️⃣ Met à jour le localStorage
        localStorage.setItem("works", JSON.stringify(uniqueWorks));

        // 5️⃣ Met à jour la galerie principale sur la page
        displayWorks(uniqueWorks);

        // 6️⃣ Rafraîchit la modale galerie si elle est ouverte
        const galleryOverlay = document.querySelector(".gallery-overlay");
        if (galleryOverlay) {
            refreshModalGallery();
        }

    } catch (err) {
        console.error("❌ Erreur ajout :", err);
        alert("Erreur lors de l'ajout de la photo. Vérifiez votre connexion ou votre token.");
    }
});

    modal.append(
        backBtn,
        closeBtn,
        title,
        imgWrapper,
        fieldTitre,
        fieldCategorie,
        separator3,
        validateBtn2
    );

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => {
        if (e.target === overlay) overlay.remove();
    });
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
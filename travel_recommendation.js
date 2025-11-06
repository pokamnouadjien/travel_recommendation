// travel_recommendation.js — version corrigée et robuste

// Utilitaire : affiche les résultats dans #results
function displayResults(results, keyword) {
    const resultsContainer = document.getElementById("results");
    const resultsTitle = document.getElementById("results-title");

    resultsContainer.innerHTML = "";

    // montrer le conteneur et le titre
    resultsContainer.style.display = "flex";
    if (resultsTitle) resultsTitle.style.display = "block";

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = `<p>Aucun résultat trouvé pour "<strong>${keyword}</strong>".</p>`;
        return;
    }

    results.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("city-card");

        const imgHTML = item.image
            ? `<img src="${item.image}" alt="${item.name}">`
            : `<div class="no-image">No image available</div>`;

        card.innerHTML = `
            ${imgHTML}
            <div class="city-info">
                <h3>${item.name}</h3>
                <p><strong>Type :</strong> ${item.type}</p>
                <p>${item.description}</p>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

// Fonction principale de recherche
function searchDestinations(keyword) {
    const searchTerm = (keyword || "").toLowerCase().trim();
    const resultsContainer = document.getElementById("results");
    const resultsTitle = document.getElementById("results-title");

    // sécurité éléments
    if (!resultsContainer) {
        console.error("Element #results introuvable dans le DOM.");
        return;
    }

    // Reset visuel immédiat
    resultsContainer.innerHTML = "";
    // On ne cache pas resultsContainer ici — il sera affiché quand on a quelque chose à montrer
    if (resultsTitle) resultsTitle.style.display = "none";

    if (!searchTerm) {
        // Si champ vide -> l'utilisateur n'a pas cherché
        resultsContainer.innerHTML = "<p>Veuillez entrer un mot-clé.</p>";
        resultsContainer.style.display = "flex";
        return;
    }

    fetch("travel_recommendation_api.json")
        .then(response => {
            if (!response.ok) throw new Error("Impossible de charger travel_recommendation_api.json");
            return response.json();
        })
        .then(data => {
            // container résultats en mémoire
            let results = [];
            const seen = new Set(); // pour éviter doublons (key = type|name)

            const pushUnique = (obj) => {
                const key = `${obj.type}|${obj.name}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    results.push(obj);
                }
            };

            // Recherche spéciale "country(s)" / "pays" => lister tous les pays
            if (searchTerm === "country" || searchTerm === "countries" || searchTerm === "pays") {
                if (Array.isArray(data.countries)) {
                    data.countries.forEach(country => {
                        pushUnique({
                            type: "Country",
                            name: country.name,
                            description: `Explore unique destinations in ${country.name}.`,
                            image: null
                        });
                    });
                }
                displayResults(results, keyword);
                return;
            }

            // Recherche générale : countries -> vérifier pays et leurs villes
            if (Array.isArray(data.countries)) {
                data.countries.forEach(country => {
                    // match sur le nom du pays / description (s'il y en avait)
                    if (country.name && country.name.toLowerCase().includes(searchTerm)) {
                        pushUnique({
                            type: "Country",
                            name: country.name,
                            description: `Explore unique destinations in ${country.name}.`,
                            image: null
                        });
                    }

                    // villes du pays
                    if (Array.isArray(country.cities)) {
                        country.cities.forEach(city => {
                            const cname = (city.name || "").toLowerCase();
                            const cdesc = (city.description || "").toLowerCase();
                            if (cname.includes(searchTerm) || cdesc.includes(searchTerm)) {
                                pushUnique({
                                    type: "City",
                                    name: city.name,
                                    description: city.description || "",
                                    image: city.image || null
                                });
                            }
                        });
                    }
                });
            }

            // Temples
            if (Array.isArray(data.temples)) {
                data.temples.forEach(temple => {
                    const tname = (temple.name || "").toLowerCase();
                    const tdesc = (temple.description || "").toLowerCase();
                    if (tname.includes(searchTerm) || tdesc.includes(searchTerm) || searchTerm === "temple" || searchTerm === "temples") {
                        pushUnique({
                            type: "Temple",
                            name: temple.name,
                            description: temple.description || "",
                            image: temple.image || null
                        });
                    }
                });
            }

            // Beaches
            if (Array.isArray(data.beaches)) {
                data.beaches.forEach(beach => {
                    const bname = (beach.name || "").toLowerCase();
                    const bdesc = (beach.description || "").toLowerCase();
                    if (bname.includes(searchTerm) || bdesc.includes(searchTerm) || searchTerm === "beach" || searchTerm === "beaches") {
                        pushUnique({
                            type: "Beach",
                            name: beach.name,
                            description: beach.description || "",
                            image: beach.image || null
                        });
                    }
                });
            }

            // Si on n'a toujours aucun résultat : message
            if (results.length === 0) {
                displayResults([], keyword);
                return;
            }

            // Optionnel : trier résultats (Country first, puis City, Temple, Beach) — améliore la lisibilité
            const order = { Country: 0, City: 1, Temple: 2, Beach: 3 };
            results.sort((a, b) => (order[a.type] - order[b.type]) || a.name.localeCompare(b.name));

            displayResults(results, keyword);
        })
        .catch(err => {
            console.error("Erreur fetch/search:", err);
            const resultsContainer = document.getElementById("results");
            resultsContainer.innerHTML = "<p>Une erreur est survenue lors du chargement des données.</p>";
            resultsContainer.style.display = "flex";
        });
}

// ---- Clear fonction fiable ----
function clearSearch() {
    const input = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("results");
    const resultsTitle = document.getElementById("results-title");

    if (input) input.value = "";
    if (resultsContainer) {
        resultsContainer.innerHTML = "";
        // on peut garder display:flex pour que le conteneur reste prêt ; 
        // si tu préfères le masquer, efface la ligne suivante
        resultsContainer.style.display = "none";
    }
    if (resultsTitle) resultsTitle.style.display = "none";

    // remettre le focus sur l'input (bonne UX)
    if (input) input.focus();
}

// ---- écouteurs ----
document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const clearBtn = document.getElementById("clearBtn");
    const input = document.getElementById("searchInput");

    if (searchBtn && input) {
        searchBtn.addEventListener("click", () => {
            searchDestinations(input.value);
        });

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchDestinations(input.value);
            }
        });
    } else {
        console.warn("searchBtn ou searchInput introuvable dans le DOM.");
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", clearSearch);
    } else {
        console.warn("clearBtn introuvable dans le DOM.");
    }
});

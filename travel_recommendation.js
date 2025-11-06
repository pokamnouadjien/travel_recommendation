// Fonction pour charger et afficher les données du fichier JSON
fetch('travel_recommendation_api.json')
 .then(response => {
 if (!response.ok) {
 throw new Error('Erreur de chargement du fichier JSON');
 }
 return response.json(); // Convertit la réponse en objet JavaScript
 })
 .then(data => {
 console.log(' Données JSON chargées avec succès :', data);

 // Exemple : afficher le nom de la première ville
 if (data.cities && data.cities.length > 0) {
 console.log(' Première ville :', data.cities[0].name);
 }

 // Exemple : afficher toutes les villes dans la console
 if (data.cities) {
 data.cities.forEach((city, index) => {
 console.log(`${index + 1}. ${city.name} — ${city.country}`);
 });
 }
 })
 .catch(error => {
 console.error(' Erreur lors du chargement des données :', error);
 });

 function searchDestinations(keyword) {
    const searchTerm = keyword.toLowerCase().trim();

    fetch('travel_recommendation_api.json')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = "";
            document.getElementById("results").style.display = "block";
            document.getElementById("results-title").style.display = "block";


            // ✅ 1. Collecter toutes les villes
            let allCities = [];

            if (data.countries) {
                data.countries.forEach(country => {
                    country.cities.forEach(city => {
                        allCities.push({
                            name: city.name,
                            country: country.name,
                            description: city.description,
                            image: city.image
                        });
                    });
                });
            }

            // ✅ 2. Ajouter aussi les temples et plages si tu veux
            let allDestinations = [...allCities];

            if (data.temples) {
                allDestinations.push(...data.temples);
            }

            if (data.beaches) {
                allDestinations.push(...data.beaches);
            }

            // ✅ 3. Filtrer selon la recherche
            const results = allDestinations.filter(dest =>
                dest.name.toLowerCase().includes(searchTerm) ||
                (dest.country && dest.country.toLowerCase().includes(searchTerm)) ||
                (dest.description && dest.description.toLowerCase().includes(searchTerm))
            );

            // ✅ 4. Affichage
            if (results.length > 0) {
                results.forEach(dest => {
                    const card = document.createElement("div");
                    card.classList.add("city-card");

                    card.innerHTML = `
                        <img src="${dest.image}" alt="${dest.name}">
                        <div class="city-info">
                            <h3>${dest.name}</h3>
                            ${dest.country ? `<p><strong>Pays :</strong> ${dest.country}</p>` : ""}
                            <p>${dest.description}</p>
                        </div>
                    `;
                    resultsContainer.appendChild(card);
                });
            } else {
                resultsContainer.innerHTML = `<p>Aucun résultat trouvé pour "<strong>${keyword}</strong>".</p>`;
            }
        })
        .catch(error => {
            console.error("Erreur JSON :", error);
            document.getElementById("results").innerHTML =
                "<p>Erreur lors du chargement des données.</p>";
        });
}


   
   // Lancer la recherche via le bouton
   document.getElementById('searchBtn').addEventListener('click', () => {
    const keyword = document.getElementById('searchInput').value;
    if (keyword) {
    searchDestinations(keyword);
    } else {
    document.getElementById('results').innerHTML = '<p>Veuillez entrer un mot-clé.</p>';
    }
   });
   
   // Permettre la recherche avec la touche "Entrée"
   document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
    }
   });

   function clearSearch() {
    // Efface le texte du champ de recherche
    document.getElementById("searchInput").value = "";

    // Efface l'affichage des résultats
    const results = document.getElementById("results");
    results.innerHTML = "";
    results.style.display = "none";

    // Cache le titre des résultats si tu en as un
    const title = document.getElementById("results-title");
    if (title) title.style.display = "none";
}
document.getElementById("clearBtn").addEventListener("click", clearSearch);


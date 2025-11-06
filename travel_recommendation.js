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
    .then(response => {
    if (!response.ok) {
    throw new Error('Erreur lors du chargement du fichier JSON');
    }
    return response.json();
    })
    .then(data => {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
   
    if (!data.cities || data.cities.length === 0) {
    resultsContainer.innerHTML = '<p>Aucune donnée disponible.</p>';
    return;
    }
   
    const results = data.cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm) ||
    (city.country && city.country.toLowerCase().includes(searchTerm)) ||
    (city.description && city.description.toLowerCase().includes(searchTerm))
    );
   
    if (results.length > 0) {
    results.forEach(city => {
    const card = document.createElement('div');
    card.classList.add('city-card');
   
    // Image (affichée seulement si elle existe dans le JSON)
    const imageHTML = city.image
    ? `<img src="${city.image}" alt="${city.name}">`
    : `<div class="no-image">No image available</div>`;
   
    card.innerHTML = `
    ${imageHTML}
    <div class="city-info">
    <h3>${city.name}</h3>
    <p><strong>Pays :</strong> ${city.country}</p>
    <p>${city.description}</p>
    </div>
    `;
    resultsContainer.appendChild(card);
    });
    } else {
    resultsContainer.innerHTML = `<p>Aucun résultat trouvé pour "<strong>${keyword}</strong>".</p>`;
    }
    })
    .catch(error => {
    console.error('Erreur :', error);
    document.getElementById('results').innerHTML =
    '<p>Une erreur est survenue lors du chargement des données.</p>';
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
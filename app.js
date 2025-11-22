// ===== CONFIGURATION API =====
const API_KEY = "KcaRwvfL3NP9p7afe5dYpOzXlNar2dzUBndAXDsqdqY";

// ===== SÉLECTION DES ÉLÉMENTS =====
const searchForm = document.getElementById('searchForm');
const queryInput = document.getElementById('query');
const perPageSelect = document.getElementById('perPage');
const resultsGrid = document.getElementById('resultsGrid');
const loader = document.getElementById('loader');
const noResults = document.getElementById('noResults');

const favoritesGrid = document.getElementById('favoritesGrid');
const noFavs = document.getElementById('noFavs');

const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalAttribution = document.getElementById('modalAttribution');
const modalClose = document.getElementById('modalClose');

// ===== FAVORIS LOCALSTORAGE =====
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(id) {
  return favorites.some(fav => fav.id === id);
}

// ===== AFFICHAGE DES FAVORIS =====
function renderFavorites() {
  favoritesGrid.innerHTML = '';
  if (favorites.length === 0) {
    noFavs.style.display = 'block';
    return;
  }
  noFavs.style.display = 'none';
  favorites.forEach(image => {
    const card = createCard(image, true);
    favoritesGrid.appendChild(card);
  });
}

// ===== CREATION DES CARTES =====
function createCard(image, isFavSection = false) {
  const card = document.createElement('div');
  card.classList.add('card');

  const img = document.createElement('img');
  img.src = image.urls?.small || '';
  img.alt = image.alt_description || 'Image Unsplash';
  img.addEventListener('click', () => openModal(image));

  const meta = document.createElement('div');
  meta.classList.add('meta');

  const photographer = document.createElement('span');
  photographer.classList.add('photographer');
  photographer.textContent = image.user?.name || 'Auteur inconnu';

  const favBtn = document.createElement('button');
  favBtn.classList.add('favorite-btn');
  favBtn.textContent = isFavorite(image.id) ? '♥' : '♡';
  if (isFavorite(image.id)) favBtn.classList.add('active');

  favBtn.addEventListener('click', () => {
    if (isFavorite(image.id)) {
      favorites = favorites.filter(fav => fav.id !== image.id);
      favBtn.classList.remove('active');
      favBtn.textContent = '♡';
    } else {
      favorites.push(image);
      favBtn.classList.add('active');
      favBtn.textContent = '♥';
    }
    saveFavorites();
    renderFavorites();
  });

  meta.appendChild(photographer);
  meta.appendChild(favBtn);
  card.appendChild(img);
  card.appendChild(meta);
  return card;
}

// ===== MODAL =====
function openModal(image) {
  modalImage.src = image.urls?.regular || '';
  modalImage.alt = image.alt_description || 'Image Unsplash';
  modalAttribution.textContent = `Photo par ${image.user?.name || 'Auteur inconnu'} sur Unsplash`;
  modal.classList.remove('hidden');
}

modalClose.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

// ===== FETCH IMAGES =====
async function fetchImages(query, perPage = 12) {
  loader.style.display = 'block';
  resultsGrid.innerHTML = '';
  noResults.style.display = 'none';

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&client_id=${API_KEY}`);

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      noResults.textContent = "Aucune image trouvée.";
      noResults.style.display = 'block';
      return;
    }

    data.results.forEach(image => {
      const card = createCard(image);
      resultsGrid.appendChild(card);
    });

  } catch (err) {
    console.error("Erreur API :", err);
    noResults.textContent = "Erreur de chargement.";
    noResults.style.display = 'block';
  } finally {
    loader.style.display = 'none';
  }
}

// ===== FORMULAIRE =====
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const query = queryInput.value.trim();
  const perPage = parseInt(perPageSelect.value, 10);
  if (query) fetchImages(query, perPage);
});

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
  renderFavorites();
  document.getElementById('year').textContent = new Date().getFullYear();

  // ===== RECHERCHE PAR DÉFAUT =====
  fetchImages("nature", parseInt(perPageSelect.value, 10));
});

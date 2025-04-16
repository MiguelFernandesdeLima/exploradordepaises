// Variáveis globais
let allCountries = [];
let filteredCountries = [];
let currentPage = 1;
const countriesPerPage = 10;

// Elementos DOM
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const regionFilter = document.getElementById('region-filter');
const sortBy = document.getElementById('sort-by');
const countriesContainer = document.getElementById('countries-container');
const loadingSpinner = document.getElementById('loading-spinner');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchCountries);
searchInput.addEventListener('input', handleSearch);
searchBtn.addEventListener('click', handleSearch);
regionFilter.addEventListener('change', filterCountries);
sortBy.addEventListener('change', sortCountries);
prevPageBtn.addEventListener('click', goToPrevPage);
nextPageBtn.addEventListener('click', goToNextPage);

// Função para buscar países da API
async function fetchCountries() {
    try {
        loadingSpinner.classList.add('active');
        countriesContainer.innerHTML = '';
        
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Falha ao carregar os países');
        }
        
        allCountries = await response.json();
        filteredCountries = [...allCountries];
        
        sortCountries();
        displayCountries();
    } catch (error) {
        console.error('Erro ao buscar países:', error);
        countriesContainer.innerHTML = `
            <div class="error-message">
                <p>Ocorreu um erro ao carregar os países. Por favor, tente novamente mais tarde.</p>
            </div>
        `;
    } finally {
        loadingSpinner.classList.remove('active');
    }
}

// Função para exibir países na página atual
function displayCountries() {
    const startIndex = (currentPage - 1) * countriesPerPage;
    const endIndex = startIndex + countriesPerPage;
    const countriesToDisplay = filteredCountries.slice(startIndex, endIndex);
    
    countriesContainer.innerHTML = '';
    
    if (countriesToDisplay.length === 0) {
        countriesContainer.innerHTML = `
            <div class="no-results">
                <p>Nenhum país encontrado com os critérios atuais.</p>
            </div>
        `;
        return;
    }
    
    countriesToDisplay.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        
        countryCard.innerHTML = `
            <img src="${country.flags?.png || ''}" alt="Bandeira de ${country.name?.common || 'País desconhecido'}" class="country-flag">
            <div class="country-info">
                <h3 class="country-name">${country.name?.common || 'País desconhecido'}</h3>
                <p class="country-detail"><span>Capital:</span> ${country.capital?.[0] || 'N/A'}</p>
                <p class="country-detail"><span>População:</span> ${country.population ? country.population.toLocaleString() : 'N/A'}</p>
                <p class="country-detail"><span>Região:</span> ${country.region || 'N/A'}</p>
            </div>
        `;
        
        countriesContainer.appendChild(countryCard);
    });
    
    updatePagination();
}

// Função para lidar com a pesquisa
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    filteredCountries = allCountries.filter(country => 
        country.name?.common.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    displayCountries();
}

// Função para filtrar por região
function filterCountries() {
    const region = regionFilter.value;
    
    if (!region) {
        filteredCountries = [...allCountries];
    } else {
        filteredCountries = allCountries.filter(country => 
            country.region === region
        );
    }
    
    currentPage = 1;
    sortCountries();
}

// Função para ordenar países
function sortCountries() {
    const sortValue = sortBy.value;
    
    switch (sortValue) {
        case 'name-asc':
            filteredCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            break;
        case 'name-desc':
            filteredCountries.sort((a, b) => b.name.common.localeCompare(a.name.common));
            break;
        case 'population-asc':
            filteredCountries.sort((a, b) => (a.population || 0) - (b.population || 0));
            break;
        case 'population-desc':
            filteredCountries.sort((a, b) => (b.population || 0) - (a.population || 0));
            break;
        default:
            filteredCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    }
    
    displayCountries();
}

// Funções de paginação
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayCountries();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayCountries();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
}

countryCard.addEventListener('click', () => showCountryDetails(country));

searchInput.addEventListener('input', debounce(showSearchSuggestions, 300));

const toggleTheme = () => document.body.classList.toggle('dark-theme');

function toggleFavorite(countryCode) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    // ... lógica para adicionar/remover
}

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}
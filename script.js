class BaseManager {
    saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadFromLocalStorage(key) {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : [];
    }
}

// Class to manage favorite images
class FavoriteManager extends BaseManager {
    constructor() {
        super();
        this.favorites = this.loadFromLocalStorage('favorites');
    }

    addFavorite(imageUrl, breedName) {
        const favoriteItem = { imageUrl, breedName };
        if (!this.favorites.some(fav => fav.imageUrl === imageUrl)) {
            this.favorites.push(favoriteItem);
            this.saveToLocalStorage('favorites', this.favorites);
            this.renderFavorites(); // Ensure the favorites list is updated
            this.showToast(`Added to favorites: ${breedName}`);
        } else {
            this.showToast(`Already in favorites: ${breedName}`, 'warning');
        }
    }
    

    removeFavorite(imageUrl) {
        this.favorites = this.favorites.filter(fav => fav.imageUrl !== imageUrl);
        this.saveToLocalStorage('favorites', this.favorites);
        this.renderFavorites();
        this.showToast('Removed from favorites.');
    }

    renderFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        favoritesList.innerHTML = '';
        this.favorites.forEach(favorite => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${favorite.imageUrl}" alt="Favorite Image">
                <span>${favorite.breedName}</span>
                <button onclick="favoritesManager.removeFavorite('${favorite.imageUrl}')">Remove</button>
            `;
            favoritesList.appendChild(li);
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Class to manage API calls
class DogDataManager {
    static async fetchRandomDogImage() {
        const apiUrl = 'https://dog.ceo/api/breed/hound/images/random';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch image');
            const data = await response.json();
            const breedName = DogDataManager.extractBreedName(data.message);
            return { imageUrl: data.message, breedName };
        } catch (error) {
            console.error('Error fetching dog image:', error.message);
            alert('Failed to fetch random dog image.');
            return null;
        }
    }

    static async fetchRandomDogFact() {
        const apiUrl = 'https://dogapi.dog/api/facts';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch fact');
            const data = await response.json();
            return data.facts[0];
        } catch (error) {
            console.error('Error fetching dog fact:', error.message);
            alert('Failed to fetch random dog fact.');
            return null;
        }
    }

    static extractBreedName(imageUrl) {
        const breedPattern = /\/breeds\/([^/]+)\//;
        const match = imageUrl.match(breedPattern);
        return match && match[1] ? match[1].replace(/-/g, ' ') : 'Unknown Breed';
    }
}

// Display image and breed name in the DOM
function displayImage(imageUrl, breedName) {
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = `
        <img src="${imageUrl}" alt="Random Dog">
        <p>Breed: ${breedName}</p>
        <button onclick="favoritesManager.addFavorite('${imageUrl}', '${breedName}')">Add to Favorites</button>
    `;
}

// Display fact in the DOM
function displayFact(fact) {
    const factContainer = document.getElementById('fact-container');
    factContainer.textContent = fact;
}

// Event listeners
async function handleFetchImage() {
    const dogData = await DogDataManager.fetchRandomDogImage();
    if (dogData) {
        displayImage(dogData.imageUrl, dogData.breedName);
    }
}

async function handleFetchFact() {
    const fact = await DogDataManager.fetchRandomDogFact();
    if (fact) {
        displayFact(fact);
    }
}

document.getElementById('fetch-image').addEventListener('click', handleFetchImage);
document.getElementById('fetch-fact').addEventListener('click', handleFetchFact);

document.getElementById('search-favorites').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    const filteredFavorites = favoritesManager.favorites.filter(fav =>
        fav.breedName.toLowerCase().includes(query)
    );

    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';
    filteredFavorites.forEach(favorite => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${favorite.imageUrl}" alt="Favorite Image">
            <span>${favorite.breedName}</span>
            <button onclick="favoritesManager.removeFavorite('${favorite.imageUrl}')">Remove</button>
        `;
        favoritesList.appendChild(li);
    });
});

document.getElementById('clear-search').addEventListener('click', () => {
    document.getElementById('search-favorites').value = '';
    favoritesManager.renderFavorites();
});

// Initialize FavoriteManager
const favoritesManager = new FavoriteManager();
favoritesManager.renderFavorites();

document.getElementById('image-container').addEventListener('dblclick', event => {
    const imageElement = event.target.closest('img');
    if (imageElement) {
        const imageUrl = imageElement.src;
        const breedElement = imageElement.nextElementSibling;
        const breedName = breedElement ? breedElement.textContent.replace('Breed: ', '').trim() : 'Unknown Breed';
        favoritesManager.addFavorite(imageUrl, breedName);
        favoritesManager.renderFavorites();
    }
});

// Add toast notification styles
document.head.insertAdjacentHTML('beforeend', ``);



// home.js - Load dynamic tariffs on home page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadTariffsOnHomePage();
    } catch (error) {
        console.error('Error loading tariffs on home page:', error);
        // Keep static content if loading fails
    }
});

// Load tariffs from backend and update home page
async function loadTariffsOnHomePage() {
    try {
        const tariffsData = await window.authManager.getTariffs();
        
        if (tariffsData.results && tariffsData.results.length > 0) {
            updateHomeTariffs(tariffsData.results.slice(0, 2)); // Show only first 2 tariffs
        }
        
    } catch (error) {
        console.error('Error loading tariffs:', error);
        // Keep default static tariffs if backend fails
    }
}

// Update tariffs section on home page
function updateHomeTariffs(tariffs) {
    const rateSection = document.querySelector('.rate__section');
    if (!rateSection) return;
    
    // Clear existing tariffs
    rateSection.innerHTML = '';
    
    tariffs.forEach((tariff, index) => {
        const tariffBox = createHomeTariffBox(tariff, index);
        rateSection.appendChild(tariffBox);
    });
}

// Create tariff box for home page
function createHomeTariffBox(tariff, index) {
    const tariffBox = document.createElement('div');
    tariffBox.className = 'rate__box';
    
    // Create features list (show only first 6 features)
    const displayFeatures = tariff.features.slice(0, 6);
    const featuresList = displayFeatures.map(feature => 
        `<li class="rate__box-item">${feature}</li>`
    ).join('');
    
    tariffBox.innerHTML = `
        <div class="rate__box-title">${tariff.name}</div>
        <div class="rate__box-bio">${tariff.description}</div>
        <ul class="rate__box-list">
            ${featuresList}
        </ul>
        <div class="rate__box-bottom">
            <span class="rate__box-price">${Math.floor(tariff.price)} ₽</span>
            <a href="order.html" class="rate__box-order">
                <span class="rate__box-order--title">Заказать</span>
            </a>
        </div>
    `;
    
    return tariffBox;
}
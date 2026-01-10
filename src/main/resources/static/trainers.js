document.addEventListener('DOMContentLoaded', () => {
    fetchTrainers();
});

async function fetchTrainers() {
    const userEmail = localStorage.getItem('userEmail');
    const allGrid = document.getElementById('allTrainersGrid');
    const recGrid = document.getElementById('recommendedGrid');
    const recSection = document.getElementById('recommendedSection');

    try {
        // 1. Fetch Recommendations specifically for this user
        let recommendedIds = [];
        if (userEmail) {
            const recResponse = await fetch(`/api/trainers/recommend?userEmail=${userEmail}`);
            if (recResponse.ok) {
                const recTrainers = await recResponse.json();
                if (recTrainers.length > 0) {
                    recSection.style.display = 'block';
                    renderTrainers(recTrainers, recGrid);
                    recommendedIds = recTrainers.map(t => t.id);
                }
            }
        }

        // 2. Fetch All Trainers
        const allResponse = await fetch('/api/trainers');
        if (allResponse.ok) {
            let allTrainers = await allResponse.json();

            // Filter out those already shown in recommended
            if (recommendedIds.length > 0) {
                allTrainers = allTrainers.filter(t => !recommendedIds.includes(t.id));
            }

            renderTrainers(allTrainers, allGrid);
        } else {
            allGrid.innerHTML = '<p style="text-align:center;">Failed to load trainers.</p>';
        }

    } catch (error) {
        console.error('Error loading trainers:', error);
        allGrid.innerHTML = '<p style="text-align:center;">Error loading trainers.</p>';
    }
}

function renderTrainers(trainers, gridElement) {
    gridElement.innerHTML = '';

    if (trainers.length === 0) {
        gridElement.innerHTML = '<p style="color:#666;">No trainers found.</p>';
        return;
    }

    trainers.forEach(t => {
        const card = document.createElement('div');
        card.className = 'trainer-card';

        card.innerHTML = `
            <div class="trainer-img-wrapper">
                <img src="${t.imageUrl || 'https://via.placeholder.com/300x220?text=Trainer'}" class="trainer-img" alt="${t.name}">
                <div class="specialization-badge">${t.specialization}</div>
            </div>
            <div class="trainer-info">
                <div class="trainer-name">${t.name}</div>
                <div class="trainer-exp">${t.experienceYears} Years Experience</div>
                <div class="trainer-bio">${t.bio}</div>
                <a href="mailto:${t.contactEmail}" class="contact-btn">Contact</a>
            </div>
        `;
        gridElement.appendChild(card);
    });
}
async function applyFilters() {
    const userEmail = localStorage.getItem('userEmail');
    const name = document.getElementById('filterName').value;
    const type = document.getElementById('filterType').value;
    const location = document.getElementById('filterLocation').value;
    const availability = document.getElementById('filterAvailability').value;

    const allGrid = document.getElementById('allTrainersGrid');
    const recSection = document.getElementById('recommendedSection');

    allGrid.innerHTML = '<p style="text-align:center; width:100%;">Searching...</p>';
    recSection.style.display = 'none'; // Hide recommendations during explicit search

    try {
        const url = `/api/trainers/recommend?userEmail=${userEmail}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}&location=${encodeURIComponent(location)}&availability=${encodeURIComponent(availability)}`;
        const response = await fetch(url);
        if (response.ok) {
            const trainers = await response.json();
            renderTrainers(trainers, allGrid);
        } else {
            allGrid.innerHTML = '<p style="text-align:center; width:100%;">Search failed.</p>';
        }
    } catch (error) {
        console.error('Search error:', error);
        allGrid.innerHTML = '<p style="text-align:center; width:100%;">Error during search.</p>';
    }
}

// make function visible to HTML onclick
window.applyFilters = applyFilters;

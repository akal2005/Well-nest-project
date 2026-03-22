document.addEventListener('DOMContentLoaded', () => {
    initCravingTracker();
});

let cravingChart = null;

async function initCravingTracker() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    await loadHistory(userId);
}

async function loadHistory(userId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/craving/history/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        
        renderChart(data);
    } catch (err) {
        console.error(err);
    }
}

function renderChart(logs) {
    const ctx = document.getElementById('cravingChart').getContext('2d');
    
    // Sort logs by timestamp ascending for the chart
    const sortedLogs = [...logs].reverse(); // history is desc, so reverse for timeline
    
    const labels = sortedLogs.map(log => {
        const d = new Date(log.timestamp);
        return `${d.getMonth()+1}/${d.getDate()}`;
    });
    
    const intensityData = sortedLogs.map(log => log.intensity);
    const stressData = sortedLogs.map(log => log.stressLevel);

    if (cravingChart) cravingChart.destroy();

    cravingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Craving Intensity',
                    data: intensityData,
                    borderColor: '#18b046',
                    backgroundColor: 'rgba(24, 176, 70, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Stress Level',
                    data: stressData,
                    borderColor: '#ff4b2b',
                    backgroundColor: 'rgba(255, 75, 43, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#aaa' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#aaa' }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });
}

async function saveCraving() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const intensity = document.getElementById('intensity').value;
    const stress = document.getElementById('stress').value;
    const mood = document.getElementById('mood').value;
    
    if (!token || !userId) {
        alert("Session expired. Please login again.");
        window.location.href = 'login.html';
        return;
    }

    const payload = {
        userId: parseInt(userId),
        intensity: parseInt(intensity),
        stressLevel: parseInt(stress),
        moodScore: parseInt(mood),
        highRiskLocation: document.getElementById('triggerLocation').checked,
        socialTrigger: document.getElementById('triggerSocial').checked,
        workStress: document.getElementById('triggerWork').checked,
        fatigue: document.getElementById('triggerFatigue') ? document.getElementById('triggerFatigue').checked : false,
        hunger: document.getElementById('triggerHunger') ? document.getElementById('triggerHunger').checked : false,
        pain: document.getElementById('triggerPain') ? document.getElementById('triggerPain').checked : false,
        medicationTaken: document.getElementById('triggerMed') ? document.getElementById('triggerMed').checked : false,
        socialContext: "User Logged"
    };

    try {
        const resp = await fetch('/api/craving/log', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            alert("Craving logged successfully!");
            loadHistory(userId);
        } else {
            const err = await resp.text();
            alert("Error: " + err);
        }
    } catch (err) {
        alert("Network error: " + err.message);
    }
}

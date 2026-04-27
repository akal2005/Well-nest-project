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

let cravingHistoryData = [];

function renderChart(logs) {
    cravingHistoryData = logs;
    const ctx = document.getElementById('cravingChart').getContext('2d');

    // Sort logs by timestamp ascending for the chart
    const sortedLogs = [...logs].reverse();

    const labels = sortedLogs.map(log => {
        const d = new Date(log.timestamp);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    // Add a trailing 'Now' label for the live preview
    labels.push('Now (Preview)');

    const intensityData = sortedLogs.map(log => log.intensity);
    const stressData = sortedLogs.map(log => log.stressLevel);

    // Push the current slider values as the live preview data point
    const currentIntensity = document.getElementById('intensity') ? document.getElementById('intensity').value : 0;
    const currentStress = document.getElementById('stress') ? document.getElementById('stress').value : 0;
    intensityData.push(currentIntensity);
    stressData.push(currentStress);

    if (cravingChart) cravingChart.destroy();

    cravingChart = new Chart(ctx, {
        type: 'bar', // Changed from line to bar as requested
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Craving Intensity',
                    data: intensityData,
                    backgroundColor: 'rgba(24, 176, 70, 0.8)',
                    borderColor: '#18b046',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Stress Level',
                    data: stressData,
                    backgroundColor: 'rgba(255, 75, 43, 0.8)',
                    borderColor: '#ff4b2b',
                    borderWidth: 1,
                    borderRadius: 4
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

    // Attach real-time update listeners to sliders
    setupLivePreview();
}


function setupLivePreview() {
    const updatePreview = () => {
        if (!cravingChart) return;
        const currentIntensity = parseInt(document.getElementById('intensity').value) || 0;
        const currentStress = parseInt(document.getElementById('stress').value) || 0;

        // Update the last data point in the chart
        const lastIndex = cravingChart.data.labels.length - 1;
        cravingChart.data.datasets[0].data[lastIndex] = currentIntensity;
        cravingChart.data.datasets[1].data[lastIndex] = currentStress;

        // Also update the static stress slider at the bottom snapshot
        const snapshotSlider = document.getElementById('aiStressSnapshot');
        if (snapshotSlider) {
            snapshotSlider.value = currentStress;
        }

        cravingChart.update();
    };

    ['intensity', 'stress', 'mood'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePreview);
        }
    });

    // --- NEW: Dynamic AI Trigger Snapshot Logic ---
    const triggerMappings = [
        { id: 'triggerLocation', name: 'HIGH-RISK LOCATION', suggestion: 'Leave the area immediately and call your sponsor or a safe connection.' },
        { id: 'triggerSocial', name: 'SOCIAL ENVIRONMENT', suggestion: 'Avoid crowded bars this weekend or politely excuse yourself from toxic peers.' },
        { id: 'triggerWork', name: 'WORK STRESS', suggestion: 'Take a 5-minute deep-breathing break away from your desk right now.' },
        { id: 'triggerFatigue', name: 'SEVERE FATIGUE', suggestion: 'Your willpower is low because you are tired. Prioritize 8 hours of sleep tonight.' },
        { id: 'triggerHunger', name: 'HUNGER SPIKE', suggestion: 'Eat a protein-rich snack immediately. Low blood sugar triggers cravings.' },
        { id: 'triggerPain', name: 'PHYSICAL PAIN', suggestion: 'Use prescribed non-addictive pain relief methods or gentle stretching.' },
        { id: 'triggerMed', name: 'MEDICATION REACTION', suggestion: 'Log this interaction and consult your healthcare provider if cravings persist.' }
    ];

    const updateAITriggerSnapshot = () => {
        const topTriggerEl = document.getElementById('aiTopTrigger');
        const aiSuggestionEl = document.getElementById('aiSuggestionText');
        if (!topTriggerEl || !aiSuggestionEl) return;

        // Find the first checked trigger
        let foundTrigger = null;
        for (let mapping of triggerMappings) {
            const checkbox = document.getElementById(mapping.id);
            if (checkbox && checkbox.checked) {
                foundTrigger = mapping;
                break; // Just pick the top/first one selected for the snapshot
            }
        }

        if (foundTrigger) {
            topTriggerEl.innerText = foundTrigger.name;
            topTriggerEl.style.color = '#ff4b2b'; // Make it red to indicate danger
            aiSuggestionEl.innerText = `AI suggests: "${foundTrigger.suggestion}"`;
        } else {
            topTriggerEl.innerText = 'NO KNOWN TRIGGERS';
            topTriggerEl.style.color = '#18b046'; // Green for safe
            aiSuggestionEl.innerText = 'AI suggests: "Maintain your healthy routine and log if anything changes."';
        }
    };

    // Attach listener to all checkboxes
    triggerMappings.forEach(mapping => {
        const cb = document.getElementById(mapping.id);
        if (cb) {
            cb.addEventListener('change', updateAITriggerSnapshot);
        }
    });

    // Run once on load to set initial state
    updateAITriggerSnapshot();
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

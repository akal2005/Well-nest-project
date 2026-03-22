const COUNSELLOR_API_BASE = '/api/counsellor';
let currentCounsellingChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Only fetch if on trainer dashboard
    if (window.location.pathname.includes('trainer-home.html')) {
        fetchRecoveringUsers();
    }
});

async function fetchRecoveringUsers() {
    try {
        const response = await fetch(`${COUNSELLOR_API_BASE}/users`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });

        if (!response.ok) throw new Error('Failed to fetch recovering users');

        const users = await response.json();
        const listEl = document.getElementById('counsellingUserList');
        listEl.innerHTML = '';

        if (users.length === 0) {
            listEl.innerHTML = '<p style="color:#888; font-size: 12px;">No patients found.</p>';
            return;
        }

        users.forEach(user => {
            const li = document.createElement('li');
            li.style.padding = '10px';
            li.style.cursor = 'pointer';
            li.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            li.style.transition = 'background 0.3s';
            li.style.borderRadius = '6px';
            li.innerHTML = `
                <div style="font-weight:bold; color:#fff; font-size:14px;">${user.fullName}</div>
                <div style="font-size:11px; color:#aaa;">Goal: ${user.goal}</div>
            `;

            li.addEventListener('mouseover', () => li.style.background = 'rgba(24, 176, 70, 0.1)');
            li.addEventListener('mouseout', () => li.style.background = 'transparent');

            li.addEventListener('click', () => {
                // Highlight active
                Array.from(listEl.children).forEach(child => child.style.borderLeft = 'none');
                li.style.borderLeft = '3px solid #18b046';

                loadUserCravingGraph(user.id, user.fullName);
            });

            listEl.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching recovering users:", error);
        document.getElementById('counsellingUserList').innerHTML = '<p style="color:#ff4d4d; font-size: 12px;">Error loading users.</p>';
    }
}

async function loadUserCravingGraph(userId, userName) {
    document.getElementById('emptyGraphState').style.display = 'none';
    document.getElementById('graphHeader').style.display = 'block';
    document.getElementById('chartContainer').style.display = 'block';
    document.getElementById('selectedPatientName').textContent = userName;

    try {
        const response = await fetch(`${COUNSELLOR_API_BASE}/user/${userId}/cravings`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });

        if (!response.ok) throw new Error('Failed to fetch craving data');

        const logs = await response.json();
        renderCravingGraph(logs);

    } catch (error) {
        console.error("Error fetching graph data:", error);
    }
}

function renderCravingGraph(logs) {
    const ctx = document.getElementById('counsellingChart').getContext('2d');

    if (currentCounsellingChart) {
        currentCounsellingChart.destroy();
    }

    if (!logs || logs.length === 0) {
        currentCounsellingChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['No Data'], datasets: [{ label: 'No records found', data: [0] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
        return;
    }

    // Process logs: We want to show a sequence. Let's group by day or just show the last 7 entries.
    // To make it look like a weekly progress report, let's take the last 7 entries, reverse them for chronological order.
    const recentLogs = logs.slice(0, 7).reverse();

    const labels = recentLogs.map(log => {
        const d = new Date(log.timestamp);
        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    });

    const intensityData = recentLogs.map(log => log.intensity);
    const stressData = recentLogs.map(log => log.stressLevel);

    currentCounsellingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Craving Intensity (0-10)',
                    data: intensityData,
                    backgroundColor: 'rgba(24, 176, 70, 0.7)',
                    borderColor: '#18b046',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Stress/Anxiety Level (0-10)',
                    data: stressData,
                    backgroundColor: 'rgba(255, 77, 77, 0.7)',
                    borderColor: '#ff4d4d',
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
}

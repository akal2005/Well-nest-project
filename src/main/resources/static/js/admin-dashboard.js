const API_BASE_URL = "http://localhost:8081/api";

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is actually an ADMIN
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
        alert("Access Denied: Admin privileges required.");
        window.location.href = "login.html";
        return;
    }

    loadStats();
    loadUsers();
    loadTrainers();
    loadLogs();
});

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (!response.ok) throw new Error("Failed to fetch stats");

        const stats = await response.json();
        document.getElementById("totalUsers").innerText = stats.totalUsers || 0;
        document.getElementById("totalTrainers").innerText = stats.totalTrainers || 0;
        document.getElementById("totalLogs").innerText = (stats.totalMealLogs + stats.totalWorkoutLogs) || 0;

    } catch (error) {
        console.error("Stats Error:", error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const users = await response.json();
        const userList = document.getElementById("userList");
        userList.innerHTML = "";

        users.forEach(user => {
            // Mock AI Risk Score (Craving Forecasting & Relapse Prediction Module)
            const riskLevels = ["Low", "Moderate", "High"];
            const riskColors = { "Low": "#10b981", "Moderate": "#f59e0b", "High": "#ef4444" };
            const riskScore = riskLevels[user.id % 3] || "Low";
            const riskColor = riskColors[riskScore];

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${user.goal || 'N/A'}</td>
                <td><span class="role-badge" style="background: ${riskColor}33; color: ${riskColor}; border: 1px solid ${riskColor}88;">${riskScore} Risk</span></td>
                <td>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            userList.appendChild(tr);
        });
    } catch (error) {
        console.error("User List Error:", error);
    }
}

async function loadTrainers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/trainers`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const trainers = await response.json();
        const trainerList = document.getElementById("trainerList");
        trainerList.innerHTML = "";

        trainers.forEach(trainer => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${trainer.imageUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                        ${trainer.name}
                    </div>
                </td>
                <td>${trainer.specialization}</td>
                <td>${trainer.experienceYears} Years</td>
                <td>
                    <button class="btn-delete" onclick="deleteTrainer(${trainer.id})">Remove</button>
                </td>
            `;
            trainerList.appendChild(tr);
        });
    } catch (error) {
        console.error("Trainer List Error:", error);
    }
}

async function loadLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/logs`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const logs = await response.json();
        const logList = document.getElementById("logList");
        logList.innerHTML = "";

        logs.forEach(log => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td><span class="role-badge" style="background: rgba(24, 176, 70, 0.1); color: #18b046;">${log.action}</span></td>
                <td>${log.userEmail || '-'}</td>
                <td>${log.details}</td>
                <td>
                    <span style="color: ${log.severity === 'WARNING' ? '#ef4444' : (log.severity === 'ERROR' ? '#f59e0b' : '#10b981')}">
                        ${log.severity}
                    </span>
                </td>
            `;
            logList.appendChild(tr);
        });
    } catch (error) {
        console.error("Activity Logs Error:", error);
    }
}

async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            alert("User deleted successfully.");
            loadUsers();
            loadStats();
        } else {
            alert("Failed to delete user.");
        }
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

async function deleteTrainer(id) {
    if (!confirm("Are you sure you want to remove this trainer?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/trainers/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            alert("Trainer removed successfully.");
            loadTrainers();
            loadStats();
        } else {
            alert("Failed to remove trainer.");
        }
    } catch (error) {
        console.error("Delete Trainer Error:", error);
    }
}

function loadCrisisAlerts() {
    const crisisList = document.getElementById("crisisList");
    if (!crisisList) return;
    crisisList.innerHTML = "";

    // Mock Data mimicking "Continuous Emotional Monitoring" & "Crisis Detection" Modules
    const mockAlerts = [
        { id: 101, timestamp: new Date().toISOString(), user: "user01@wellnest.com", trigger: "Feeling completely hopeless today... I might relapse.", risk: "High" },
        { id: 102, timestamp: new Date(Date.now() - 3600000).toISOString(), user: "client_b@domain.com", trigger: "The cravings are getting unbearable.", risk: "High" },
        { id: 103, timestamp: new Date(Date.now() - 7200000).toISOString(), user: "test.user@mail.com", trigger: "I'm so stressed out lately.", risk: "Moderate" }
    ];

    mockAlerts.forEach(alert => {
        const riskColor = alert.risk === 'High' ? '#ef4444' : '#f59e0b';
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${new Date(alert.timestamp).toLocaleString()}</td>
            <td>${alert.user}</td>
            <td><em>"${alert.trigger}"</em></td>
            <td><span class="role-badge" style="background: ${riskColor}33; color: ${riskColor}; border: 1px solid ${riskColor};">${alert.risk}</span></td>
            <td><button class="btn-delete" onclick="resolveCrisis(this)" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981;">Resolve</button></td>
        `;
        crisisList.appendChild(tr);
    });
}

window.resolveCrisis = function (btn) {
    if (confirm("Escalate to counselor or mark as resolved?\\n\\nClick OK to resolve, Cancel to keep open.")) {
        btn.parentElement.parentElement.remove();
    }
}

function loadGeoAlerts() {
    const geoList = document.getElementById("geoList");
    if (!geoList) return;
    geoList.innerHTML = "";

    const mockAlerts = [
        { id: 201, timestamp: new Date().toISOString(), user: "user_x@wellnest.com", trigger: "Old Downtown Pub", status: "Within 50m", action: "Push notification sent: Coping Exercise" },
        { id: 202, timestamp: new Date(Date.now() - 5400000).toISOString(), user: "client_b@domain.com", trigger: "City Casino Resort", status: "Active Breach", action: "Alert sent to Coach Sarah" },
        { id: 203, timestamp: new Date(Date.now() - 14400000).toISOString(), user: "demo.user@test.com", trigger: "Known Triggers Sector 4", status: "Passing By", action: "None (Route safe)" }
    ];

    mockAlerts.forEach(alert => {
        let badgeColor = "#10b981"; // Green by default
        if (alert.status.includes("Breach")) badgeColor = "#ef4444";
        else if (alert.status.includes("Within")) badgeColor = "#f59e0b";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${new Date(alert.timestamp).toLocaleString()}</td>
            <td>${alert.user}</td>
            <td style="color: #8b5cf6; font-weight: bold;">${alert.trigger}</td>
            <td><span class="role-badge" style="background: ${badgeColor}33; color: ${badgeColor}; border: 1px solid ${badgeColor};">${alert.status}</span></td>
            <td>${alert.action}</td>
        `;
        geoList.appendChild(tr);
    });
}

function switchTab(tab) {
    const usersTable = document.getElementById("usersTable");
    const trainersTable = document.getElementById("trainersTable");
    const logsTable = document.getElementById("logsTable");
    const crisisTable = document.getElementById("crisisTable");
    const geoTable = document.getElementById("geoTable");
    const btns = document.querySelectorAll(".tabs .tab-btn");

    btns.forEach(btn => btn.classList.remove("active"));

    usersTable.style.display = "none";
    trainersTable.style.display = "none";
    if (logsTable) logsTable.style.display = "none";
    if (crisisTable) crisisTable.style.display = "none";
    if (geoTable) geoTable.style.display = "none";

    if (tab === 'users') {
        usersTable.style.display = "block";
        btns[0].classList.add("active");
    } else if (tab === 'trainers') {
        trainersTable.style.display = "block";
        btns[1].classList.add("active");
    } else if (tab === 'logs') {
        if (logsTable) logsTable.style.display = "block";
        if (btns.length > 2) btns[2].classList.add("active");
        loadLogs();
    } else if (tab === 'crisis') {
        if (crisisTable) crisisTable.style.display = "block";
        if (btns.length > 3) btns[3].classList.add("active");
        loadCrisisAlerts();
    } else if (tab === 'geo') {
        if (geoTable) geoTable.style.display = "block";
        if (btns.length > 4) btns[4].classList.add("active");
        loadGeoAlerts();
    }
}

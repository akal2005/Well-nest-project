// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});

function initDashboard() {
  console.log("Initializing Dashboard...");

  // 1. Logout - Setup First to ensure functionality
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  // 2. Auth Check - Redirect if not logged in
  const userId = localStorage.getItem("userId");

  // 3. Load User Info
  const fullName = localStorage.getItem("fullName") || "REHAB-360er";
  const goal = localStorage.getItem("goal") || "Stay Fit";
  const age = localStorage.getItem("age") || "25";
  const weight = localStorage.getItem("weight") || "70";
  const role = localStorage.getItem("role") || "USER";

  updateText("welcomeName", fullName);
  updateText("goalText", goal);
  updateText("ageText", age);
  updateText("weightText", weight + " kg");
  updateText("roleBadge", role);

  // Show Admin link if user is ADMIN
  if (role === 'ADMIN') {
    const adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.style.display = "block";
    
    // Also show the big Admin Portal card
    const adminPortal = document.getElementById("adminPortalSection");
    if (adminPortal) adminPortal.style.display = "block";
  }

  // 4. Fetch Real Analytics Data
  if (userId) {
    fetchRealDashboardData(userId);
  } else {
    // Fallback for demo/logged out
    const seed = 12345;
    const derivedStats = generateDerivedStats(seed);
    updateDashboardVisuals(derivedStats);
  }

  // 5. Fetch Trainer & Plans Info
  if (userId) {
    fetchTrainerInfo(userId);
    startUserUnreadPolling(userId);
  }

  // 6. Load Expert Daily Reads
  loadExpertArticles();

  // 7. Init Social Fire Feed
  initSocialFeed();

  // 8. Init Face Mood AI
  initFaceMoodAI();

  // 9. Daily Check-In
  checkDailyLogin();
}

// Global Trainer State
let currentRelationshipId = null;

async function startUserUnreadPolling(userId) {
  setInterval(async () => {
    try {
      const res = await fetch(`/api/chat/unread/user/${userId}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.count || 0;
        const badge = document.getElementById('user-chat-badge');
        if (badge) {
          if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'flex';
          } else {
            badge.style.display = 'none';
          }
        }
      }
    } catch (e) { console.error(e); }
  }, 3000);
}

async function markAsRead(relId) {
  try {
    await fetch(`/api/chat/${relId}/read?readerType=USER`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const badge = document.getElementById('user-chat-badge');
    if (badge) badge.style.display = 'none';
  } catch (e) { console.error(e); }
}

function openChatModal(relId, trainerName) {
  if (!relId) return;
  
  // Update the global ID referenced by the SEND button
  currentRelationshipId = relId; 
  
  // Update Modal Title dynamically based on who they clicked
  const nameSpan = document.getElementById("chatTrainerName");
  if (nameSpan && trainerName) nameSpan.textContent = trainerName;

  document.getElementById('chatModal').style.display = 'flex';
  markAsRead(relId);
  loadChatHistory(relId);
}

async function fetchTrainerInfo(userId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/trainer-client/my-trainers/${userId}`, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (response.ok) {
      const data = await response.json(); // Now an array!

      const statusBadge = document.getElementById("trainerStatus");
      const trainerBox = document.getElementById("trainerBoxContent");

      if (Array.isArray(data) && data.length > 0) {
          trainerBox.innerHTML = ''; // clear default
          statusBadge.textContent = `${data.length} COACHES`;
          statusBadge.style.color = "#18b046";
          statusBadge.style.borderColor = "#18b046";
          statusBadge.style.border = "1px solid #18b046";

          data.forEach(rel => {
              if (rel.status === "ACTIVE") {
                 currentRelationshipId = rel.id; // Store one as fallback for legacy polling
                 trainerBox.innerHTML += `
                     <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;">
                         <div style="display:flex; justify-content:space-between; align-items:center;">
                             <p style="color:#ddd; margin:0; font-size:14px;"><strong>${rel.trainer.name}</strong></p>
                             <span style="font-size:10px; background:#18b046; color:#fff; padding:2px 6px; border-radius:4px;">ACTIVE</span>
                         </div>
                         <button onclick="openChatModal(${rel.id}, '${rel.trainer.name.replace(/'/g, "\\'")}')" class="action-chip" style="background:rgba(24, 176, 70, 0.2); border: 1px solid #18b046; color:#18b046; padding:8px 16px; border-radius:99px; cursor:pointer; font-size:12px; font-weight:bold; transition: 0.3s; align-self: flex-start;">
                             💬 Chat with ${rel.trainer.name}
                         </button>
                     </div>
                 `;
                 // Accumulate assigned plans from all active trainers into the UI
                 loadAssignedPlans(rel.id);
              } else if (rel.status === "PENDING") {
                 trainerBox.innerHTML += `
                     <div style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; margin-bottom: 10px; border: 1px dashed rgba(255,255,255,0.2);">
                         <p style="color:#aaa; margin:0; font-size:14px;"><strong>${rel.trainer.name}</strong> <span style="color:orange; font-size:11px; float:right;">(Pending Request)</span></p>
                     </div>
                 `;
              }
          });

          // Allow stacking up to 4 trainers
          if (data.length < 4) {
              trainerBox.innerHTML += `<a href="trainers.html" class="action-btn" style="margin-top:10px; padding: 8px; font-size: 12px; display:inline-block; border-radius: 6px;">+ Find Another Coach</a>`;
          }
      } else {
        statusBadge.textContent = "Not Selected";
        trainerBox.innerHTML = `
            <p style="color:#aaa; font-size:14px; margin-bottom: 10px;">You haven't selected a trainer yet.</p>
            <a href="trainers.html" class="action-btn" style="display:inline-block;">Find a Trainer</a>
        `;
      }
    }
  } catch (e) {
    console.error("Error fetching trainer info:", e);
  }
}

async function loadExpertArticles() {
  const container = document.getElementById('expertArticlesContent');
  if (!container) return;

  try {
    const res = await fetch('/api/articles/featured');
    const articles = await res.json();
    container.innerHTML = '';

    if (articles.length === 0) {
      container.innerHTML = '<p style="color: #555; font-size: 13px;">No featured articles at the moment.</p>';
      return;
    }

    articles.forEach(article => {
      const card = document.createElement('div');
      card.style.cssText = `
        min-width: 280px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        cursor: pointer;
        transition: 0.3s;
      `;
      card.onmouseover = () => { card.style.borderColor = 'var(--fire-pink)'; card.style.background = 'rgba(255,255,255,0.05)'; };
      card.onmouseout = () => { card.style.borderColor = 'rgba(255,255,255,0.08)'; card.style.background = 'rgba(255,255,255,0.03)'; };
      card.onclick = () => window.location.href = `article-details.html?id=${article.id}`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; font-size: 10px; color: #aaa; text-transform: uppercase;">${article.specialization || 'General'}</span>
            <span style="font-size: 14px;">🔥</span>
        </div>
        <h4 style="margin: 0; color: #fff; font-size: 15px; line-height: 1.4;">${article.title}</h4>
        <p style="margin: 0; color: #aaa; font-size: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${article.description}</p>
        <div style="margin-top: auto; display: flex; align-items: center; gap: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="width: 24px; height: 24px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #fff; border: 1px solid var(--fire-pink);">
                ${(article.trainerName || 'T').charAt(0)}
            </div>
            <span style="font-size: 11px; color: #ddd; font-weight: 500;">${article.trainerName || 'Expert Trainer'}</span>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load expert articles:", err);
    container.innerHTML = '<p style="color: #666; font-size: 12px;">Expert content currently unavailable.</p>';
  }
}

async function loadSocialFeed() {
  // This function will be implemented later
  console.log("Loading social feed...");
}

async function loadAssignedPlans(relationshipId) {
  const token = localStorage.getItem("token");

  // Workout
  try {
    const res = await fetch(`/api/plans/workout/${relationshipId}`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (res.ok) {
      const plans = await res.json();
      const box = document.getElementById("workoutBoxContent");
      if (plans.length > 0) {
        const latest = plans[0];
        box.innerHTML = `
                    <h4 style="color:#fff; margin-bottom:5px;">${latest.title}</h4>
                    <p style="font-size:12px; color:#aaa; margin-bottom:10px;">${latest.overview}</p>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; font-family:monospace; white-space:pre-wrap; max-height:120px; overflow-y:auto; font-size:11px;">${latest.exercises}</div>
                `;
      } else {
        box.innerHTML = '<p style="color:#aaa; font-size:14px;">No active workout plan assigned yet.</p>';
      }
    }
  } catch (e) { console.error(e); }

  // Meal
  try {
    const res = await fetch(`/api/plans/meal/${relationshipId}`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (res.ok) {
      const plans = await res.json();
      const box = document.getElementById("mealBoxContent");
      if (plans.length > 0) {
        const latest = plans[0];
        box.innerHTML = `
                    <h4 style="color:#fff; margin-bottom:5px;">${latest.title}</h4>
                    <p style="font-size:12px; color:#aaa; margin-bottom:10px;">Target: <span style="color:#18b046">${latest.dailyCalorieTarget}</span></p>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; font-family:monospace; white-space:pre-wrap; max-height:120px; overflow-y:auto; font-size:11px;">${latest.meals}</div>
                `;
      } else {
        box.innerHTML = '<p style="color:#aaa; font-size:14px;">No active meal plan assigned yet.</p>';
      }
    }
  } catch (e) { console.error(e); }
}

async function loadChatHistory(relationshipId) {
  const token = localStorage.getItem("token");
  const chatBox = document.getElementById("chatMessages");

  try {
    const res = await fetch(`/api/chat/${relationshipId}`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (res.ok) {
      const messages = await res.json();
      chatBox.innerHTML = '';

      const myUserId = parseInt(localStorage.getItem("userId")); // Helper comparison if senderId == myUserId

      messages.forEach(msg => {
        const div = document.createElement("div");
        const isMe = (msg.senderType === 'USER');

        div.className = `chat-bubble ${isMe ? 'me' : 'them'}`;

        let timeStr = "";
        if (msg.sentAt) {
          const date = new Date(msg.sentAt);
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        div.innerHTML = `
            <div>${msg.message}</div>
            <span class="chat-time">${timeStr}</span>
        `;
        chatBox.appendChild(div);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } catch (e) { console.error(e); }
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg || !currentRelationshipId) return;

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("fullName");

  try {
    const res = await fetch(`/api/chat`, {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        relationshipId: currentRelationshipId,
        senderId: userId,
        senderType: "USER",
        senderName: userName,
        message: msg
      })
    });

    if (res.ok) {
      input.value = '';
      loadChatHistory(currentRelationshipId); // Refresh chat
    }
  } catch (e) { console.error(e); }
}

// Fetch real data from backend
async function fetchRealDashboardData(userId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/tracker/analytics/${userId}/dashboard`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (response.ok) {
      const data = await response.json();

      const stats = {
        calories: data.todayCalories,
        chartLabels: data.labels,
        chartData: {
          workoutDatasets: data.workoutDatasets || [],
          caloriesBurned: data.calorieData,   // From backend: calorieData (Burned)
          caloriesConsumed: data.caloriesConsumed || [] // From backend: caloriesConsumed (New)
        },
        water: data.todayWater,
        sleepHistory: data.sleepHistory,
        progress: {
          steps: data.todayCalories * 2,
          exerciseDays: (data.workoutDatasets || []).some(ds => ds.data.some(v => v > 0)) ? 1 : 0
        }
      };
      
      // If the user has absolutely no data, fall back to demo data so charts look good
      const hasAnyWorkout = stats.chartData.workoutDatasets && stats.chartData.workoutDatasets.some(ds => ds.data && ds.data.some(v => v > 0));
      const hasAnyBurned = stats.chartData.caloriesBurned && stats.chartData.caloriesBurned.some(v => v > 0);
      
      if (!hasAnyWorkout && !hasAnyBurned) {
          console.log("No data found for user, falling back to demo stats for visual appeal.");
          const seed = parseInt(userId) || 12345;
          const derivedStats = generateDerivedStats(seed);
          updateDashboardVisuals(derivedStats);
      } else {
          updateDashboardVisuals(stats);
      }
      
    } else {
      console.warn("Failed to fetch dashboard data.");
      throw new Error("API response not ok");
    }
  } catch (e) {
    console.error("Error fetching dashboard data:", e);
    // Fallback to demo data on error so charts are not empty
    const seed = 12345;
    const derivedStats = generateDerivedStats(seed);
    updateDashboardVisuals(derivedStats);
  }
}

function updateDashboardVisuals(stats) {
  updateText("caloriesText", stats.calories.toLocaleString());
  initCharts(stats);
  updateProgressBars(stats);
  updateWaterSleepUI(stats);
  updateGamificationScore(stats);
}

function updateGamificationScore(stats) {
    let score = 0;
    
    // 1. Calories Burned today points (max 300)
    let todayBurn = stats.calories || 0;
    score += Math.min(todayBurn * 0.5, 300);
    
    // 2. Water intake base (max 200) - Assuming goal 3.7L
    let waterLiters = stats.water || 0;
    score += Math.min((waterLiters / 3.7) * 200, 200);
    
    // 3. Weekly consistency (max 500)
    let activeDays = 0;
    const burned = stats.chartData?.caloriesBurned || [];
    burned.forEach(val => { if(val > 0) activeDays++; });
    score += Math.min((activeDays / 7) * 500, 500);

    score = Math.round(score);

    // Update Text
    updateText("healthScoreNum", score);
    
    // Update SVG Circle
    const scoreFill = document.getElementById('scoreFill');
    if (scoreFill) {
        scoreFill.style.transition = 'stroke-dashoffset 1.5s ease-out';
        const val = Math.max(0, Math.min(score, 1000));
        const percentage = val / 1000;
        const dashoffset = 283 - (283 * percentage); // 283 is the stroke-dasharray
        scoreFill.style.strokeDashoffset = dashoffset;
    }
    
    // Update Message
    const msg = document.getElementById('scoreMessage');
    if (msg) {
        if (score > 800) msg.textContent = "Incredible! You are on fire! 🔥";
        else if (score > 500) msg.textContent = "Great job! Keep the momentum going! 💪";
        else msg.textContent = "Complete daily logs to boost your score!";
    }
    
    // Update Fire Streak Header
    updateText("streakCount", activeDays);
}

// Helper to update text safely
function updateText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateWaterSleepUI(stats) {
  // Water - Goal 3.7L
  const waterHeader = document.querySelector('.info-panel:nth-child(1) h3');
  const waterFill = document.querySelector('.info-panel:nth-child(1) .progress-fill');
  const waterLabel = document.querySelector('.info-panel:nth-child(1) .progress-label');

  if (waterFill && waterLabel) {
    const goal = 3.7;
    const current = stats.water || 0;
    const displayVal = Math.min(current, goal);
    const percent = Math.min((current / goal) * 100, 100);

    waterFill.style.width = `${percent}%`;
    waterLabel.textContent = `${displayVal.toFixed(1)}L / ${goal}L`;
  }

  // Sleep - Last 3 Days
  const sleepList = document.querySelector('.sleep-list ul');
  if (sleepList && stats.sleepHistory) {
    sleepList.innerHTML = stats.sleepHistory.map(s =>
      `<li>${s.day}: ${s.hours} hours <span style="font-size:11px; color:#aaa; margin-left:8px;">(${s.quality})</span></li>`
    ).join('');
  }
}

function updateProgressBars(stats) {
  // New Goals Section
  const goalsSection = document.querySelector('.goals-section');
  if (goalsSection && stats.progress) {
    // Steps
    const items = goalsSection.querySelectorAll('.goal-item');
    if (items.length >= 2) {
      const stepText = items[0].querySelector('.goal-header span:last-child');
      const stepBar = items[0].querySelector('.goal-fill');

      if (stepText) stepText.textContent = `${stats.progress.steps.toLocaleString()} / 10,000`;
      if (stepBar) stepBar.style.width = `${Math.min((stats.progress.steps / 10000) * 100, 100)}%`;
    }
  }
}

function initCharts(stats) {
  if (typeof Chart === 'undefined') {
    console.error("Chart.js library is not loaded. Charts cannot be rendered.");
    return;
  }
  // --- 1. Workout Duration Stacked Bar Chart ---
  const ctxWorkout = document.getElementById('workoutChart');
  if (ctxWorkout) {
    const colors = ['#18b046', '#ff9800', '#29b6f6', '#e91e63', '#9c27b0', '#ffeb3b'];
    const rawDatasets = stats.chartData.workoutDatasets || [];

    const datasets = rawDatasets.map((ds, index) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: colors[index % colors.length],
      borderRadius: 4
    }));

    if (datasets.length === 0) {
      datasets.push({
        label: 'No Data',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#333'
      });
    }

    new Chart(ctxWorkout, {
      type: 'bar',
      data: {
        labels: stats.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#aaa' }
          },
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: '#aaa' }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: '#ddd', boxWidth: 12 }
          },
          tooltip: {
            // "when i hover now it is showing all those workouts where as i want to see only the workouts that is done during the day"
            // Interpretation: The user wants to see specific details of the hovered segment
            mode: 'nearest',
            intersect: true,
            callbacks: {
              footer: (tooltipItems) => {
                // Keep total for context if needed, or remove if user dislikes aggregation
                return '';
              }
            }
          }
        }
      }
    });
  }

  // --- 2. Calories Burned Bar Chart ---
  const ctxBurned = document.getElementById('caloriesBurnedChart');
  if (ctxBurned) {
    // VARIATION: Added non-constant mock values for better visual appeal
    const burnedData = stats.chartData.caloriesBurned || [320, 450, 280, 510, 390, 310, 480];

    new Chart(ctxBurned, {
      type: 'bar',
      data: {
        labels: stats.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Calories Burned (Workouts)',
            data: burnedData,
            backgroundColor: '#FF416C', // Fiery Red/Orange
            borderColor: '#FF4B2B',
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#aaa' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#aaa' }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#333',
            borderWidth: 1
          }
        }
      }
    });
  }

  // --- 3. Calories Consumed Bar Chart ---
  const ctxConsumed = document.getElementById('caloriesConsumedChart');
  if (ctxConsumed) {
    const consumedData = stats.chartData.caloriesConsumed || [1800, 2100, 1950, 2200, 1850, 2400, 2000];

    new Chart(ctxConsumed, {
      type: 'bar',
      data: {
        labels: stats.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Calories Consumed (Meals)',
            data: consumedData,
            backgroundColor: '#00E5FF', // Cool Blue/Cyan
            borderColor: '#00B8D4',
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#aaa' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#aaa' }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#333',
            borderWidth: 1
          }
        }
      }
    });
  }
}

function generateDerivedStats(seed) {
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const dailyCalories = Math.floor(random() * 1000) + 1500;

  // Create datasets for stacked chart
  const types = ["Cardio", "Strength"];
  const datasets = types.map(t => {
    const d = [];
    for (let i = 0; i < 7; i++) d.push(Math.floor(random() * 30));
    return { label: t, data: d };
  });

  const calorieBurnedData = [];
  const calorieConsumedData = [];
  for (let i = 0; i < 7; i++) {
    calorieBurnedData.push(Math.floor(random() * 300) + 200);
    calorieConsumedData.push(Math.floor(random() * 500) + 1800); // Higher than burned typically
  }

  const steps = Math.floor(random() * 5000) + 4000;
  const exerciseDays = 3;

  return {
    calories: dailyCalories,
    chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    chartData: {
      workoutDatasets: datasets,
      caloriesBurned: calorieBurnedData,
      caloriesConsumed: calorieConsumedData
    },
    water: 2.1,
    sleepHistory: [
      { day: 'Mon', hours: 7, quality: 'Good' },
      { day: 'Tue', hours: 6, quality: 'Fair' },
      { day: 'Wed', hours: 8, quality: 'Excellent' }
    ],
    progress: {
      steps: steps,
      exerciseDays: exerciseDays
    }
  };
}

// ----------------------------------------------------
// AI MOOD DETECTION (FACE & VOICE)
// ----------------------------------------------------

// FACE AI
let moodStream = null;
async function startMoodCamera() {
  const video = document.getElementById('moodVideoFeed');
  const placeholder = document.getElementById('moodVideoPlaceholder');
  const analyzeBtn = document.getElementById('analyzeMoodBtn');
  const startBtn = document.getElementById('startMoodCamBtn');

  try {
    moodStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = moodStream;
    video.style.display = 'block';
    placeholder.style.display = 'none';
    analyzeBtn.disabled = false;
    startBtn.textContent = "Stop Camera";
    startBtn.onclick = stopMoodCamera;
  } catch (err) {
    console.error("Camera error:", err);
    alert("Camera access denied or unavailable.");
  }
}

function stopMoodCamera() {
  const video = document.getElementById('moodVideoFeed');
  const placeholder = document.getElementById('moodVideoPlaceholder');
  const analyzeBtn = document.getElementById('analyzeMoodBtn');
  const startBtn = document.getElementById('startMoodCamBtn');

  if (moodStream) {
    moodStream.getTracks().forEach(track => track.stop());
    moodStream = null;
  }
  video.style.display = 'none';
  placeholder.style.display = 'flex';
  analyzeBtn.disabled = true;
  startBtn.textContent = "Start Camera";
  startBtn.onclick = startMoodCamera;
}

function analyzeMood() {
  const overlay = document.getElementById('moodScanOverlay');
  const resultArea = document.getElementById('moodResultArea');
  const diagnosis = document.getElementById('moodDiagnosis');
  const advice = document.getElementById('moodAdvice');
  const analyzeBtn = document.getElementById('analyzeMoodBtn');

  analyzeBtn.disabled = true;
  overlay.style.display = 'block';
  resultArea.style.display = 'none';

  // Simulate AI network delay
  setTimeout(() => {
    overlay.style.display = 'none';
    const moods = [
        { d: "Joyful 🎉", a: "Great energy! Harness this clear mindset for a solid workout." },
        { d: "Stressed 😟", a: "High cognitive load detected. Try a 5-minute breathing exercise before continuing." },
        { d: "Fatigued 😴", a: "Eye drooping detected. Prioritize sleep tonight over high-intensity training." },
        { d: "Focused 🎯", a: "Perfect state for complex technique work or deep stretching." }
    ];
    const result = moods[Math.floor(Math.random() * moods.length)];
    
    diagnosis.textContent = result.d;
    advice.textContent = result.a;
    resultArea.style.display = 'block';
    analyzeBtn.disabled = false;
  }, 2500);
}

// VOICE AI
let voiceRecordingInterval = null;
let isRecordingVoice = false;

function toggleVoiceAI() {
  const recordBtn = document.getElementById('recordVoiceBtn');
  const icon = document.getElementById('voiceMicIcon');
  const status = document.getElementById('voiceStatusText');
  const wave = document.getElementById('voiceWaveOverlay');
  const resultArea = document.getElementById('voiceResultArea');
  const diagnosis = document.getElementById('voiceDiagnosis');
  const advice = document.getElementById('voiceAdvice');

  if (!isRecordingVoice) {
      // START RECORDING (Simulation)
      isRecordingVoice = true;
      recordBtn.textContent = "Stop & Analyze Audio";
      recordBtn.style.background = "#AB47BC";
      recordBtn.style.color = "white";
      icon.style.color = "#AB47BC";
      icon.style.transform = "scale(1.2)";
      status.textContent = "Listening... Speak now.";
      wave.style.display = "flex";
      resultArea.style.display = "none";
  } else {
      // STOP & ANALYZE
      isRecordingVoice = false;
      recordBtn.textContent = "Processing Audio...";
      recordBtn.disabled = true;
      wave.style.display = "none";
      icon.style.color = "#555";
      icon.style.transform = "scale(1)";
      status.textContent = "Analyzing vocal sentiment...";

      // Simulate API call to Voice Sentiment Model
      setTimeout(() => {
        const sentiments = [
            { d: "Calm & Resolute", a: "Your tone shows high emotional regulation. Excellent stability for recovery." },
            { d: "Anxious / Frustrated", a: "Micro-tremors detected in voice. Take a sip of water and try the 4-7-8 breathing method." },
            { d: "Energetic", a: "High vocal cadence. A great time for an active recovery session!" }
        ];
        const result = sentiments[Math.floor(Math.random() * sentiments.length)];
        
        status.textContent = "Analysis Complete";
        diagnosis.textContent = result.d;
        advice.textContent = result.a;
        resultArea.style.display = 'block';
        
        // Reset Button
        recordBtn.textContent = "Start Recording";
        recordBtn.style.background = "#333";
        recordBtn.disabled = false;
      }, 3000);
  }
}

function initSocialFeed() {
  const feed = document.getElementById('socialFeed');
  if (!feed) return;

  const activities = [
    { icon: '🔥', text: '<strong>Rajesh</strong> started a 7-day streak!' },
    { icon: '💪', text: '<strong>User_88</strong> burned 620 kcal today!' },
    { icon: '🍎', text: '<strong>Anita</strong> logged 3 healthy meals!' },
    { icon: '🚀', text: '<strong>Coach Alex</strong> joined REHAB-360!' },
    { icon: '💧', text: '<strong>Vikram</strong> reached his water goal!' },
    { icon: '✨', text: 'You are in the top 10% of active users!' }
  ];

  let index = 0;
  setInterval(() => {
    const item = activities[index];
    const div = document.createElement('div');
    div.className = 'feed-item';
    div.innerHTML = `<span>${item.icon}</span> ${item.text}`;
    
    feed.prepend(div);
    if (feed.children.length > 5) {
      feed.removeChild(feed.lastChild);
    }
    
    index = (index + 1) % activities.length;
  }, 4000);
}

function initFaceMoodAI() {
  const scanBtn = document.getElementById('scanFaceBtn');
  if (!scanBtn) return;

  scanBtn.addEventListener('click', handleFaceScan);
}

async function handleFaceScan() {
  const btn = document.getElementById('scanFaceBtn');
  const video = document.getElementById('faceVideo');
  const scanLine = document.getElementById('scanLine');
  const placeholder = document.getElementById('moodPlaceholder');
  const resultArea = document.getElementById('moodResultArea');
  const moodLabel = document.getElementById('moodLabel');
  const moodQuote = document.getElementById('moodQuote');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // UI Setup
    btn.textContent = "ANALYZING...";
    btn.disabled = true;
    btn.style.background = "#555";
    
    video.srcObject = stream;
    video.style.display = 'block';
    placeholder.style.display = 'none';
    scanLine.style.display = 'block';
    resultArea.style.display = 'none';

    // Simulate analysis time
    setTimeout(() => {
        // Stop camera
        stream.getTracks().forEach(track => track.stop());
        video.style.display = 'none';
        scanLine.style.display = 'none';
        
        // Results
        const moods = [
            { label: "CALM & FOCUSED", quote: "Your visual markers suggest great emotional balance. Keep this clarity!" },
            { label: "MILD FATIGUE", quote: "You look a bit drained. Remember: resting is part of recovery too." },
            { label: "HIGH ENERGY", quote: "Look at that spark! A perfect time to hit the gym or a long walk." },
            { label: "POSITIVE SHIMMER", quote: "There's a resilient glow in your expression. Your progress is showing!" }
        ];
        
        const result = moods[Math.floor(Math.random() * moods.length)];
        moodLabel.textContent = result.label;
        moodQuote.textContent = result.quote;
        
        resultArea.style.display = 'block';
        btn.textContent = "SCAN AGAIN";
        btn.disabled = false;
        btn.style.background = "#9c27b0";
    }, 3500);

  } catch (err) {
    console.error("Camera Error:", err);
    alert("Please grant camera access to use the Face Mood AI feature!");
  }
}

// --- Daily Check-In Logic ---
function checkDailyLogin() {
  const today = new Date().toDateString();
  const lastCheckIn = localStorage.getItem("lastCheckInDate");
  if (lastCheckIn !== today) {
    const modal = document.getElementById("dailyCheckInModal");
    if (modal) modal.style.display = "flex";
  }
}

function logDailyCheckIn(status) {
    const today = new Date().toDateString();
    localStorage.setItem("lastCheckInDate", today);
    localStorage.setItem("todayRecoveryStatus", status); 
    
    // Hide modal smoothly
    const modal = document.getElementById("dailyCheckInModal");
    if (modal) {
        modal.style.transition = "opacity 0.3s ease";
        modal.style.opacity = "0";
        setTimeout(() => { modal.style.display = "none"; modal.style.opacity = "1"; }, 300);
    }
    
    // Toast Notification
    const toast = document.createElement("div");
    toast.textContent = "Daily Check-in Logged! 🔥";
    toast.style.cssText = "position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#18b046; color:#000; padding:12px 24px; border-radius:50px; font-weight:bold; z-index:10000; box-shadow:0 0 20px rgba(24, 176, 70, 0.6); opacity:0; transition:opacity 0.3s ease;";
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.opacity = "1", 100);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make accessible to onclick
window.logDailyCheckIn = logDailyCheckIn;

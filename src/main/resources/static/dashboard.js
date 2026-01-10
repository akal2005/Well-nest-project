// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
});

function initDashboard() {
  console.log("Initializing Dashboard...");

  // 1. Auth Check - Redirect if not logged in
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  /*
  if (!token) {
      window.location.href = "login.html";
      return;
  }
  */

  // 2. Load User Info
  const fullName = localStorage.getItem("fullName") || "WellNester";
  const goal = localStorage.getItem("goal") || "Stay Fit";
  const age = localStorage.getItem("age") || "25";
  const weight = localStorage.getItem("weight") || "70";
  const role = localStorage.getItem("role") || "USER";

  updateText("welcomeName", fullName);
  updateText("goalText", goal);
  updateText("ageText", age);
  updateText("weightText", weight + " kg");
  updateText("roleBadge", role);

  // 3. Fetch Real Analytics Data
  if (userId) {
    fetchRealDashboardData(userId);
  } else {
    // Fallback for demo/logged out
    const seed = 12345;
    const derivedStats = generateDerivedStats(seed);
    updateDashboardVisuals(derivedStats);
  }

  // 4. Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
}

// Fetch real data from backend
async function fetchRealDashboardData(userId) {
  try {
    const response = await fetch(`/api/tracker/analytics/${userId}/dashboard`);
    if (response.ok) {
      const data = await response.json();
      // Data format: { labels: [], workoutData: [], calorieData: [], todayCalories: 0 }

      // Map to existing visual structure
      const stats = {
        calories: data.todayCalories,
        chartLabels: data.labels, // New field for dynamic labels
        chartData: {
          workout: data.workoutData,
          calories: data.calorieData
        },
        progress: {
          steps: data.todayCalories * 2, // Approximate steps from calories if not tracked separately
          exerciseDays: data.workoutData.filter(d => d > 0).length // Count days with activity
        }
      };
      updateDashboardVisuals(stats);
    } else {
      console.warn("Failed to fetch dashboard data, using simulation.");
      fallbackToSimulation(userId);
    }
  } catch (e) {
    console.error("Error fetching dashboard data:", e);
    fallbackToSimulation(userId);
  }
}

function fallbackToSimulation(userId) {
  const seed = userId ? parseInt(userId) : 12345;
  const derivedStats = generateDerivedStats(seed);
  updateDashboardVisuals(derivedStats);
}

function updateDashboardVisuals(stats) {
  updateText("caloriesText", stats.calories.toLocaleString());
  initCharts(stats);
  updateProgressBars(stats);
  updateHealthSpark(stats);
  fetchSocialFeed(); // NEW FIRE FEATURE
}

async function fetchSocialFeed() {
  const container = document.getElementById("socialFeedContent");
  if (!container) return;

  try {
    const response = await fetch("/api/blog");
    if (response.ok) {
      const posts = await response.json();
      const recentPosts = posts.slice(0, 5); // Take last 5

      if (recentPosts.length === 0) {
        container.innerHTML = '<p style="color: #666; font-size: 13px;">No sparks in the community yet. Be the first!</p>';
        return;
      }

      container.innerHTML = recentPosts.map(post => `
        <div class="glass-card" style="min-width: 200px; padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 65, 108, 0.1);">
          <div style="font-size: 10px; color: #ff416c; text-transform: uppercase; margin-bottom: 5px;">NEW SPARK</div>
          <div style="font-weight: bold; font-size: 13px; color: #fff; margin-bottom: 8px;">${post.title}</div>
          <div style="font-size: 11px; color: #aaa;">by ${post.authorName || 'Member'}</div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.warn("Feeds unavailable, using simulation.");
    container.innerHTML = `
      <div class="glass-card" style="min-width: 200px; padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 65, 108, 0.1);">
        <div style="font-size: 10px; color: #ff416c; text-transform: uppercase; margin-bottom: 5px;">COMMUNITY FIRE</div>
        <div style="font-weight: bold; font-size: 13px; color: #fff; margin-bottom: 8px;">Morning HIIT session crushed!</div>
        <div style="font-size: 11px; color: #aaa;">by Sarah W.</div>
      </div>
      <div class="glass-card" style="min-width: 200px; padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 65, 108, 0.1);">
        <div style="font-size: 10px; color: #ff416c; text-transform: uppercase; margin-bottom: 5px;">RECIPE SPARK</div>
        <div style="font-weight: bold; font-size: 13px; color: #fff; margin-bottom: 8px;">Best protein oats recipe 🔥</div>
        <div style="font-size: 11px; color: #aaa;">by Mike T.</div>
      </div>
    `;
  }
}

// --- NEW FIRE LOGIC ---
function updateHealthSpark(stats) {
  updateHealthScore(stats);
  updateStreak(stats);
}

function updateHealthScore(stats) {
  // Logic: Calculate a score out of 1000
  // 1. Calories Burned today (max 400 pts)
  const calScore = Math.min(400, (stats.calories / 2000) * 400);

  // 2. Exercise Consistency (max 300 pts)
  const exScore = (stats.progress.exerciseDays / 7) * 300;

  // 3. Movement (max 300 pts)
  const moveScore = Math.min(300, (stats.progress.steps / 10000) * 300);

  const totalScore = Math.floor(calScore + exScore + moveScore);

  // Animate Gauge
  const scoreNumEl = document.getElementById("healthScoreNum");
  const scoreFillEl = document.getElementById("scoreFill");

  if (scoreNumEl) {
    animateValue(scoreNumEl, 0, totalScore, 1500);
  }

  if (scoreFillEl) {
    const circumference = 2 * Math.PI * 45; // r=45
    const offset = circumference - (totalScore / 1000) * circumference;
    scoreFillEl.style.strokeDashoffset = offset;
  }
}

function updateStreak(stats) {
  // Logic: Count consecutive days > 0 in workoutData (starting from end)
  let streak = 0;
  const history = stats.chartData.workout || [];
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] > 0) {
      streak++;
    } else {
      break;
    }
  }

  const streakEl = document.getElementById("streakCount");
  if (streakEl) {
    streakEl.textContent = streak;
  }
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Helper to update text safely
function updateText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Keep simulation for fallback
function generateDerivedStats(seed) {
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const dailyCalories = Math.floor(random() * 1000) + 1500;

  const workoutData = [];
  const calorieData = [];
  for (let i = 0; i < 7; i++) {
    // Make them progressively better for a cool streak look
    workoutData.push(Math.floor(random() * 60) + (i > 3 ? 30 : 5));
    calorieData.push(Math.floor(random() * 300) + 200);
  }

  const steps = Math.floor(random() * 5000) + 6000;
  const exerciseDays = workoutData.filter(d => d > 0).length;

  return {
    calories: dailyCalories,
    chartData: {
      workout: workoutData,
      calories: calorieData
    },
    progress: {
      steps: steps,
      exerciseDays: exerciseDays
    }
  };
}

function updateProgressBars(stats) {
  // New Goals Section
  const goalsSection = document.querySelector('.goals-section');
  if (goalsSection) {
    // Steps
    const items = goalsSection.querySelectorAll('.goal-item');
    if (items.length >= 2) {
      // Steps Goal
      const stepItem = items[0];
      const stepText = stepItem.querySelector('.goal-header span:last-child');
      const stepBar = stepItem.querySelector('.goal-fill');
      const stepStatus = stepItem.querySelector('.goal-status');

      if (stepText) stepText.textContent = `${stats.progress.steps.toLocaleString()} / 10,000`;
      if (stepBar) {
        stepBar.style.width = `${(stats.progress.steps / 10000) * 100}%`;
        stepBar.style.background = "var(--fire-gradient)"; // Use fire color!
      }
      if (stepStatus) stepStatus.textContent = stats.progress.steps > 8000 ? "Amazing work! Keep the fire burning!" : "Keep moving!";

      // Exercise Goal
      const exItem = items[1];
      const exText = exItem.querySelector('.goal-header span:last-child');
      const exBar = exItem.querySelector('.goal-fill');

      if (exText) exText.textContent = `${stats.progress.exerciseDays} / 7 days`;
      if (exBar) exBar.style.width = `${(stats.progress.exerciseDays / 7) * 100}%`;
    }
  }
}

function initCharts(stats) {
  // --- 1. Workout Duration Bar Chart (Last 7 Days) ---
  const ctxWorkout = document.getElementById('workoutChart');
  if (ctxWorkout) {
    // Clear old chart if exists
    const existingChart = Chart.getChart(ctxWorkout);
    if (existingChart) existingChart.destroy();

    new Chart(ctxWorkout, {
      type: 'bar',
      data: {
        labels: stats.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Minutes',
          data: stats.chartData.workout,
          backgroundColor: 'rgba(255, 65, 108, 0.4)',
          borderColor: '#FF416C',
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#888' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#888' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // --- 2. Calories Burned Trend Line Chart ---
  const ctxCalories = document.getElementById('caloriesChart');
  if (ctxCalories) {
    const existingChart = Chart.getChart(ctxCalories);
    if (existingChart) existingChart.destroy();

    new Chart(ctxCalories, {
      type: 'line',
      data: {
        labels: stats.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Calories',
          data: stats.chartData.calories,
          borderColor: '#18b046',
          backgroundColor: 'rgba(24, 176, 70, 0.05)',
          borderWidth: 4,
          pointBackgroundColor: '#18b046',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#888' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#888' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#000',
            titleColor: '#18b046',
            bodyColor: '#fff',
            borderColor: '#333',
            borderWidth: 1
          }
        }
      }
    });
  }
}

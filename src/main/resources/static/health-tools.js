// =========================
// GLOBAL STATE
// =========================
let currentUnit = "metric"; // "metric" or "imperial"

// Elements we'll reuse
const bmiForm = document.getElementById("bmi-form");
const bmiResultBox = document.getElementById("bmi-result");
const bmiValueEl = document.getElementById("bmi-value");
const bmiCategoryEl = document.getElementById("bmi-category");
const bmiGuidanceEl = document.getElementById("bmi-guidance");
const bmiMarkerEl = document.getElementById("bmi-marker");

// =========================
// UNIT TOGGLE
// =========================
function setUnit(unit) {
    currentUnit = unit;

    const metricBtn = document.getElementById("metric-btn");
    const imperialBtn = document.getElementById("imperial-btn");

    const metricInputs = document.getElementById("metric-inputs");
    const imperialInputs = document.getElementById("imperial-inputs");
    const weightImperial = document.getElementById("weight-imperial");

    if (unit === "metric") {
        metricBtn.classList.add("active");
        imperialBtn.classList.remove("active");

        metricInputs.style.display = "grid";
        imperialInputs.style.display = "none";
        weightImperial.style.display = "none";
    } else {
        imperialBtn.classList.add("active");
        metricBtn.classList.remove("active");

        metricInputs.style.display = "none";
        imperialInputs.style.display = "grid";
        weightImperial.style.display = "block";
    }
}

// make function visible to HTML onclick
window.setUnit = setUnit;

// =========================
// BMI CALCULATION
// =========================
function classifyBMI(bmi) {
    if (bmi < 18.5) return "underweight"; // < 18.5
    if (bmi < 24.9) return "normal";      // 18.5 - 24.9 (Standard)
    if (bmi < 29.9) return "overweight";  // 25 - 29.9
    return "obese";                       // >= 30
}

function getGuidance(category) {
    switch (category) {
        case "underweight":
            return "You are in the Underweight range. It's time to fuel your flame with more nutrients!";
        case "normal":
            return "Great job! Your health fire is burning perfectly. Keep it up!";
        case "overweight":
            return "You are in the Overweight range. A few small sparks of activity can ignite your journey!";
        case "obese":
            return "You are in the Obese range. Let's work together to manage the heat and improve your health.";
        default:
            return "";
    }
}

function getSmartRecommendations(category) {
    const plans = {
        underweight: [
            "🔥 **Ignite:** Focus on complex carbs like oats and sweet potatoes.",
            "💪 **Forge:** Start light strength training to build muscle.",
            "🥗 **Fuel:** Eat 5 small, nutrient-dense meals a day."
        ],
        normal: [
            "⚡ **Maintain:** Keep your current workout streak alive!",
            "🌱 **Vitalize:** Experiment with new healthy recipes or superfoods.",
            "🧘 **Balance:** Add 10 mins of daily mindfulness to your routine."
        ],
        overweight: [
            "🔥 **Burn:** Aim for 30 mins of brisk walking or swimming daily.",
            "💧 **Flush:** Swap sugary drinks for 2.5L of water daily.",
            "🥗 **Track:** Use our Meal Tracker to watch your portion sizes."
        ],
        obese: [
            "🚶 **Power Walk:** Start with a 15-min walk twice a day.",
            "🍎 **Cleanse:** Focus on whole foods and high-fiber veggies.",
            "👨‍⚕️ **Consult:** Chat with a WellNest Trainer for a safe custom plan."
        ]
    };
    return plans[category] || [];
}

function updateBMIScale(bmi) {
    // Normal range: 18.5 – 24.9. We’ll cap the marker between BMI 13 and 40
    const min = 13;
    const max = 40;
    const clamped = Math.max(min, Math.min(max, bmi));
    const percent = ((clamped - min) / (max - min)) * 100;

    bmiMarkerEl.style.left = `${percent}%`;
}

async function handleBMISubmit(event) {
    event.preventDefault();

    let heightMeters;
    let weightKg;

    if (currentUnit === "metric") {
        const heightCm = parseFloat(document.getElementById("height-cm").value);
        const weight = parseFloat(document.getElementById("weight-kg").value);

        if (!heightCm || !weight) {
            alert("Please enter both height and weight.");
            return;
        }

        heightMeters = heightCm / 100;
        weightKg = weight;
    } else {
        const heightFt = parseFloat(document.getElementById("height-ft").value);
        const heightIn = parseFloat(document.getElementById("height-in").value) || 0;
        const weightLbs = parseFloat(document.getElementById("weight-lbs").value);

        if (!heightFt || !weightLbs) {
            alert("Please enter height (feet) and weight (lbs).");
            return;
        }

        const totalInches = heightFt * 12 + heightIn;
        heightMeters = totalInches * 0.0254;
        weightKg = weightLbs * 0.453592;
    }

    const bmi = weightKg / (heightMeters * heightMeters);
    const rounded = Number(bmi.toFixed(1));
    const categoryKey = classifyBMI(rounded);

    // Remove previous category classes
    bmiCategoryEl.classList.remove("underweight", "normal", "overweight", "obese");

    // Set text + class
    bmiValueEl.textContent = rounded;
    bmiCategoryEl.textContent =
        categoryKey === "normal"
            ? "Normal weight"
            : categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

    bmiCategoryEl.classList.add(categoryKey);
    bmiGuidanceEl.textContent = getGuidance(categoryKey);

    // RENDER SMART PLAN (NEW)
    renderSmartPlan(categoryKey);

    updateBMIScale(rounded);

    bmiResultBox.classList.add("show");

    // APPLY FIRE INTENSITY (NEW)
    applyFireIntensity(categoryKey);

    // =========================
    // OPTIONAL: send BMI to backend (only if you create an API)
    // =========================
    /*
    try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (token && userId) {
            await fetch("/api/health/bmi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: Number(userId),
                    bmi: rounded,
                    category: categoryKey
                })
            });
        }
    } catch (err) {
        console.error("Error sending BMI to backend (optional):", err);
    }
    */
}

// =========================
// DAILY HEALTH TIP (FRONTEND ONLY)
// =========================
const healthTips = [
    {
        category: "Hydration",
        text: "Drink a glass of water as soon as you wake up to rehydrate your body and boost your metabolism.",
    },
    {
        category: "Sleep",
        text: "Aim for 7–9 hours of quality sleep every night to support recovery, mental health, and focus.",
    },
    {
        category: "Exercise",
        text: "Even a 20-minute brisk walk counts as exercise and helps improve heart health.",
    },
    {
        category: "Nutrition",
        text: "Fill half your plate with colourful vegetables to increase fibre and vitamins in every meal.",
    },
    {
        category: "Mindfulness",
        text: "Take 5 deep breaths before checking your phone in the morning to reduce stress and anxiety.",
    }
];

function renderTip(tip) {
    const container = document.getElementById("tip-container");
    const today = new Date();

    const dateStr = today.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    container.innerHTML = `
        <div class="tip-content">
            <span class="tip-category">${tip.category}</span>
            <div class="tip-text">${tip.text}</div>
            <div class="tip-date">${dateStr}</div>
        </div>
    `;
}

function getNewTip() {
    const index = Math.floor(Math.random() * healthTips.length);
    renderTip(healthTips[index]);
}

// make function visible to HTML onclick
window.getNewTip = getNewTip;

// =========================
// INITIALISE
// =========================
document.addEventListener("DOMContentLoaded", () => {
    // attach BMI submit handler
    if (bmiForm) {
        bmiForm.addEventListener("submit", handleBMISubmit);
    }

    // =========================
    // FIRE UPGRADE HELPERS
    // =========================
    function renderSmartPlan(category) {
        const container = document.getElementById("featured-insights");
        const plan = getSmartRecommendations(category);

        if (container) {
            container.innerHTML = `
            <div class="full-width-header">
                <span class="card-icon" style="color: #ff416c;">🔥</span>
                <span class="fw-title">Your 3-Step Spark Plan</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                ${plan.map(step => `
                    <div class="glass-card" style="padding: 15px; border-radius: 12px; font-size: 14px; border: 1px solid rgba(255, 65, 108, 0.2);">
                        ${step.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ff416c;">$1</strong>')}
                    </div>
                `).join('')}
            </div>
        `;
        }
    }

    function applyFireIntensity(category) {
        const root = document.documentElement;
        const body = document.body;

        // Default sparks
        let color = "#18b046"; // Green (Normal)

        if (category === "underweight") color = "#3498db"; // Blue
        if (category === "overweight") color = "#f39c12"; // Orange
        if (category === "obese") color = "#ff416c"; // Red/Fire

        root.style.setProperty('--neon-theme', color);
        body.style.background = `radial-gradient(circle at top, ${color}22 0%, #000000 85%)`;

        const calcBtn = document.querySelector(".btn-green");
        if (calcBtn) calcBtn.style.background = color;
    }

    // first tip
    getNewTip();
});

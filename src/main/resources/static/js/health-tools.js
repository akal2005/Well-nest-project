// =========================
// GLOBAL STATE & API KEYS
// =========================
// ⚠️ PASTE YOUR GOOGLE GEMINI API KEY HERE: ⚠️
const GEMINI_API_KEY = "AIzaSyAz256M2f7ZAuSI0defLaUzcFJSUSqf3XU";

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
            return "You are in the Underweight range. It's important to eat nutrient-rich foods and consult a nutritionist to reach a healthy weight safely.";
        case "normal":
            return "Great job! You are in the Healthy Weight range. Maintain your balanced diet and regular exercise to stay fit and healthy.";
        case "overweight":
            return "You are in the Overweight range. Small changes like increasing physical activity and portion control can help you move towards a healthier weight.";
        case "obese":
            return "You are in the Obese range. We recommend consulting a healthcare provider for a personalized plan to improve your long-term health.";
        default:
            return "";
    }
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
    updateBMIScale(rounded);

    bmiResultBox.classList.add("show");

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
// Rename the old list to use as fallback
const fallbackTips = [
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
        category: "Habit",
        text: "Prepare your workout clothes the night before to eliminate friction and stay consistent.",
    },
    {
        category: "Focus",
        text: "Deep work for 90 minutes followed by a 15-minute screen-free break boosts productivity.",
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

async function getNewTip(isInitialLoad = false) {
    const container = document.getElementById("tip-container");
    // Show loading state
    container.innerHTML = `
        <div class="tip-content">
            <p style="text-align:center; color:#888;">FETCTHING TIP...</p>
        </div>
    `;

    try {
        // Use /daily for initial load, /random for on-demand new tips
        const endpoint = isInitialLoad ? '/api/tips/daily' : '/api/tips/random';
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch health tip");

        const data = await res.json();

        renderTip({
            category: data.category || "Health Tip",
            text: data.text
        });

    } catch (err) {
        console.error("Backend API failed, using fallback:", err);
        // Fallback to local list if backend behaves weirdly
        const index = Math.floor(Math.random() * fallbackTips.length);
        renderTip(fallbackTips[index]);
    }
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

    // first tip
    getNewTip(true);
});

// =========================
// EMOTION CHATBOT & EXTERNAL AI STUB
// =========================

function toggleAIGuide() {
    const guide = document.getElementById('aiConnectionGuide');
    if (guide.style.display === 'none') {
        guide.style.display = 'block';
    } else {
        guide.style.display = 'none';
    }
}

function handleKey(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "user-msg");
    input.value = "";

    // Typing indicator
    const typingId = "typing-" + Date.now();
    appendMessage("Typing...", "bot-msg", typingId);

    // Provide response
    const response = await getBotResponse(text);

    // Remove typing indicator and append real response after a slight delay
    setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        // Multi-bubble parsing
        const messages = response.split("|");
        messages.forEach((msg, index) => {
            setTimeout(() => {
                appendMessage(msg, "bot-msg");
            }, index * 800);
        });
    }, 1000);
}

function appendMessage(text, className, id = null) {
    const chatbox = document.getElementById("chatbox");
    const div = document.createElement("div");
    div.className = className;
    if (id) div.id = id;

    // Basic formatting: respect bold and newlines
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    div.innerHTML = formattedText;

    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// SIMULATOR WITH GEMINI API CONNECTION INSTRUCTIONS
async function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    // ------------------------------------------------------------------------------------------------
    // EXTERNAL AI CONNECTION (GEMINI)
    // ------------------------------------------------------------------------------------------------

    if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_API_KEY_GOES_HERE") {
        const maxRetries = 2;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const EXTERNAL_AI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
                const response = await fetch(EXTERNAL_AI_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: "You are a professional, highly empathetic addiction recovery counselor. Provide detailed, supportive, and structured advice with actionable coping strategies. Feel free to use markdown bullet points for readability. The patient says: " + message
                            }]
                        }]
                    })
                });
                if (!response.ok) {
                    const errorInfo = await response.json();
                    throw new Error(`Gemini API error ${response.status}: ${errorInfo.error?.message || "unknown"}`);
                }
                const data = await response.json();
                return data.candidates[0].content.parts[0].text;
            } catch (e) {
                console.error(`Gemini API attempt ${attempt + 1} failed:`, e);
                if (attempt === maxRetries) {
                    break; // Just break out of the loop and fall through to local rules
                }
                // optional backoff delay
                await new Promise(res => setTimeout(res, 500));
            }
        }
    }


    // LOCAL FALLBACK / RULE-BASED RESPONSES

    // EMOTIONAL TRIGGERS
    if (lowerMessage.includes("relapse") || lowerMessage.includes("failed") || lowerMessage.includes("slipped")) {
        return "Please don't be hard on yourself. A slip is a lesson, not a failure.|1. **Stop and Breathe**: You are still in control of your next choice.|2. **Call Someone**: Reach out to your trainer or a supportive friend right now.|3. **Identify the Why**: What feeling or situation led to this? Knowing your triggers is the first step to a stronger tomorrow.";
    }

    if (lowerMessage.includes("anxious") || lowerMessage.includes("stress") || lowerMessage.includes("worried")) {
        return "I hear the weight in your words. Stress is often a major trigger for cravings.|Try the **5-4-3-2-1 Grounding Technique**:|5: Things you see|4: Things you can touch|3: Things you hear|2: Things you can smell|1: Thing you can taste.|This breaks the 'loop' of anxiety and brings you back to the present.";
    }

    if (lowerMessage.includes("lonely") || lowerMessage.includes("alone")) {
        return "Loneliness is one of the hardest parts of recovery, but you aren't alone – you have this community and me.|Consider reaching out to a support group or even just going to a public space like a park or library. Being around others, even without talking, can help lower the urge to use/crave.";
    }

    // ADDICTION CATEGORIES
    if (lowerMessage.includes("sugar")) {
        return "**Sugar Addiction Recovery Steps:**|1. **Identify the Trigger:** Are you hungry, stressed, or tired?|2. **Delay by 15 mins:** Wait before giving in; cravings usually pass.|3. **Hydrate:** Drink a large glass of water. Thirst is often mistaken for sugar cravings.|4. **Swap:** Eat a piece of fruit instead of refined sugar.";
    }

    if (lowerMessage.includes("gaming")) {
        return "**Gaming Addiction Recovery Steps:**|1. **Unplug:** Physically disconnect the console to break the circuit.|2. **Change Scenery:** Leave the room immediately.|3. **Engage Hands:** Do pushups or cleaning to distract your muscle memory.|4. **Socialize**: Call someone. Isolation fuels gaming binges.";
    }

    if (lowerMessage.includes("alcohol")) {
        return "**Alcohol Recovery Steps:**|1. **HALT Check:** Are you Hungry, Angry, Lonely, or Tired? Address that need first.|2. **Urge Surfing:** Acknowledge the craving. It will peak and fall like an ocean wave; just ride it out.|3. **Play the Tape Forward:** Imagine exactly how you will feel tomorrow morning if you drink now.|4. **Action**: Pour it out or leave the situation immediately.";
    }

    if (lowerMessage.includes("smoking") || lowerMessage.includes("vaping") || lowerMessage.includes("nicotine")) {
        return "**Smoking/Nicotine Recovery Steps:**|1. **Deep Breathing:** Take 10 slow, deep breaths to simulate the physical action of smoking.|2. **Oral Substitute:** Chew sugarless gum or crunch on a carrot stick.|3. **Change Routine:** Do something you physically cannot do while smoking (like taking a shower).|4. **Focus**: The intense craving will only last 3-5 minutes. You can survive 5 minutes.";
    }

    if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
        return "I'm so sorry you're feeling this weight. Recovery is an emotional journey, and it's okay to feel sad.|Would you like to try a quick breathing exercise, or simply vent? I am listening and I won't judge.";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        return "Hello! I'm your REHAB-360 companion. I'm here to listen. Are you facing any specific cravings or feelings you'd like to work through right now?";
    }

    return "I hear you, and I am here for you. Staying on track takes immense strength.|Remember, cravings are like temporary physiological waves. They always pass if you don't feed them.|What is one small, healthy choice you can make in the next 5 minutes? (You can type 'sugar', 'alcohol', 'relapse' or 'anxious' for specific support).";
}

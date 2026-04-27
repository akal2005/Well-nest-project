// =========================
// GLOBAL STATE & API KEYS
// =========================
// ⚠️ PASTE YOUR GOOGLE GEMINI API KEY HERE: ⚠️
const GEMINI_API_KEY = "AIzaSyDkWtgvnFX1Rfgb7aQbBfuq1qyVOwK-M_s";

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
// EMOTION CHATBOT & ADVANCED AI
// =========================

let chatHistory = [];

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

// Initial default quick replies
document.addEventListener("DOMContentLoaded", () => {
    // Other init code is above...
    renderQuickReplies(["I'm craving something", "I feel anxious", "I need a distraction"]);
});

function renderQuickReplies(replies) {
    const container = document.getElementById("quick-replies");
    if (!container) return;
    container.innerHTML = "";
    
    replies.forEach(reply => {
        const btn = document.createElement("button");
        btn.className = "quick-reply-btn";
        btn.textContent = reply;
        btn.onclick = () => {
            const input = document.getElementById("userInput");
            input.value = reply;
            sendMessage();
        };
        container.appendChild(btn);
    });
}

function generateDynamicQuickReplies(botResponse) {
    const lower = botResponse.toLowerCase();
    
    if (lower.includes("breathe") || lower.includes("breathing") || lower.includes("5-4-3-2-1")) {
        return ["I feel calmer now", "I'm still anxious", "What's next?"];
    } else if (lower.includes("craving") || lower.includes("urge")) {
        return ["How long will this last?", "I need a distraction", "Remind me why I quit"];
    } else if (lower.includes("sad") || lower.includes("depressed")) {
        return ["I just want to vent", "Give me a coping strategy", "I feel alone"];
    } else {
        return ["I understand", "Tell me more", "I need a distraction"];
    }
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, "user-msg");
    input.value = "";
    
    // Clear quick replies while loading
    const qrContainer = document.getElementById("quick-replies");
    if (qrContainer) qrContainer.innerHTML = "";

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
                
                // Show new quick replies after the last message bubble
                if (index === messages.length - 1) {
                    renderQuickReplies(generateDynamicQuickReplies(msg));
                }
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

    // 1. URGENCY & SENTIMENT DETECTION
    let isUrgent = false;
    if (lowerMessage.includes("crisis") || lowerMessage.includes("give up") || lowerMessage.includes("can't do this") || lowerMessage.includes("suicide")) {
        isUrgent = true;
    }

    // Add user message to memory
    chatHistory.push({
        role: "user",
        parts: [{ text: message }]
    });

    // We keep history somewhat bounded
    if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(chatHistory.length - 10);
    }

    // ------------------------------------------------------------------------------------------------
    // EXTERNAL AI CONNECTION (GEMINI)
    // ------------------------------------------------------------------------------------------------

    if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_API_KEY_GOES_HERE") {
        const maxRetries = 2;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Determine system prompt based on urgency
                let systemContext = `You are a highly empathetic, professional addiction recovery counselor. 
IMPORTANT: When a user mentions a specific addiction (like smoking, drugs, alcohol, sugar, or gaming), provide a highly structured, step-by-step recovery guide formatted with emojis and clear sections. 

Make sure to reply in a structure very similar to this:
First—good that you said it openly. That's the hardest step already.
[Addiction name] addiction is both physical and mental. So recovery means handling both.|[Addiction Emoji] **Step-by-step way to recover**

**1. Understand your trigger**
Ask yourself: When do you crave it most?
👉 Once you know the trigger, you can control it.|**2. Don't stop suddenly (if heavy user)**
Reduce slowly or seek medical detox if necessary.
👉 Gradual reduction avoids immense withdrawal shocks.

**3. Replace the habit**
When craving comes, don't sit idle. [Give 3 specific healthy replacements].
👉 Craving usually lasts only 5-10 minutes.|**4. Control your environment**
Stay away from triggers and people who encourage the habit. Remove the substance/game from your room.

**5. Use the 5-minute rule**
When urge comes:
👉 Tell yourself: "I will wait 5 minutes." Most cravings go away if you delay.|**6. Handle withdrawal symptoms**
You may feel: [list 2 symptoms]. 
This is normal. It means your body/brain is healing.
👉 Drink more water + sleep well.

**7. Set a clear reason**
Write your reason: Health, Family, Money, Future.
👉 Strong reason = strong control.

**8. Track your progress**
Example: Day 1 vs Day 5.
👉 Seeing progress motivates you.

Make sure to use bullet points, bold text (**), and pointers (👉). Separate the main logical groupings with the pipe character "|" so my frontend can split them into chat bubbles. Keep it highly practical.`;
                
                if (isUrgent) {
                    systemContext = "The user seems to be in severe distress or crisis. Prioritize grounding them, validating their extreme pain, and strongly suggest they reach out to their trainer, a sponsor, or a local crisis hotline. Use a very gentle, supportive tone. Separate paragraphs with | for chat bubbles.";
                }

                // Compress chat history into a string to avoid strict Gemini role sequence validation errors
                const historyString = chatHistory.map(msg => `${msg.role === 'model' ? 'Counselor' : 'User'}: ${msg.parts[0].text}`).join("\n\n");

                const payloadContents = [
                    { 
                        role: "user", 
                        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemContext}\n\nCONVERSATION HISTORY:\n${historyString}\n\nCounselor:` }] 
                    }
                ];

                const EXTERNAL_AI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
                const response = await fetch(EXTERNAL_AI_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: payloadContents
                    })
                });
                
                if (!response.ok) {
                    const errorInfo = await response.json();
                    console.error("Gemini API Error details:", errorInfo);
                    throw new Error(`Gemini API error ${response.status}: ${errorInfo.error?.message || "unknown"}`);
                }
                const data = await response.json();
                const botText = data.candidates[0].content.parts[0].text;
                
                // Add bot response to memory
                chatHistory.push({
                    role: "model",
                    parts: [{ text: botText }]
                });

                return botText;
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


    // LOCAL FALLBACK / RULE-BASED RESPONSES (Enhanced for Step-by-Step Response format)
    let fallbackResponse = "";

    const generateStepByStep = (addiction, emoji, triggers, replaceWait, withdraw) => {
        return `First—good that you said it openly. That’s the hardest step already. ${addiction} addiction is both physical and mental. So recovery means handling both.|${emoji} **Step-by-step way to recover**\n\n**1. Understand your trigger**\nAsk yourself:\n• When do you crave it most? (${triggers})\n• Why do you crave it?\n👉 Once you know the trigger, you can control it.|**2. Don’t stop suddenly (if heavy user)**\nReduce slowly. Fix a daily limit.\n👉 Gradual reduction avoids strong withdrawal.\n\n**3. Replace the habit**\nWhen craving comes, don’t sit idle:\n${replaceWait}\n👉 Craving usually lasts only 5–10 minutes.|**4. Control your environment**\n• Stay away from triggers\n• Remove the substance/habit trigger from your room\n\n**5. Use the 5-minute rule**\nWhen urge comes:\n👉 Tell yourself: "I will wait 5 minutes"\nMost cravings go away if you delay.|**6. Handle withdrawal symptoms**\nYou may feel:\n${withdraw}\nThis is normal. It means your body is healing.\n👉 Drink more water + sleep well\n\n**7. Set a clear reason**\nWrite your reason: Health, Saving money, Family.\n👉 Strong reason = strong control\n\n**8. Track your progress**\n👉 Seeing progress motivates you!`;
    };

    if (isUrgent) {
        fallbackResponse = "I can hear the immense weight and pain in your words right now. It takes profound courage to admit when you are at your breaking point, and I want you to know that you are not alone in this fight. This feeling of crisis is a temporary storm. | Please, take a deep, slow breath right now. Drop your shoulders. I strongly urge you to reach out to your assigned trainer, a trusted friend, or a hotline immediately. Human connection is your anchor.";
    } else if (lowerMessage.includes("anxious") || lowerMessage.includes("stress")) {
        fallbackResponse = "I hear the distress in your voice. Anxiety often feels like a sudden wave crashing over you. Let's redirect that chaotic energy. | Right now, let's try a guided Cognitive Behavioral Therapy (CBT) exercise. We will do the 5-4-3-2-1 Grounding Technique. | Step 1: Look around and find **5** things you can see around you right now. Tell me what they are in your mind. Focus deeply on their colors and shapes.";
    } else if (lowerMessage.includes("sugar")) {
        fallbackResponse = generateStepByStep(
            "Sugar", "🍫", 
            "stress, after food, boredom", 
            "• Drink a large glass of water\n• Eat a piece of fruit\n• Take a walk", 
            "• Headaches\n• Fatigue\n• Sugar cravings"
        );
    } else if (lowerMessage.includes("drug")) {
        fallbackResponse = generateStepByStep(
            "Drug", "💊", 
            "emotional pain, peer pressure, specific locations", 
            "• Call a sponsor/friend\n• Exercise vigorously\n• Take a hot shower", 
            "• Restlessness\n• Sweats\n• Irritability"
        );
    } else if (lowerMessage.includes("alcohol")) {
        fallbackResponse = generateStepByStep(
            "Alcohol", "🍺", 
            "after work, social events, loneliness", 
            "• Pour a sparkling water\n• Call a friend\n• Exercise or clean the house", 
            "• Anxiety\n• Shaking\n• Trouble sleeping"
        );
    } else if (lowerMessage.includes("gaming")) {
        fallbackResponse = generateStepByStep(
            "Gaming", "🎮", 
            "escapism, boredom, late night", 
            "• Read a book\n• Exercise or go outside\n• Call a friend", 
            "• Irritability\n• Restlessness\n• Boredom"
        );
    } else if (lowerMessage.includes("smoke") || lowerMessage.includes("smoking") || lowerMessage.includes("cigarette") || lowerMessage.includes("nicotine") || lowerMessage.includes("vape")) {
        fallbackResponse = generateStepByStep(
            "Smoking", "🚭", 
            "stress, after food, morning coffee", 
            "• Chew gum / eat nuts\n• Drink water\n• Take a short walk", 
            "• Irritation\n• Headache\n• Restlessness"
        );
    } else if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
        fallbackResponse = "I am so sorry you are enduring this heavy emotional fog. It is incredibly common in early recovery to feel a profound sense of loss or sadness. Your feelings are entirely valid and real. | Would you prefer to explore a gentle breathing exercise to ease the physical heaviness in your chest, or do you just need a safe space to vent your thoughts right now?";
    } else {
        fallbackResponse = "I hear you, and I truly appreciate you sharing that with me. The journey of recovery is rarely a straight line; it is full of unexpected hurdles. | Every minute you sit with this discomfort without acting out, you are building new neural pathways of resilience. What is one small, gentle thing you can do for yourself in the next 5 minutes?";
    }

    // Add bot response to memory
    chatHistory.push({
        role: "model",
        parts: [{ text: fallbackResponse }]
    });

    return fallbackResponse;
}

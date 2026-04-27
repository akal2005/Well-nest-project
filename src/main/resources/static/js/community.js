// community.js - AI-Moderated Peer Support Logic

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendChatBtn");
    const messagesArea = document.getElementById("messagesArea");
    const aiStatus = document.getElementById("aiStatus");

    // Initialize with some healthy community messages
    const initialMessages = [
        { sender: "Sarah_Recovery", type: "other", text: "Hit my 3-month milestone today! Just wanted to share the win with everyone here. 💪" },
        { sender: "MikeT_Coach", type: "other", text: "Amazing job, Sarah! Consistency is key. How did you handle stress this week?" },
        { sender: "Sarah_Recovery", type: "other", text: "I leaned heavily on the daily guided meditations whenever I felt an urge." }
    ];

    function renderMessage(sender, type, text) {
        const row = document.createElement("div");
        row.className = `message-row ${type}`;

        let nameDisplay = "";
        if (type !== "system" && type !== "alert") {
            nameDisplay = `<div class="sender-name">${sender}</div>`;
        }

        row.innerHTML = `
            ${nameDisplay}
            <div class="bubble ${type}">
                ${text}
            </div>
        `;
        messagesArea.appendChild(row);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    initialMessages.forEach(m => renderMessage(m.sender, m.type, m.text));

    // ===============================================
    // DATA FLOW ARCHITECTURE LOGIC: AI Orchestrator
    // ===============================================
    // Diagram Mapping:
    // Input (Chat) -> Preprocessing (Tokenize/Clean) -> Emotion NLP / Crisis Detection -> Orchestrator Policy -> Outputs (Alerts)

    const triggerKeywords = ["drink", "high", "drunk", "relapse", "suicide", "weed", "pills", "give up"];

    async function processMessage(rawText) {
        if (!rawText) return;
        input.value = "";

        // 1. Show UI indicator that Preprocessing / Orchestrator is scanning
        aiStatus.style.display = "block";
        sendBtn.innerText = "SCANNING...";
        sendBtn.style.background = "#555";
        sendBtn.disabled = true;

        try {
            const GEMINI_API_KEY = "AIzaSyDkWtgvnFX1Rfgb7aQbBfuq1qyVOwK-M_s";
            
            const systemPrompt = `You are the invisible '✨ AI Moderator' for the REHAB-360 Addiction Recovery Community Forum. 
Evaluate this new user post: "${rawText}"
1. If the post contains severe crisis markers (suicide, extreme relapse, giving up completely), start your response EXACTLY with "[CRISIS]" followed by a highly supportive alert message recommending they talk to their trainer or try a breathing exercise.
2. If the post is safe, act as a highly empathetic community member. Read the emotion of the post. If they are sad, comfort them. If they are happy or milestone-focused, celebrate with them enthusiastically. Keep your response under 3 sentences, very casual, and formatted as plain text with emojis.`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                const aiText = data.candidates[0].content.parts[0].text.trim();

                if (aiText.startsWith("[CRISIS]")) {
                    const safeMsg = aiText.replace("[CRISIS]", "").trim();
                    // Policy: Do not post message publicly. Send private automated alert to user.
                    renderMessage("System", "system", `<strong>⚠️ AI Orchestrator Alert (Crisis Detection module)</strong><br>Your message contained potential distress markers. Taking care of our community means keeping the feed safe for those in active recovery. Your message was held for review.`);

                    setTimeout(() => {
                        renderMessage("System", "alert", `🤖 <strong>Auto-Adaptive Recommendation:</strong> ${safeMsg}`);
                    }, 1500);
                } else {
                    // Policy: Safe token sentiment. Broadcast to Data Store and display to Chat.
                    renderMessage("You", "me", rawText);

                    // Organic AI reply from Community Moderator
                    setTimeout(() => {
                        renderMessage("✨ AI Moderator", "other", aiText);
                    }, 2000);
                }
            } else {
                // Fallback
                renderMessage("You", "me", rawText);
                setTimeout(() => renderMessage("✨ AI Moderator", "other", "I hear you. Keep taking it one day at a time! 💪"), 2000);
            }
        } catch (e) {
            console.error("AI Mod Error:", e);
            renderMessage("You", "me", rawText);
        } finally {
            sendBtn.innerText = "POST MESSAGE";
            sendBtn.style.background = "#18b046";
            sendBtn.disabled = false;
            aiStatus.style.display = "none";
        }
    }

    sendBtn.addEventListener("click", () => processMessage(input.value));

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            processMessage(input.value);
        }
    });
});

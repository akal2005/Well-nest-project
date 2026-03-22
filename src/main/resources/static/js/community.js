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

    function processMessage(rawText) {
        if (!rawText) return;
        input.value = "";

        // 1. Show UI indicator that Preprocessing / Orchestrator is scanning
        aiStatus.style.display = "block";
        sendBtn.innerText = "SCANNING...";
        sendBtn.style.background = "#555";
        sendBtn.disabled = true;

        setTimeout(() => {
            sendBtn.innerText = "POST MESSAGE";
            sendBtn.style.background = "#18b046";
            sendBtn.disabled = false;
            aiStatus.style.display = "none";

            // 2. Preprocessing: Clean & Tokenize (Simulated)
            const cleanText = rawText.toLowerCase().trim();

            // 3. Emotion NLP / Crisis Detection (Simulated matching)
            let flagged = false;
            let detectedTrigger = "";

            for (let word of triggerKeywords) {
                if (cleanText.includes(word)) {
                    flagged = true;
                    detectedTrigger = word;
                    break;
                }
            }

            // 4. Orchestrator Policy & Outputs
            if (flagged) {
                // Policy: Do not post message publicly. Send private automated alert to user.
                renderMessage("System", "system", `<strong>⚠️ AI Orchestrator Alert (Crisis Detection module)</strong><br>Your message contained a potential trigger word ("${detectedTrigger}"). Taking care of our community means keeping the feed safe for those in active recovery. Your message was held for review.`);

                setTimeout(() => {
                    renderMessage("System", "alert", `🤖 <strong>Auto-Adaptive Recommendation:</strong> We notice your text indicates potential distress. Sending an alert to your assigned coach. Would you like to start a Guided Breathwork session right now?`);
                }, 1500);
            } else {
                // Policy: Safe token sentiment. Broadcast to Data Store and display to Chat.
                renderMessage("You", "me", rawText);

                // Simulate organic reply from Community
                setTimeout(() => {
                    renderMessage("Alex_R", "other", "That's great! Keep taking it one day at a time.");
                }, 3000);
            }
        }, 1200); // Simulate network/AI processing latency
    }

    sendBtn.addEventListener("click", () => processMessage(input.value));

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            processMessage(input.value);
        }
    });
});

const key = "AIzaSyAz256M2f7ZAuSI0defLaUzcFJSUSqf3XU";

const endpoints = [
  "v1beta/models/gemini-1.5-flash",
  "v1beta/models/gemini-1.5-pro",
  "v1beta/models/gemini-pro"
];

const payload = {
  contents: [{ parts: [{ text: "Respond with the word: SUCCESS" }] }]
};

async function testAll() {
  for (const ep of endpoints) {
    const url = `https://generativelanguage.googleapis.com/${ep}:generateContent?key=${key}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log(`\nEndpoint: ${ep}`);
      console.log(`Status: ${response.status}`);
      if (response.status === 200) {
        console.log("Response:", data.candidates[0].content.parts[0].text.trim());
        return; // Stop on first success
      } else {
        console.log("Error:", data.error?.message.substring(0, 50) + "...");
      }
    } catch (e) {
      console.error("Network Error.");
    }
  }
}

testAll();

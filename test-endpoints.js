const key = "AIzaSyCWFPjKLlJGPr8mg8yzE0PmjJAx7ts4-xk";

const endpoints = [
  "v1beta/models/gemini-1.5-flash",
  "v1beta/models/gemini-1.5-pro",
  "v1beta/models/gemini-pro",
  "v1/models/gemini-pro",
  "v1/models/gemini-1.5-flash"
];

const payload = {
  contents: [{ parts: [{ text: "Respond with: OK" }] }]
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
        console.log("SUCCESS! Use this endpoint.");
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

const key = "AIzaSyCWFPjKLlJGPr8mg8yzE0PmjJAx7ts4-xk";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

const payload = {
  contents: [{ parts: [{ text: "Respond with: OK" }] }]
};

async function test() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Error details:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

test();

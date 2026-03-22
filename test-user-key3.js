const key = "AIzaSyAz256M2f7ZAuSI0defLaUzcFJSUSqf3XU";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

const payload = {
  contents: [{ parts: [{ text: "Respond with the word: Success" }] }]
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
    if(response.status === 200) {
        console.log("Response:", data.candidates[0].content.parts[0].text.trim());
    } else {
        console.log("Error details:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

test();

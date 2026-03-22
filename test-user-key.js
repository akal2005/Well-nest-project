const key = "AIzaSyCWFPjKLlJGPr8mg8yzE0PmjJAx7ts4-xk";
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;

const payload = {
  contents: [{
    parts: [{ text: "Respond with the word: Success" }]
  }]
};

async function test() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    console.log("Status:", response.status);
    const data = await response.json();
    if (response.status !== 200) {
        console.error("Error:", data.error?.message);
    } else {
        console.log("Response:", data.candidates[0].content.parts[0].text);
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

test();

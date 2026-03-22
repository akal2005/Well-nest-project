const key = "AIzaSyBRIpN84_ZHNZNPpDgNz4woFId7hUMDnsQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

const payload = {
  contents: [{
    parts: [{ text: "Hello, this is a test. Respond with just one word: Success" }]
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
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

test();

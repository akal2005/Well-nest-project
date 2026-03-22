const key = "AIzaSyAz256M2f7ZAuSI0defLaUzcFJSUSqf3XU";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function listModels() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Status:", response.status);
    if (response.status === 200) {
      if(data.models && data.models.length > 0) {
        console.log("Available Models:");
        data.models.forEach(m => {
          if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(" -", m.name);
          }
        });
      } else {
        console.log("No models found. Response:", JSON.stringify(data));
      }
    } else {
      console.log("Error details:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

listModels();

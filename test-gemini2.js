const key = "AIzaSyBRIpN84_ZHNZNPpDgNz4woFId7hUMDnsQ";
const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

const payload = {
  contents: [{
    parts: [{ text: "hi" }]
  }]
};

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    console.log(`\nTesting ${model}: Status ${response.status}`);
    const data = await response.json();
    if(response.status !== 200) {
        console.log("Error:", data.error?.message);
    } else {
        console.log("Success! Response:", data.candidates[0].content.parts[0].text);
    }
  } catch (err) {
    console.error(`Fetch Error for ${model}:`, err.message);
  }
}

async function runTests() {
  for (const model of modelsToTest) {
    await testModel(model);
  }
}

runTests();

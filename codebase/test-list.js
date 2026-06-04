const dotenv = require('dotenv');
dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function testRaw() {
    try {
        console.log("Filtering gemini models...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            const geminiModels = data.models
                .map(m => m.name)
                .filter(name => name.toLowerCase().includes('gemini'));
            console.log("Supported Gemini Models:", geminiModels);
        } else {
            console.log("No models returned:", data);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testRaw();

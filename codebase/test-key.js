const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log('Testing Key:', key ? `${key.substring(0, 8)}...` : 'None');

async function main() {
    try {
        const genAI = new GoogleGenerativeAI(key);
        // We can list models using genAI
        // Note: listModels is not directly exposed on genAI in some versions of the SDK, but we can do a simple generateContent with a model.
        // Let's test different model names to see if they work.
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
        
        for (const m of models) {
            try {
                console.log(`Testing model: ${m}...`);
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Hi");
                console.log(`✅ Model ${m} is working! Response:`, result.response.text());
                return;
            } catch (err) {
                console.error(`❌ Model ${m} failed:`, err.message);
            }
        }
    } catch (err) {
        console.error('General error:', err);
    }
}

main();

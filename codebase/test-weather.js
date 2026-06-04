const dotenv = require('dotenv');
dotenv.config();

const key = process.env.WEATHER_API_KEY;

async function test(dest) {
    try {
        const q = encodeURIComponent(dest);
        const url = `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${q}&days=3&lang=vi`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.log(`Query "${dest}" failed:`, data.error.message);
        } else {
            console.log(`Query "${dest}" success! Location: ${data.location.name}, ${data.location.region}, ${data.location.country}`);
        }
    } catch (e) {
        console.log(`Query "${dest}" error:`, e.message);
    }
}

async function run() {
    console.log("Testing Phu Quoc alternatives:");
    await test("Phuquoc");
    await test("An Thoi");
    await test("Ham Ninh");
    await test("Kien Giang, Vietnam");
}

run();

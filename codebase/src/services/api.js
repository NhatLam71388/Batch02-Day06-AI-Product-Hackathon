import { showToast, els, addLog } from '../utils/ui.js';
import { state } from '../store/state.js';

export function getApiKey() {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && envKey !== 'your_api_key_here' && envKey !== '') {
        return envKey;
    }
    showToast("Bạn chưa cấu hình VITE_GEMINI_API_KEY trong file .env!");
    return null;
}

export async function callGemini(systemPrompt, userPrompt, jsonFormat = true) {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    if (userPrompt && !state.chatHistory.length) {
        state.chatHistory = [];
    }

    let contents = [...state.chatHistory];
    
    if (userPrompt) {
        contents.push({ role: "user", parts: [{ text: userPrompt }] });
    }

    const payload = {
        contents: contents,
        generationConfig: {
            temperature: 0.7,
        }
    };
    
    payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    
    if (jsonFormat) {
        payload.generationConfig.responseMimeType = "application/json";
    }

    // Log request
    addLog('📤 API Request (Payload)', payload, 'request');
    console.log("🚀 [API Request Payload]: ", JSON.stringify(payload, null, 2));

    try {
        const selectedModel = els.modelSelect.value;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            addLog('❌ API Error', errorData, 'error');
            throw new Error(errorData.error?.message || "Lỗi khi gọi API Gemini");
        }

        const data = await response.json();
        
        // Log response
        addLog('📥 API Response', data, 'response');
        console.log("✅ [API Raw Response]: ", data);

        const responseText = data.candidates[0].content.parts[0].text;
        
        if (userPrompt) {
            state.chatHistory.push({ role: "user", parts: [{ text: userPrompt }] });
        }
        state.chatHistory.push({ role: "model", parts: [{ text: responseText }] });

        if (jsonFormat) {
            return JSON.parse(responseText);
        }
        return responseText;

    } catch (error) {
        console.error(error);
        if (error.message.includes('Quota exceeded') || error.message.includes('exceeded your current quota')) {
            showToast("⚠️ Bị giới hạn số lượt gọi API miễn phí. Vui lòng đợi 1 phút rồi thử lại nhé!");
        } else {
            showToast("Lỗi API: " + error.message);
        }
        return null;
    }
}

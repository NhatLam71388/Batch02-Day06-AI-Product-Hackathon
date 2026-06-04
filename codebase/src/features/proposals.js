import { els, showSection, showToast } from '../utils/ui.js';
import { getApiKey } from '../services/api.js';
import { state } from '../store/state.js';
import { handleRouteSelect } from './itinerary.js';

export async function generateProposals() {
    els.loadingText.textContent = "AI đang thiết kế các tuyến đường trốn đi chơi...";
    showSection('loading');

    const systemPrompt = `Dựa vào toàn bộ cuộc trò chuyện vừa rồi, hãy đề xuất đúng 2-3 tuyến đường du lịch ở bất cứ đâu tại Việt Nam phù hợp nhất với nhu cầu, thời lượng chuyến đi, ngân sách và phương tiện của người dùng.
Nếu người dùng chưa cung cấp đủ thông tin vì chưa biết đi đâu, hãy chủ động đưa ra các gợi ý xuất sắc nhất dựa theo mùa hiện tại, xu hướng, và các yếu tố hấp dẫn khác. (Nếu đi xa, gợi ý đi máy bay).
Không đưa quá nhiều để tránh làm user rối (quá tải thông tin).
CẤU TRÚC JSON PHẢI TRẢ VỀ CHÍNH XÁC NHƯ SAU:
{
  "proposals": [
    {
      "id": "tuyen_1",
      "title": "Tên tuyến đường (VD: Hà Nội - Sapa)",
      "description": "Mô tả ngắn gọn điểm nổi bật của tuyến này",
      "season": "Mùa/Thời điểm lý tưởng nhất để đi (VD: Mùa Thu, Tháng 9-11)",
      "cost": "Chi phí ước tính trung bình/người",
      "reason": "Tại sao nên đi điểm này (Lý do thuyết phục)",
      "rating": "Đánh giá/Review (VD: 4.8/5 - Rất tuyệt vời)"
    }
  ]
}`;

    const userPrompt = `Hãy tạo danh sách đề xuất JSON ngay bây giờ.`;
    const tempHistory = [...state.chatHistory];

    const payload = {
        contents: [...tempHistory, { role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
    };

    payload.systemInstruction = { parts: [{ text: systemPrompt }] };

    try {
        const apiKey = getApiKey();
        const selectedModel = els.modelSelect.value;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Lỗi khi tạo đề xuất");
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        const proposalsJson = JSON.parse(responseText);

        if (proposalsJson && proposalsJson.proposals) {
            renderProposals(proposalsJson.proposals);
            showSection('proposals');
        }
    } catch (e) {
        console.error(e);
        if (e.message.includes('Quota exceeded') || e.message.includes('exceeded your current quota')) {
            showToast("⚠️ Bị giới hạn số lượt gọi API miễn phí. Vui lòng đợi 1 phút rồi thử lại!");
        } else {
            showToast("Lỗi khi tạo đề xuất: " + e.message);
        }
        showSection('welcome');
    }
}

export function renderProposals(proposals) {
    els.proposalsContainer.innerHTML = '';

    proposals.forEach(p => {
        const card = document.createElement('div');
        card.className = 'proposal-card';
        card.innerHTML = `
            <div class="proposal-title">${p.title}</div>
            <div class="proposal-desc">${p.description}</div>
            <div class="proposal-details" style="margin-top: 10px; font-size: 0.9em; color: var(--text-muted); background: var(--glass-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
                <p style="margin-bottom: 6px;"><strong>🌤️ Mùa đi:</strong> ${p.season || 'Quanh năm'}</p>
                <p style="margin-bottom: 6px;"><strong>💰 Chi phí:</strong> ${p.cost || 'Đang cập nhật'}</p>
                <p style="margin-bottom: 6px;"><strong>✨ Lý do:</strong> ${p.reason || 'Nhiều trải nghiệm thú vị'}</p>
                <p style="margin-bottom: 0;"><strong>⭐ Đánh giá:</strong> ${p.rating || '4.5/5'}</p>
            </div>
            <button class="btn outline-btn select-route-btn" data-id="${p.id}" style="width: 100%; margin-top: 15px;">Chọn Tuyến Này</button>
        `;

        card.querySelector('button').addEventListener('click', () => handleRouteSelect(p));
        els.proposalsContainer.appendChild(card);
    });
}

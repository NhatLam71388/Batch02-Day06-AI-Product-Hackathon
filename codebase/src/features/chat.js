import { els, addMessageToUI } from '../utils/ui.js';
import { callGemini } from '../services/api.js';
import { generateProposals } from './proposals.js';

export async function handleChatSubmit(e) {
    e.preventDefault();
    const text = els.chat.input.value.trim();
    if (!text) return;

    addMessageToUI(text, 'user');
    els.chat.input.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.className = `chat-message ai-message typing-indicator`;
    typingDiv.innerHTML = `<div class="chat-avatar">🤖</div><div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    els.chat.history.appendChild(typingDiv);
    els.chat.history.scrollTop = els.chat.history.scrollHeight;

    const submitBtn = els.chat.form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    els.chat.input.disabled = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ph ph-spinner spin-icon" style="font-size: 1.2rem;"></i>';

    const systemPrompt = `Bạn là TripEscape AI, một trợ lý du lịch nhiệt tình. 
Nhiệm vụ của bạn là thu thập ĐỦ 7 thông tin sau từ người dùng để lên lịch trình du lịch ở bất cứ đâu tại Việt Nam:
1. Nơi xuất phát (Ví dụ: Hà Nội, TP.HCM, Đà Nẵng)
2. Phương tiện (Ví dụ: Xe máy, Ô tô)
3. Ngân sách dự kiến trên 1 người
4. Mood / Sở thích (Ví dụ: Chill, Sôi động, Cắm trại hoang sơ)
5. Ngày dự kiến đi (Ví dụ: 20/10, hoặc cuối tuần sau)
6. Thời lượng chuyến đi (Ví dụ: Đi mấy ngày mấy đêm?)
7. Số lượng người tham gia chuyến đi (Ví dụ: Đi 1 mình, cặp đôi, nhóm 4 người)

Quy tắc:
- CHỈ TRẢ LỜI CÁC VẤN ĐỀ LIÊN QUAN ĐẾN DU LỊCH. Nếu người dùng hỏi các chủ đề khác (toán học, code, chính trị, công việc...), hãy từ chối thật khéo léo, hài hước và lái câu chuyện về việc đi chơi (VD: "Trời ơi nghỉ lễ/cuối tuần rồi ai lại bàn chuyện đó nữa! Xách ba lô lên đi trốn thôi, bạn thích lên rừng hay xuống biển nào?").
- Hỏi từng câu một hoặc hỏi khéo léo, không xổ 1 tràng 6 câu hỏi cùng lúc. Có thể gộp nếu thấy hợp lý nhưng phải tự nhiên.
- Nếu người dùng chưa có ngày cụ thể, hãy gợi ý một vài thời điểm (VD: mùa thu, lễ hội sắp tới) để họ chọn.
- NẾU người dùng bày tỏ việc họ chưa biết đi đâu, muốn bạn tự do gợi ý, hoặc bạn thấy họ khá bối rối không có ý tưởng gì, BẠN KHÔNG CẦN HỎI ĐỦ 7 THÔNG TIN NỮA. Hãy đưa ra một lời đồng ý nhiệt tình rằng bạn sẽ gợi ý cho họ, VÀ BẮT BUỘC CHÈN CHUỖI NÀY VÀO CUỐI TIN NHẮN: [READY_TO_PLAN]
- Giao tiếp tự nhiên, linh hoạt, chủ động đưa ra các gợi ý hay ho chứ không cứng nhắc như một cái máy hỏi cung. Lời lẽ thân thiện, dùng emoji.
- KHI BẠN ĐÃ THU THẬP ĐỦ 7 THÔNG TIN TRÊN, HÃY TRẢ LỜI BẰNG MỘT CÂU XÁC NHẬN CUỐI CÙNG VÀ BẮT BUỘC CHÈN CHUỖI NÀY VÀO CUỐI TIN NHẮN: [READY_TO_PLAN]`;

    const aiResponse = await callGemini(systemPrompt, text, false);

    els.chat.input.disabled = false;
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
    els.chat.input.focus();
    
    els.chat.history.removeChild(typingDiv);

    if (aiResponse) {
        if (aiResponse.includes('[READY_TO_PLAN]')) {
            const cleanResponse = aiResponse.replace('[READY_TO_PLAN]', '').trim();
            addMessageToUI(cleanResponse, 'ai');

            setTimeout(generateProposals, 1500);
        } else {
            addMessageToUI(aiResponse, 'ai');
        }
    }
}

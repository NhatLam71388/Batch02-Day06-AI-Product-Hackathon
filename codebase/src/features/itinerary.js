import { els, showSection } from '../utils/ui.js';
import { callGemini } from '../services/api.js';
import { state } from '../store/state.js';

export async function handleRouteSelect(routeProposal) {
    state.currentRoute = routeProposal;
    els.loadingText.textContent = `AI đang chốt lịch trình chi tiết cho tuyến ${routeProposal.title}...`;
    showSection('loading');

    const systemPrompt = `Dựa vào đề xuất tuyến đường và thông tin trước đó, hãy lập Lịch Trình Chi Tiết.
CHÚ Ý: Viết ngắn gọn, súc tích (dạng gạch đầu dòng ngắn). Không viết văn hoa.
CẤU TRÚC JSON PHẢI TRẢ VỀ CHÍNH XÁC NHƯ SAU:
{
  "cost_estimate": "Tổng kết ước tính chi phí (VD: 2.100.000 VNĐ / người)",
  "fatigue_level": "Đánh giá độ mệt (VD: Chạy xe tổng cộng 4 tiếng, nhàn rỗi)",
  "weather": "Dự báo thời tiết hiện tại/đặc trưng cho địa điểm đó (VD: 28°C Nắng đẹp, thích hợp đi biển)",
  "verifications": [
    "Giá phòng khách sạn hiện tại có thể thay đổi so với dự toán.",
    "Cần kiểm tra thời tiết báo bão trước khi đi biển."
  ],
  "reviews": [
    {
      "author": "Tên người đánh giá (VD: Minh Tú)",
      "comment": "Nội dung review ngắn gọn (VD: Đồ ăn ở đây rất ngon, cảnh biển tuyệt đẹp nhưng hơi đông đúc vào cuối tuần.)",
      "rating": "4.5/5"
    }
  ],
  "timeline": [
    {
      "day": "Ngày 1 (BẮT BUỘC KÈM NGÀY/THÁNG cụ thể, VD: 20/10): Tiêu đề tóm tắt",
      "activities": [
        {
          "time": "08:00 - 10:00", 
          "description": "Làm gì, ăn gì, ở đâu. Cụ thể nhưng ngắn gọn.",
          "location": "Tên địa danh cụ thể và chính xác nhất để search Google Maps",
          "estimated_cost": "Chi phí dự kiến cho hoạt động này (Dựa theo số người tham gia. VD: Ăn sáng 2 người = 100k)"
        }
      ]
    }
  ]
}`;

    const userPrompt = `Tôi chọn tuyến: ${routeProposal.title}. Hãy tạo lịch trình cho tôi ngay nhé.`;

    const data = await callGemini(systemPrompt, userPrompt, true);
    
    if (data && data.timeline) {
        state.currentItinerary = data;
        
        import('./history.js').then(m => m.saveItinerary(routeProposal, data));
        
        renderItinerary(data, routeProposal);
        showSection('itinerary');
    } else {
        showSection('proposals'); // fallback
    }
}

export function renderItinerary(data, routeProposal) {
    els.itinerary.title.textContent = routeProposal.title;
    els.itinerary.reason.textContent = routeProposal.description;
    els.itinerary.cost.textContent = data.cost_estimate;
    els.itinerary.fatigue.textContent = data.fatigue_level;
    els.itinerary.weather.textContent = data.weather || "Đang cập nhật...";
    
    els.itinerary.verificationList.innerHTML = '';
    data.verifications.forEach(v => {
        const li = document.createElement('li');
        li.textContent = v;
        els.itinerary.verificationList.appendChild(li);
    });
    
    if (els.itinerary.reviewsList) {
        els.itinerary.reviewsList.innerHTML = '';
        if (data.reviews && data.reviews.length > 0) {
            els.itinerary.reviewsList.parentElement.style.display = 'block';
            data.reviews.forEach(r => {
                const li = document.createElement('li');
                li.style.borderBottom = "1px dashed var(--glass-border)";
                li.style.paddingBottom = "0.5rem";
                li.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <strong style="color: var(--text-color);">${r.author}</strong>
                        <span style="color: #fbbf24; font-weight: 600;">⭐ ${r.rating}</span>
                    </div>
                    <div style="font-size: 0.9em; color: var(--text-muted); font-style: italic;">"${r.comment}"</div>
                `;
                els.itinerary.reviewsList.appendChild(li);
            });
            // Remove border bottom of last element
            if (els.itinerary.reviewsList.lastElementChild) {
                els.itinerary.reviewsList.lastElementChild.style.borderBottom = "none";
                els.itinerary.reviewsList.lastElementChild.style.paddingBottom = "0";
            }
        } else {
            els.itinerary.reviewsList.parentElement.style.display = 'none';
        }
    }
    
    els.itinerary.timeline.innerHTML = '';
    data.timeline.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'timeline-day';
        
        let activitiesHtml = day.activities.map(act => {
            const mapLink = act.location ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}" target="_blank" class="maps-link" title="Xem trên Google Maps">🗺️ Chỉ đường</a>` : '';
            const costHtml = act.estimated_cost ? `<div style="font-size: 0.85em; color: #10b981; font-weight: 500; margin-top: 4px;">💵 ${act.estimated_cost}</div>` : '';
            
            return `
                <div class="activity-item">
                    <div class="activity-time">${act.time}</div>
                    <div class="activity-content">
                        <div class="activity-desc">${act.description}</div>
                        ${costHtml}
                        ${mapLink}
                    </div>
                </div>
            `;
        }).join('');
        
        dayDiv.innerHTML = `
            <div class="day-title">${day.day}</div>
            ${activitiesHtml}
        `;
        els.itinerary.timeline.appendChild(dayDiv);
    });
}

export async function handleQuickEdit(editAction) {
    els.loadingText.textContent = `AI đang điều chỉnh lịch trình: "${editAction}"...`;
    showSection('loading');
    
    const userPrompt = `Người dùng yêu cầu điều chỉnh lịch trình hiện tại với lệnh sau: "${editAction}".
Hãy GIỮ NGUYÊN tuyến đường, chỉ điều chỉnh lại các hoạt động/chi phí/timeline sao cho phù hợp với yêu cầu mới. KHÔNG tạo lại từ đầu nếu không cần thiết. Trả về đúng định dạng JSON như cũ.`;

    const systemPrompt = `Bạn là TripEscape AI. Trả về JSON đúng chuẩn: { "cost_estimate": "", "fatigue_level": "", "weather": "", "verifications": [], "reviews": [{"author":"", "comment":"", "rating":""}], "timeline": [] }`;

    const data = await callGemini(systemPrompt, userPrompt, true);
    
    if (data && data.timeline) {
        state.currentItinerary = data;
        renderItinerary(data, state.currentRoute);
        showSection('itinerary');
        els.buttons.customEditInput.value = '';
    } else {
        showSection('itinerary'); // fallback
    }
}

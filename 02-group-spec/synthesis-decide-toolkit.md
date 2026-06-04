# Toolkit — Từ Evidence Đến Build Slice

Dùng sau khi nhóm đã có evidence. Mục tiêu là chốt một build slice đủ nhỏ cho Day 06.

## 1. Gom evidence thành cụm

Gom theo **workflow/pain**, không gom theo tên feature.

Cụm tốt:

- Cụm 1: Bị quá tải thông tin khi AI trả về quá nhiều option chung chung.
- Cụm 2: Thiếu niềm tin vào chi phí, thời gian di chuyển và tình trạng thực tế do AI đưa ra.
- Cụm 3: Rất khó để chỉnh sửa một phần nhỏ trong lịch trình mà không phải làm lại từ đầu.
- Cụm 4: Cần một quy trình từng bước (workflow) để ra quyết định thay vì chỉ là một danh sách địa điểm rời rạc.

## 2. Viết insight

Form:

```text
Sinh viên/người trẻ muốn đi trốn ngắn ngày không chỉ cần danh sách địa điểm và lịch trình tự động.
Họ thật ra cần một lớp lập kế hoạch (planning layer) hỗ trợ ra quyết định và dễ dàng tinh chỉnh từng phần,
vì khi tự dùng AI, họ thường bị choáng ngợp bởi quá nhiều lựa chọn, thiếu sự kiểm chứng thực tế và khó chỉnh sửa lại từ đầu nếu muốn thay đổi một chi tiết nhỏ.
```

## 3. Viết opportunity

Form:

```text
Cơ hội là dùng AI để augment (hỗ trợ) việc lọc cung đường và cá nhân hóa lịch trình 3 ngày 2 đêm,
giúp user nhanh chóng chốt được một chuyến đi phù hợp với mood, ngân sách và phương tiện,
trong khi vẫn kiểm soát rủi ro thông tin sai lệch bằng cách đánh dấu rõ các điểm "cần kiểm chứng" (giá cả, thời tiết).
```

## 4. Chọn build slice

**Định nghĩa Build Slice cho nhóm:**
- **1 User:** Sinh viên/người trẻ ở khu vực Đồng bằng sông Hồng (Hưng Yên/Hà Nội) muốn đi du lịch "đi trốn" ngắn ngày (2-3 ngày) bằng ô tô tự lái hoặc xe máy.
- **1 Task:** Lên kế hoạch cho một chuyến đi 3 ngày 2 đêm ra biển miền Bắc hoặc Bắc Trung Bộ.
- **1 AI Decision:** Đánh giá mức độ phù hợp của các cung đường dựa trên mood, ngân sách, phương tiện, độ mệt mỏi để gợi ý ra lộ trình tối ưu nhất.
- **1 Output:** Một lịch trình 3 ngày 2 đêm chi tiết bao gồm: timeline từng ngày, ước tính chi phí, mức độ mệt, điểm "cần kiểm chứng", và nút thao tác chỉnh sửa nhanh.

Build slice tốt phải qua 5 câu hỏi:

| Câu hỏi | Đạt khi | Đánh giá của nhóm |
|---|---|---|
| User cụ thể chưa? | Nói được ai dùng, trong bối cảnh nào. | **Đạt.** Sinh viên/người trẻ Hưng Yên/Hà Nội muốn đi trốn ngắn ngày bằng ô tô/xe máy. |
| Task đủ hẹp chưa? | Demo được trong 3-5 phút. | **Đạt.** Chỉ lên lịch trình đúng 3 ngày 2 đêm cho tuyến biển miền Bắc/Bắc Trung Bộ. |
| AI decision rõ chưa? | AI gợi ý/tự làm một việc cụ thể. | **Đạt.** AI lọc, đánh giá mood/ngân sách/độ mệt để đề xuất 2-3 cung phù hợp nhất. |
| Failure path rõ chưa? | Có một case AI không chắc hoặc sai để test. | **Đạt.** AI đưa ra chi phí/thời gian di chuyển chưa kiểm chứng, báo lỗi yêu cầu ảo tưởng. |
| Có evidence không? | Có bằng chứng từ self-use/review/user/competitor. | **Đạt.** Có evidence từ self-use ChatGPT/Gemini, review từ user và học hỏi Layla, Tripadvisor. |

## 5. Quyết định: giữ, giảm scope, hay đổi hướng?

**Quyết định Auto/Augment:** 
- **Chọn:** Augment (Hỗ trợ). 
- **Lý do:** AI không tự động chốt chuyến đi hay đặt vé thay user. AI chỉ lọc option tốt nhất, cung cấp thông tin để user tự ra quyết định cuối cùng và hỗ trợ tinh chỉnh lịch trình.

Bảng quyết định scope:

| Tình huống | Quyết định |
|---|---|
| Evidence yếu, user mơ hồ | Dừng build sâu; quay lại research 20 phút. |
| Ý tưởng quá rộng | Giữ domain, cắt xuống một flow. |
| AI không cần thiết | Dùng rule/manual prototype; ghi rõ vì sao không dùng AI sâu. |
| Rủi ro cao | Chọn augmentation hoặc conditional automation. |
| Không demo được trong 1 ngày | Đưa phần lớn vào backlog, giữ một path nhỏ. |

## 6. Câu chốt cuối

Điền câu này trước khi rời lớp:

```text
Dựa trên bằng chứng từ việc tự dùng AI và quan sát nhu cầu thực tế,
nhóm sẽ build một AI Travel Planning Assistant cho chuyến đi ngắn ngày 3 ngày 2 đêm ra biển miền Bắc/Bắc Trung Bộ,
cho sinh viên/người trẻ ở khu vực Hưng Yên/Hà Nội,
để giải quyết tình trạng bị quá tải thông tin, khó kết nối điểm đến thành lịch trình khả thi và khó chỉnh sửa,
bằng cách AI augment quá trình ra quyết định (hỏi làm rõ -> đề xuất 2-3 cung -> tạo timeline chi tiết -> hỗ trợ chỉnh sửa),
và sẽ test failure path khi AI đưa quá nhiều lựa chọn hoặc thiếu thông tin kiểm chứng làm user rối.
```

## 7. Backlog

Những thứ **không build trong Day 06**:

- Tích hợp booking thực tế (đặt vé máy bay, phòng khách sạn thật).
- Lên lịch trình cho các chuyến đi dài ngày hoặc bay ra nước ngoài/miền Nam.
- Trợ lý AI du lịch đa năng trả lời mọi câu hỏi kiến thức về văn hóa, lịch sử.
- Bản đồ dẫn đường thực tế (turn-by-turn navigation) trong lúc đi.

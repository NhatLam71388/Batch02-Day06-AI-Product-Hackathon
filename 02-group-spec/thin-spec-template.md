# Template — Thin SPEC Cuối Day 05

Thin SPEC không phải PRD đầy đủ. Đây là bản cam kết đủ rõ để sáng Day 06 nhóm build ngay.

## 1. Track, product/app và user

**Track:** AI Travel / Planning Assistant  
**Product/app thật:** ChatGPT/Gemini + workflow app travel trên điện thoại; tham khảo thêm Layla AI Trip Planner và Tripadvisor Trips/TripBuilder.  
**User cụ thể:** Sinh viên/người trẻ ở khu vực Hưng Yên/Hà Nội muốn đi du lịch ngắn ngày 3 ngày 2 đêm bằng ô tô tự lái hoặc xe máy, nhưng ít kinh nghiệm tự chọn cung, tính chi phí và sắp xếp lịch trình.  
**Nhóm có phải user thật không? Nếu không, khác ở đâu?**  
Có, nhóm là sinh viên/người trẻ tại Hưng Yên/Hà Nội, thường xuyên đi phượt hoặc đi chơi cuối tuần tự túc bằng xe máy/ô tô, chính là đối tượng gặp các vấn đề nêu trên.

## 2. Evidence summary

| Evidence | Nguồn | User/pain nói lên điều gì? | SPEC phải đổi gì? |
|---|---|---|---|
| Khi dùng ChatGPT/Gemini, AI trả về lượng thông tin quá lớn, nhiều option gây loạn, user phải tự lọc lại. | Self-use ChatGPT/Gemini | Bị quá tải thông tin, khó đưa ra quyết định chốt cung đường cụ thể. | Thay đổi flow planning: Hỏi rõ nhu cầu trước → đề xuất tối đa 2–3 cung phù hợp → user chọn 1 cung → mới tạo lịch trình chi tiết. |
| AI đưa lịch trình nhanh nhưng thông tin chi phí, thời gian, thời tiết chưa kiểm chứng. | Self-use & Phỏng vấn nhanh sinh viên | Thiếu tin tưởng (trust) vào kế hoạch do AI đề xuất. | Thiết lập cơ chế đánh dấu điểm "cần kiểm chứng" rõ ràng trên giao diện kèm link/nút check lại trên Maps/booking. |
| Muốn đổi ngân sách hoặc lịch trình thì gần như phải hỏi lại và AI generate lại từ đầu. | Self-use & Phỏng vấn user | Khó chỉnh sửa một phần nhỏ trong lịch trình (Correction path yếu). | Bổ sung các nút bấm tinh chỉnh nhanh từng phần (rẻ hơn, ít mệt hơn, biển vắng hơn, đổi sang trời mưa...) không regenerate lại từ đầu. |

## 3. Pain statement

```text
User [sinh viên/người trẻ ở Hưng Yên/Hà Nội muốn đi trốn ngắn ngày bằng ô tô/xe máy] đang gặp khó ở [bước lọc thông tin, chọn cung biển phù hợp, dự tính chi phí thực tế và tinh chỉnh lịch trình],
vì [các AI chatbot thông thường trả về quá nhiều lựa chọn chung chung, thiếu kiểm chứng và bắt làm lại từ đầu khi thay đổi chi tiết, trong khi các app đặt phòng đơn thuần thiếu chức năng lập kế hoạch tổng thể],
dẫn tới [bị choáng ngợp, nghi ngờ độ chính xác của lịch trình và mất nhiều ngày để thống nhất kế hoạch đi].
Bằng chứng chính là [self-use observation khi dùng ChatGPT/Gemini tạo plan rất dài nhưng thiếu tính khả thi, cùng câu nói từ phỏng vấn: "Mỗi lần đổi ngân sách hoặc đổi lịch trình thì gần như phải hỏi lại từ đầu"].
```

## 4. Build slice

```text
Cho [sinh viên/người trẻ ở Hưng Yên/Hà Nội muốn đi trốn ngắn ngày bằng ô tô/xe máy],
prototype sẽ dùng AI để [hỗ trợ (augment) việc làm rõ nhu cầu, sàng lọc cung đường biển Bắc/Bắc Trung Bộ tối ưu và đề xuất lịch trình],
tạo ra [một timeline chi tiết 3 ngày 2 đêm kèm ước tính chi phí, mức độ mệt, các điểm "cần kiểm chứng" và các nút bấm tinh chỉnh nhanh],
và xử lý [yêu cầu không khả thi hoặc thiếu thông tin kiểm chứng] bằng [cảnh báo ảo tưởng, đề xuất cung thay thế và đánh dấu rõ thông tin cần tự xác minh].
```

## 5. Auto/Aug decision

Chọn một:

- [x] **Augmentation:** AI gợi ý/draft/phân loại, user quyết cuối.
- [ ] **Conditional automation:** AI tự làm trong case hẹp; case mơ hồ/rủi ro chuyển người.
- [ ] **Automation:** AI tự quyết và tự hành động.

**Lý do chọn:** Lập kế hoạch du lịch mang tính trải nghiệm cá nhân cao, sở thích mỗi người khác nhau. AI không nên tự đặt phòng/chốt địa điểm thay user mà chỉ lọc, đề xuất 2-3 cung tối ưu và cấu trúc lịch trình để người dùng dễ chọn và chỉnh sửa.  
**Human role:** `decider` (user là người quyết định cuối cùng từ các gợi ý của AI) & `reviewer` (kiểm chứng thông tin).

## 6. Four paths

| Path | Prototype phải thể hiện gì? |
|---|---|
| Happy | User nhập nhu cầu rõ: xuất phát Hưng Yên/Hà Nội, 3 ngày 2 đêm, ô tô tự lái, muốn biển vắng. AI hỏi thêm vài câu làm rõ → đề xuất 2–3 cung phù hợp → user chọn 1 cung → AI tạo timeline chi tiết từng ngày kèm chi phí, độ mệt, điểm cần kiểm chứng. |
| Low-confidence | AI thiếu dữ liệu chắc chắn về giá phòng, thời tiết, giờ mở cửa, thời gian di chuyển. AI không nói chắc mà đánh dấu rõ "cần kiểm chứng" và gợi ý user check trên Maps/booking app trước khi đi. |
| Failure | User nhập yêu cầu bất khả thi: "3 ngày 2 đêm đi Đà Nẵng bằng xe máy từ Hưng Yên, ngân sách 500k/người, không muốn mệt". AI cảnh báo không khả thi và đề xuất cung gần hơn (Hải Tiến, Cát Bà, Cô Tô, Hải Hòa) kèm lý do vì sao. |
| Correction | Sau khi có lịch trình, user nói "rẻ hơn", "ít chạy xe hơn", "biển vắng hơn", "thêm ăn hải sản" hoặc "đổi sang trời mưa". AI chỉ sửa phần liên quan trong lịch trình, không regenerate toàn bộ từ đầu. |

## 7. Failure mode nguy hiểm nhất

```text
Nếu user nhập ý định mơ hồ hoặc thiếu thông tin,
AI có thể trả về quá nhiều option, thông tin chung chung, thiếu kiểm chứng và không hỏi làm rõ nhu cầu,
hậu quả là user bị quá tải, không chọn được cung phù hợp, mất niềm tin và quay lại tự lên plan thủ công.
Prototype sẽ xử lý bằng giới hạn 2–3 option, đánh dấu rõ độ tin cậy, hỏi làm rõ 3–5 câu trước khi generate và cho phép chỉnh nhanh từng phần.
Owner kiểm thử path này là TranVanHuy.
```

## 8. Owner plan cho sáng Day 06

| Thành viên | Việc phụ trách | Bằng chứng cần có trong repo |
|---|---|---|
| TranGiaHuy-2A202600812 (Thành viên 3) | Research / evidence | File `02-group-spec/evidence-pack-template.md` hoàn thiện |
| DinhNguyenNhatLam_2A202600851 (Thành viên 4) | SPEC | File `02-group-spec/thin-spec-template.md` hoàn thiện |
| TaVanHuan-2A202600984 (Thành viên 2) | Prototype | Source code của prototype (giao diện HTML/JS, logic AI API) |
| DinhNguyenNhatLam_2A202600851 (Thành viên 4) | Test / failure path | Phần "Failure mode" trong walkthrough và log test của 3-5 user |
| TranVanHuy-2A202600712 (Thành viên 1) | Demo script / repo | Demo video link/file, file README hướng dẫn chạy, git repository sạch sẽ |

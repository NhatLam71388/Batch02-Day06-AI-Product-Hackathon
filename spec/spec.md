# SPEC Sản Phẩm: TripEscape AI — Trợ Lý Lập Lịch Trình Đi Trốn Ngắn Ngày

**Tên nhóm:** ColorOfDreams  
**Dự án:** TripEscape AI  
**Track:** AI Travel / Planning Assistant  

---

## 1. Bằng chứng (Evidence Summary)

Ý tưởng sản phẩm và các quyết định thiết kế của **TripEscape AI** được xây dựng dựa trên những bằng chứng thực tế sau:

*   **Trải nghiệm trực tiếp (Self-use):** Khi dùng các công cụ AI phổ thông (ChatGPT, Gemini) để lên kế hoạch đi biển miền Bắc 3 ngày 2 đêm:
    *   AI trả về văn bản quá dài, đưa ra quá nhiều tùy chọn địa điểm cùng lúc dẫn đến quá tải thông tin (Information Overload), khiến người dùng khó chốt quyết định.
    *   Các thông tin quan trọng như chi phí thực tế, thời gian di chuyển giữa các điểm, thời tiết hay tình trạng mở cửa của địa điểm thường mang tính ước lượng, thiếu kiểm chứng.
    *   Khi muốn thay đổi một chi tiết nhỏ (ví dụ: đổi sang phương tiện xe máy, giảm ngân sách, hoặc đổi điểm ăn hải sản), AI có xu hướng generate lại toàn bộ từ đầu, làm mất các phần người dùng đã ưng ý trước đó.
*   **Khảo sát và Phỏng vấn người dùng ngoại bộ:** Nhóm tiến hành phỏng vấn nhanh 3-5 sinh viên tại Hà Nội/Hưng Yên và ghi nhận:
    *   *“Tìm chỗ đi thì dễ trên mạng, nhưng để kết hợp các điểm đó thành một lịch trình di chuyển hợp lý theo ngày thì rất mất thời gian.”*
    *   *“Sợ nhất là AI gợi ý giá cả linh tinh, đến nơi bị hớ hoặc giá phòng tăng cao.”*
    *   *“Mỗi lần đổi ngân sách là phải nhập lại từ đầu, rất ức chế.”*
*   **Phân tích đối thủ (Layla.ai, Tripadvisor Trips):** 
    *   *Layla.ai* cung cấp trợ lý AI chuyên biệt nhưng phạm vi quá rộng (toàn cầu, đặt vé máy bay/khách sạn quốc tế), chưa tối ưu cho bối cảnh địa phương Việt Nam (như phượt xe máy, ô tô tự lái đi biển ngắn ngày).
    *   *Tripadvisor Trips* hỗ trợ không gian lưu trữ địa điểm tốt nhưng thiếu lớp lập lịch trình thông minh (AI planning layer) giúp tối ưu hóa tuyến đường di chuyển thực tế.

---

## 2. Lát cắt để build (Build Slice)

Thay vì làm một siêu ứng dụng du lịch đa năng, **TripEscape AI** tập trung giải quyết xuất sắc một lát cắt hẹp:

*   **Đối tượng:** Sinh viên và người trẻ tuổi ở khu vực Hưng Yên/Hà Nội.
*   **Bối cảnh:** Muốn thực hiện một chuyến đi biển miền Bắc hoặc Bắc Trung Bộ (Cát Bà, Hải Tiến, Cô Tô, Sầm Sơn, Hải Hòa) ngắn ngày (3 ngày 2 đêm) bằng ô tô tự lái hoặc xe máy.
*   **Hoạt động của AI:** Thu thập nhu cầu cơ bản qua form hỏi gọn nhẹ -> Đề xuất đúng 2-3 cung đường tối ưu nhất -> Tạo lịch trình chi tiết kèm dự tính chi phí, độ mệt mỏi, các điểm "cần kiểm chứng" và hệ thống nút tinh chỉnh nhanh (Correction).

---

## 3. AI Product Canvas

| Ô | Nội dung chi tiết |
|---|---|
| **Value (Giá trị)** | **Dành cho:** Người trẻ Hà Nội/Hưng Yên muốn đi biển ngắn ngày tự túc.<br>**Nỗi đau:** Quá tải thông tin, lịch trình thiếu tính khả thi, khó chỉnh sửa.<br>**AI giải quyết:** Tự động lọc ra 2-3 cung phù hợp nhất dựa trên phương tiện và mức chịu mệt, cấu trúc timeline 3 ngày 2 đêm rõ ràng, tiết kiệm thời gian lập kế hoạch từ nhiều ngày xuống 5 phút. |
| **Trust (Niềm tin)** | **Hiển thị độ tin cậy:** Đánh dấu rõ các điểm "cần kiểm chứng" (Verify flags) như giá phòng, giá vé tàu phà, thời tiết với icon cảnh báo.<br>**Lối thoát:** Cung cấp link/nút kiểm tra nhanh trên Google Maps/Booking để người dùng xác thực thông tin trước khi đi, tránh ảo tưởng AI. |
| **Feasibility (Khả thi)** | **Chi phí & Độ trễ:** Sử dụng model `gemini-1.5-flash` có tốc độ xử lý nhanh (<3s), chi phí API cực thấp.<br>**Rủi ro lớn nhất:** AI gợi ý sai đường đi hoặc địa điểm đóng cửa.<br>**Giải pháp:** Giới hạn dữ liệu đầu ra trong các cung đường biển miền Bắc quen thuộc có dữ liệu huấn luyện tốt. |
| **Tín hiệu học** | **Thu thập dữ liệu:** Khi user bấm nút tinh chỉnh (ví dụ: "Rẻ hơn", "Ít mệt hơn") hoặc sửa đổi lịch trình, hệ thống ghi nhận lựa chọn đó để điều chỉnh Prompt hệ thống tốt hơn trong các lần chạy sau. |

---

## 4. Tăng năng lực (Augmentation) hay Tự động hóa (Automation)

**Lựa chọn:** **Augmentation (Tăng năng lực quyết định cho con người).**

*   **Lý do:** Du lịch tự túc mang tính cá nhân hóa rất cao về sở thích ăn uống, nghỉ ngơi. AI không thể và không nên tự động thanh toán, đặt phòng hay chốt địa điểm thay cho người dùng. 
*   **Vai trò của AI:** Đóng vai trò là một "Co-planner" (người đồng hành lập kế hoạch), gợi ý các phương án tối ưu, lọc bớt thông tin thừa và cảnh báo rủi ro.
*   **Vai trò của con người:** Người dùng giữ quyền quyết định cuối cùng (`Decider`) bằng cách chọn cung đường mình thích nhất và chủ động kiểm chứng thông tin thực tế (`Reviewer`).

---

## 5. Bốn đường đi của trải nghiệm (Four Paths)

Ứng dụng được thiết kế để xử lý mượt mà cả 4 tình huống trải nghiệm của người dùng:

1.  **Đường thuận (Happy Path):**
    *   User nhập yêu cầu rõ ràng: Đi từ Hà Nội, đi bằng ô tô, thích yên tĩnh, chịu mệt trung bình, ngân sách 2.5 triệu/người.
    *   AI đề xuất 2 cung đường phù hợp (ví dụ: Hải Tiến - Biển vắng nghỉ mát & Cát Bà - Vịnh biển khám phá). User chọn Hải Tiến.
    *   AI tạo lịch trình chi tiết 3 ngày 2 đêm hợp lý, hiển thị chi phí dự tính sát thực tế và các điểm ăn uống nghỉ ngơi phù hợp.
2.  **Khi AI không chắc (Low-Confidence Path):**
    *   AI thiếu thông tin thời tiết chính xác hoặc giá dịch vụ mùa cao điểm.
    *   Giao diện hiển thị các cảnh báo màu vàng kèm biểu tượng ⚠️ tại các mục tương ứng (Ví dụ: *"⚠️ Giá phòng mùa hè tại Cát Bà có thể biến động 30-50%, cần gọi điện kiểm tra trước"*).
3.  **Khi AI sai / Yêu cầu bất khả thi (Failure Path):**
    *   User nhập yêu cầu không thực tế: *"Đi từ Hưng Yên vào Đà Nẵng bằng xe máy 3 ngày 2 đêm, ngân sách 500k, không muốn mệt"*.
    *   Hệ thống không cố tạo lịch trình lỗi, mà hiển thị bảng cảnh báo ảo tưởng: Nêu rõ lý do vì sao cung đường này không khả thi (quá xa, quá mệt, ngân sách không đủ chi trả xăng xe và phà vé) và tự động đề xuất cung đường gần hơn để thay thế (Hải Tiến hoặc Sầm Sơn).
4.  **Khi người dùng sửa (Correction Path):**
    *   Khi có lịch trình, user muốn thay đổi ngân sách hoặc giảm di chuyển. Thay vì nhập lại prompt dài, user click vào các nút tinh chỉnh nhanh:
        *   `💸 Rẻ hơn (Budget-friendly)`
        *   `☕ Ít mệt hơn (Relaxed pace)`
        *   `⛺ Biển hoang sơ hơn (Quiet beach)`
        *   `🌧️ Đổi phương án trời mưa`
    *   AI sẽ điều chỉnh lại lịch trình hiện tại theo yêu cầu cụ thể này, giữ nguyên bộ khung cũ và highlight các phần thay đổi để user nhận biết.

---

## 6. Những kiểu lỗi đáng lo nhất và cách xử lý

1.  **Ảo tưởng địa điểm (Hallucination):** AI đề xuất một quán ăn đã đóng cửa hoặc một tuyến đường không đi được bằng ô tô (ví dụ đi phà Tuần Châu nhưng sai giờ phà).
    *   *Cách xử lý:* Giới hạn dữ liệu gợi ý của AI trong danh sách các địa điểm nổi tiếng đã được kiểm chứng ở miền Bắc; luôn đính kèm nút "Tìm trên Google Maps" bên cạnh địa điểm để user check lại thông tin nhanh chóng.
2.  **Ước tính chi phí sai lệch lớn:** AI tính toán chi phí quá thấp hoặc quá cao so với thực tế.
    *   *Cách xử lý:* Cung cấp bảng chi phí chi tiết theo các hạng mục (Di chuyển, Lưu trú, Ăn uống, Vé tham quan) để user tự điều chỉnh theo thực tế.

---

## 7. Kế hoạch kiểm thử và bằng chứng demo

Khi trình diễn demo trước giảng viên và các nhóm khác, chúng tôi sẽ chạy thực tế các kịch bản sau:

*   **Test Case 1 (Happy Path):** Nhập thông tin xuất phát từ Hà Nội đi Cát Bà bằng ô tô tự lái, phong cách nghỉ dưỡng -> Show lịch trình chi tiết và bảng giá phòng phà dự kiến.
*   **Test Case 2 (Failure Path):** Nhập yêu cầu đi Phú Quốc bằng xe máy trong 3 ngày từ Hưng Yên -> Hệ thống hiện cảnh báo bất khả thi và đề xuất đi Cô Tô hoặc Cát Bà kèm phân tích thời gian di chuyển.
*   **Test Case 3 (Correction Path):** Từ lịch trình Cát Bà ban đầu, bấm nút "Rẻ hơn" -> Hệ thống cập nhật khách sạn bình dân hơn, giảm ăn nhà hàng sang trọng và highlight phần tiết kiệm chi phí.

---

## 8. Phân công công việc (ColorOfDreams)

| Thành viên | Vai trò | Công việc cụ thể |
|---|---|---|
| **Trần Văn Huy** (2A202600712) | Nhóm trưởng & Demo Script | Viết kịch bản demo, quản lý repo, chuẩn bị slide thuyết trình và quay video sản phẩm. |
| **Tạ Văn Huân** (2A202600984) | Lập trình viên chính (Frontend & Logic) | Xây dựng giao diện HTML/CSS, lập trình JS tương tác, cấu trúc dữ liệu giao diện và định dạng Mock/API. |
| **Trần Gia Huy** (2A202600812) | Nhà nghiên cứu (Research & Prompt) | Nghiên cứu dữ liệu các cung đường, viết và tối ưu hóa System Instructions/Prompts cho Gemini API. |
| **Đinh Nguyễn Nhật Lâm** (2A202600851) | Kiểm thử viên (Test & Quality) | Thực hiện kiểm thử 4 paths, log lỗi, thu thập phản hồi của 3-5 user chạy thử nghiệm và viết Walkthrough. |

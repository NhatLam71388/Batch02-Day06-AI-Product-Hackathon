# Codebase - TripEscape AI Fullstack

Chào mừng đến với mã nguồn nguyên mẫu (prototype) của **TripEscape AI** — Trợ lý lập lịch trình đi trốn biển miền Bắc/Bắc Trung Bộ 3 ngày 2 đêm dành cho người trẻ ở Hà Nội/Hưng Yên đi bằng ô tô hoặc xe máy.

Ứng dụng được xây dựng theo kiến trúc **Fullstack (Node.js/Express Backend + Vanilla Frontend)** bởi nhóm **ColorOfDreams**.

---

## 1. Thành viên và Phân công công việc

| Thành viên | Mã học viên | Vai trò | Công việc cụ thể |
|---|---|---|---|
| **Trần Văn Huy** | 2A202600712 | Leader & Demo Script | Lên kịch bản demo, quay video, chuẩn bị slide, quản lý repository. |
| **Tạ Văn Huân** | 2A202600984 | Main Developer | Xây dựng cấu trúc HTML/CSS, lập trình server Express và giao tiếp API Frontend. |
| **Trần Gia Huy** | 2A202600812 | AI Engineer | Nghiên cứu dữ liệu, thiết kế cấu trúc prompt và System Instructions gọi API Gemini. |
| **Đinh Nguyễn Nhật Lâm** | 2A202600851 | QA & Tester | Chạy thử nghiệm với người dùng thực tế, tìm lỗi, kiểm tra các kịch bản lỗi và viết SPEC. |

---

## 2. Hướng dẫn cài đặt và vận hành

Kiến trúc mới sử dụng máy chủ Express để phục vụ giao diện và bảo mật API Key của Gemini.

### Bước 1: Cài đặt thư viện (Dependencies)
Mở terminal tại thư mục `codebase/` và chạy lệnh sau để cài đặt các gói cần thiết (`express`, `cors`, `dotenv`, `@google/generative-ai`):
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường (Environment Variables)
1. Copy file mẫu `.env.example` thành file `.env`:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` và điền mã API Key Gemini của bạn:
   ```env
   GEMINI_API_KEY=AIzaSy... (API Key của bạn)
   PORT=3000
   ```
*(Lưu ý: Tệp `.env` đã được cấu hình trong `.gitignore` để không bao giờ bị commit lên Git, bảo vệ mã khoá của bạn tuyệt đối).*

### Bước 3: Khởi động máy chủ
Chạy lệnh sau để khởi động server:
```bash
npm start
```
Nếu bạn đang trong quá trình phát triển và muốn server tự động tải lại khi đổi code, chạy:
```bash
npm run dev
```

Server sẽ khởi chạy tại địa chỉ: **`http://localhost:3000`**. Hãy mở đường link này trên trình duyệt để sử dụng ứng dụng.

---

## 3. Các chế độ hoạt động của AI Engine

Backend tự động kiểm tra và chuyển chế độ động cơ AI thông minh:

1. **Chế độ Demo (Mocking) - Tự động kích hoạt khi thiếu API Key:**
   * Nếu không cấu hình tệp `.env` hoặc để trống `GEMINI_API_KEY`, server sẽ phục vụ dữ liệu mock chuẩn hóa cực kỳ chân thực (Cát Bà, Hải Tiến, Cô Tô) cùng các thuật toán điều chỉnh tương ứng.
   * Đảm bảo việc demo luôn diễn ra mượt mà không lo lỗi kết nối hay hết hạn gói API.
2. **Chế độ Live API (Gemini 1.5 Flash):**
   * Khi điền API Key hợp lệ vào `.env`, backend sẽ gọi trực tiếp đến API của Google để lập kế hoạch du lịch và tinh chỉnh theo thời gian thực dựa trên AI thật.

---

## 4. Minh hoạ 4 Đường đi Trải nghiệm (4 Paths)

* **Happy Path:** Khảo sát -> Đề xuất cung đường -> Hiển thị timeline chi tiết 3 ngày 2 đêm, bảng dự toán chi phí, chỉ số mệt mỏi và liên kết bản đồ.
* **Low-Confidence Path:** Các thông tin giá cả, thời tiết hoặc phà đò chưa chắc chắn được server đánh dấu ⚠️ kèm link hướng dẫn kiểm tra trực tiếp.
* **Failure Path:** Người dùng nhập yêu cầu di chuyển bất khả thi (Ví dụ: đi Nha Trang bằng xe máy trong 3 ngày) -> Hệ thống phát hiện, hiển thị cảnh báo đỏ và tự đề xuất cung đường gần thay thế.
* **Correction Path:** Bấm các nút tinh chỉnh `Rẻ hơn`, `Ít mệt hơn`, `Trời mưa` -> Server nhận dạng hành động và cập nhật trực tiếp trên khung lịch trình hiện tại, highlight các hoạt động bị thay đổi.

# HỆ THỐNG QUẢN LÝ NHÂN SỰ & BẢNG LƯƠNG (HRM & PAYROLL)
> **BÀI TẬP LỚN MÔN: PHÁT TRIỂN ỨNG DỤNG WEB NÂNG CAO**  
> **Nhóm thực hiện**: Nhóm 6  
> **Mô hình triển khai**: Fullstack Containerized (PostgreSQL + Express.js + React.js Vite + Ant Design)

---

## 1. Tổng Quan & Công Nghệ Sử Dụng

### Tech Stack:
* **Database**: PostgreSQL 16 (Chạy qua Docker container `hrm_postgres`, cổng `5432`).
* **Backend**: Node.js (v20), Express.js, thư viện `pg` (Connection Pool), `jsonwebtoken`, `bcryptjs`, `nodemailer`.
* **Frontend**: React.js 18/19 (Vite), React Router DOM v6, Axios, Ant Design 5 (`antd`), `@ant-design/icons`, Day.js.
* **Containerization**: Docker & Docker Compose (`postgres_db`, `backend`, `frontend`).

---

## 2. Thông Tin Tài Khoản Mặc Định & Dữ Liệu Khởi Tạo (Seed Data)

Khi hệ thống khởi chạy lần đầu, CSDL sẽ tự động tạo cấu trúc 4 bảng và nạp sẵn dữ liệu ban đầu:

* **Tài khoản Quản trị HR mặc định**:
  * **Email**: `admin@hrm.vn`
  * **Mật khẩu**: `Admin@123`
  * *(Đã được kích hoạt sẵn `is_verified = true`, có thể đăng nhập ngay hoặc bấm nút "Điền nhanh" ở màn hình Login)*.
* **Quy trình Đăng ký tài khoản mới & Xác thực OTP**:
  1. Người dùng vào trang `/register` đăng ký tài khoản.
  2. Hệ thống tạo mã OTP 6 chữ số ngẫu nhiên (hạn 5 phút) và gửi email qua Nodemailer.
  3. Ở môi trường chạy thử (dev/local), **mã OTP được in trực tiếp ra Terminal Backend** và hiển thị gợi ý trên giao diện để thầy cô/người chấm thi test nhanh mà không bắt buộc phải cấu hình tài khoản Gmail thật.
  4. Nhập mã OTP vào trang `/verify-otp` để kích hoạt tài khoản trước khi đăng nhập.

---

## 3. Các Chức Năng Chính Hoàn Thiện

1. **Xác thực & Bảo mật (Auth & OTP)**:
   * Đăng ký, gửi OTP 6 số xác thực tài khoản qua email.
   * Gửi lại mã OTP (Resend OTP) kèm đồng hồ đếm ngược.
   * Đăng nhập bảo mật JWT, mã hóa mật khẩu 1 chiều bằng `bcryptjs`.
   * Middleware `verifyToken` bảo vệ toàn bộ API nội bộ và tự động xử lý khi hết hạn token (401).

2. **Bảng Điều Khiển (Dashboard Tổng Quan)**:
   * Thống kê 4 thẻ chỉ số: Tổng số nhân sự, Tổng số phòng ban, Tổng quỹ lương dự kiến tháng, Tình trạng chi trả lương.
   * Biểu đồ tỷ lệ phân bổ nhân sự theo từng phòng ban kèm thanh tiến độ (Progress bar).
   * Danh sách 5 nhân sự mới tuyển dụng gần đây.
   * Phím tắt hành động nhanh (Quick Actions).

3. **Quản lý Hồ sơ Nhân sự (Employees CRUD)**:
   * Danh sách nhân viên kết hợp thông tin phòng ban (`LEFT JOIN departments`).
   * Thanh tìm kiếm đa năng (theo họ tên, email, chức vụ, số điện thoại).
   * Bộ lọc nhanh theo phòng ban (`<Select>`).
   * Modal Thêm mới / Chỉnh sửa nhân sự với đầy đủ ràng buộc và định dạng tiền tệ VNĐ.
   * Xóa nhân sự có xác nhận an toàn (`Popconfirm`).

4. **Quản lý Danh mục Phòng ban (Departments CRUD)**:
   * Danh sách phòng ban kèm huy hiệu đếm số lượng nhân sự trực thuộc (`COUNT(employees.id)`).
   * Thêm mới / Chỉnh sửa mã phòng ban, tên phòng ban và mô tả chức năng nhiệm vụ.
   * Xóa phòng ban an toàn (ràng buộc `ON DELETE SET NULL` giúp nhân sự không bị mất dữ liệu).

5. **Quản lý & Tính Bảng Lương (Payroll Management)**:
   * **Công thức tính lương chuẩn**:
     $$\text{Lương 1 ngày} = \frac{\text{Lương cơ bản} \times \text{Hệ số}}{26}$$
     $$\text{Lương thực lĩnh} = (\text{Lương 1 ngày} \times \text{Số ngày công}) + \text{Phụ cấp} - \text{Giảm trừ}$$
   * Bộ lọc bảng lương đa chiều theo: **Tháng**, **Năm**, **Phòng ban**, **Trạng thái chi trả**.
   * Thanh tổng kết quỹ lương tháng hiển thị định dạng VNĐ thời gian thực.
   * Modal Tính phiếu lương thông minh: Tự động tải lương cơ bản & hệ số khi chọn nhân viên, xem trước trực tiếp kết quả tính toán (Live Calculation Preview).
   * Hỗ trợ cập nhật / ghi đè (Upsert) tránh trùng lặp dữ liệu phiếu lương trong cùng một tháng.
   * Nút **Chốt lương** (`PAID`) / **Hủy chốt** (`UNPAID`) kèm Tag màu sắc trạng thái trực quan.

---

## 4. Hướng Dẫn Khởi Chạy Ứng Dụng

### Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng - Nhanh nhất)
Chỉ với 1 lệnh duy nhất, toàn bộ PostgreSQL, Backend và Frontend sẽ được build và khởi chạy độc lập:

```bash
docker compose up -d
```

Sau khi chạy xong:
* **Frontend UI**: Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)
* **Backend API**: Truy cập: [http://localhost:5000/api/health](http://localhost:5000/api/health)
* **Cơ sở dữ liệu PostgreSQL**: Cổng `5432` (`hrm_db`).

*(Để dừng hệ thống: `docker compose down`)*

---

### Cách 2: Khởi chạy thủ công trên máy thật (Local Development)

#### Bước 1: Khởi chạy PostgreSQL
Đảm bảo PostgreSQL đang chạy trên cổng 5432 với database `hrm_db` (hoặc chạy container DB: `docker compose up -d postgres_db`).

#### Bước 2: Chạy Backend
```bash
cd backend
npm install
npm run dev
# Server sẽ lắng nghe tại http://localhost:5000
```

#### Bước 3: Chạy Frontend
```bash
cd frontend
npm install
npm run dev
# Mở trình duyệt tại http://localhost:3000
```

---

## 5. Cấu Trúc Thư Mục Dự Án

```text
BTL_Nhóm_6/
├── docker-compose.yml          # Cấu hình container Docker 3 dịch vụ
├── AGENT.md                    # Tài liệu yêu cầu chi tiết đề tài
├── README.md                   # Hướng dẫn cài đặt và sử dụng
├── backend/
│   ├── server.js               # Điểm bắt đầu của ứng dụng Backend
│   ├── src/
│   │   ├── app.js              # Cấu hình Express, CORS, JSON Parser, Routes
│   │   ├── config/
│   │   │   ├── db.js           # Quản lý kết nối PostgreSQL pg.Pool
│   │   │   ├── initDb.js       # Tự động khởi tạo schema và seed dữ liệu ban đầu
│   │   │   └── mailer.js       # Cấu hình Nodemailer gửi mail OTP
│   │   ├── controllers/        # Xử lý logic Auth, Employee, Department, Salary, Dashboard
│   │   ├── middlewares/        # Xác thực Token, Phân quyền, Bắt lỗi tập trung
│   │   ├── routes/             # Định tuyến API
│   │   ├── services/           # Gửi mail HTML chứa OTP
│   │   └── utils/              # Sinh JWT, Công thức tính lương chuẩn
│   └── .env                    # Biến môi trường
└── frontend/
    ├── vite.config.js          # Cấu hình Vite (host: 0.0.0.0, port: 3000)
    └── src/
        ├── App.jsx             # Cấu hình Routing, Ant Design Theme ConfigProvider
        ├── api/                # Axios Client, AuthApi, EmployeeApi, SalaryApi, v.v.
        ├── context/            # AuthContext lưu trữ trạng thái đăng nhập
        ├── components/         # ProtectedRoute, MainLayout (Sider, Header, Footer)
        └── pages/              # Login, Register, VerifyOtp, Dashboard, Employees, Departments, Salaries, NotFound
```

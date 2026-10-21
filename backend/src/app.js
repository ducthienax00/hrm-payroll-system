const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');

// Khởi tạo Express App
const app = express();

// Middlewares cơ bản
app.use(cors({
    origin: '*', // Cho phép kết nối từ client frontend (hoặc localhost:3000)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint kiểm tra trạng thái hoạt động của server
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'HRM & Payroll Management Backend',
    });
});

// Đăng ký các Route API chính
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/employees', require('./routes/employee.routes'));
app.use('/api/salaries', require('./routes/salary.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Xử lý 404 Route không tồn tại
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống!`,
    });
});

// Middleware xử lý lỗi tập trung (phải đặt sau tất cả các route)
app.use(errorHandler);

module.exports = app;

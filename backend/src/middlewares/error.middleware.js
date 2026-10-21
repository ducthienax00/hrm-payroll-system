/**
 * Middleware xử lý lỗi tập trung toàn ứng dụng
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ [Global Error Handler]:', err.stack || err.message);

    // Xử lý lỗi PostgreSQL thường gặp
    if (err.code === '23505') {
        // Unique violation (ví dụ trùng email hoặc trùng bản ghi lương tháng)
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu đã tồn tại trong hệ thống (vi phạm ràng buộc duy nhất)!',
            detail: err.detail,
        });
    }

    if (err.code === '23503') {
        // Foreign key violation
        return res.status(400).json({
            success: false,
            message: 'Không thể thực hiện do ràng buộc khóa ngoại (dữ liệu liên quan không tồn tại)!',
            detail: err.detail,
        });
    }

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Đã có lỗi hệ thống xảy ra trên máy chủ!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = {
    errorHandler,
};

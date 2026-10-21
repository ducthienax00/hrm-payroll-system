const { getTransporter } = require('../config/mailer');

/**
 * Gửi email chứa mã OTP xác thực tài khoản
 * @param {string} toEmail - Địa chỉ email người nhận
 * @param {string} otpCode - Mã OTP 6 chữ số
 * @param {string} fullName - Tên người nhận
 */
const sendOtpEmail = async (toEmail, otpCode, fullName = 'Người dùng') => {
    const transporter = getTransporter();

    const fromAddress = process.env.EMAIL_FROM || '"HRM System" <noreply@hrm.vn>';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
            .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #1890ff, #096dd9); padding: 30px 20px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; color: #333333; line-height: 1.6; }
            .otp-box { text-align: center; margin: 25px 0; padding: 15px; background: #e6f7ff; border: 2px dashed #1890ff; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #096dd9; }
            .footer { background: #fafafa; padding: 20px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #f0f0f0; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>Hệ Thống HRM & Quản Lý Bảng Lương</h1>
            </div>
            <div class="content">
                <p>Xin chào <strong>${fullName}</strong>,</p>
                <p>Bạn đã đăng ký tài khoản trên hệ thống quản lý nhân sự HRM. Vui lòng sử dụng mã xác thực OTP bên dưới để kích hoạt tài khoản của bạn:</p>
                <div class="otp-box">
                    <div class="otp-code">${otpCode}</div>
                </div>
                <p>Mã OTP này có hiệu lực trong <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
            </div>
            <div class="footer">
                <p>© 2026 HRM System - Nhóm 6 BTL Web Nâng Cao. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // In mã OTP ra màn hình terminal để hỗ trợ test nhanh mà không bắt buộc phải check mail
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔐 [MÃ OTP XÁC THỰC CHO ${toEmail}]: ====> ${otpCode} <====`);
    console.log('⏰ Thời hạn: 5 phút');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: `[HRM System] Mã xác thực OTP tài khoản của bạn: ${otpCode}`,
            html: htmlContent,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('⚠️ Không thể gửi mail qua SMTP, nhưng OTP đã được ghi log:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOtpEmail,
};

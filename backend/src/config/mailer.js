const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const createTransporter = () => {
    if (transporter) return transporter;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Nếu cấu hình email khả dụng (không phải placeholder mặc định)
    const isRealCredentials = emailUser && emailPass && 
        !emailUser.includes('your_email') && 
        !emailPass.includes('your_gmail');

    if (isRealCredentials) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
        console.log('📧 [Mailer]: Đã cấu hình Gmail SMTP thành công.');
    } else {
        // Chế độ mô phỏng / Development logger
        console.log('ℹ️ [Mailer]: Đang chạy chế độ Development (mã OTP sẽ được in trực tiếp ra Terminal).');
        transporter = {
            sendMail: async (mailOptions) => {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('📨 [MÔ PHỎNG EMAIL GỬI ĐẾN]:', mailOptions.to);
                console.log('📌 [TIÊU ĐỀ]:', mailOptions.subject);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                return { messageId: 'dev-mock-id-' + Date.now() };
            }
        };
    }

    return transporter;
};

module.exports = {
    getTransporter: createTransporter,
};

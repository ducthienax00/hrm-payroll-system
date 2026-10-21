// Nạp biến môi trường
require('dotenv').config()

// Lấy class Pool từ thư viện pg
const { Pool } = require('pg')

let connectionString = process.env.DATABASE_URL

// Tự động tương thích: Nếu chạy trực tiếp trên host ngoài Docker
// mà URL đang trỏ về service name 'postgres_db', tự chuyển sang 'localhost'
if (process.platform === 'win32' && connectionString && connectionString.includes('@postgres_db:')) {
    connectionString = connectionString.replace('@postgres_db:', '@localhost:')
}

// Khởi tạo một Connect Pool duy nhất dùng chung cho toàn bộ app
const pool = new Pool({
    connectionString,
})

// Sự kiện: Khi một clinet mới kết nối thành công vào Pool
pool.on('connect', () => {
    console.log('✅ [Database]: Đã kết nối PostgreSQL thành công!')
})

// Sự kiện: Bắt lỗi bất ngờ khi đang duy trì kết nối
pool.on('error', (err) => {
    console.log('❌ [Database Error]: Lỗi kết nối CSDL đột ngột:', err.message)
})

// Xuất hàm query để các controller sau gọi trực tiếp
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
}
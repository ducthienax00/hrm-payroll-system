const db = require('./src/config/db')

async function testConnection() {
    try {
        // Chạy thử câu truy vấn 
        const res = await db.query('SELECT NOW()')
        console.log('🎉 Kết nối CSDL hoàn tất! Giờ hệ thống Postgres là:', res.rows[0].now)
        process.exit(0)
    } catch (error) {
        console.log('❌ Lỗi kết nối CSDL:', error.message)
        process.exit(1)
    }
}

testConnection();
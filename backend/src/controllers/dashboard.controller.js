const db = require('../config/db');

/**
 * Lấy các chỉ số thống kê tổng quan cho Dashboard
 * GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // 1. Tổng số nhân viên
        const empCountRes = await db.query('SELECT COUNT(*)::int AS count FROM employees');
        const totalEmployees = empCountRes.rows[0].count;

        // 2. Tổng số phòng ban
        const deptCountRes = await db.query('SELECT COUNT(*)::int AS count FROM departments');
        const totalDepartments = deptCountRes.rows[0].count;

        // 3. Tổng quỹ lương dự kiến trong tháng hiện tại
        const salaryStatsRes = await db.query(`
            SELECT 
                COALESCE(SUM(final_salary), 0)::numeric AS total_payroll,
                COUNT(*)::int AS total_slips,
                COUNT(*) FILTER (WHERE payment_status = 'PAID')::int AS paid_slips,
                COUNT(*) FILTER (WHERE payment_status = 'UNPAID')::int AS unpaid_slips
            FROM salaries 
            WHERE month = $1 AND year = $2
        `, [currentMonth, currentYear]);

        const salaryStats = salaryStatsRes.rows[0];

        // 4. Phân bổ nhân sự theo từng phòng ban
        const deptDistributionRes = await db.query(`
            SELECT 
                d.id,
                d.dept_code,
                d.name,
                COUNT(e.id)::int AS employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            GROUP BY d.id
            ORDER BY employee_count DESC;
        `);

        // 5. Nhân viên mới tuyển gần đây (Top 5)
        const recentEmployeesRes = await db.query(`
            SELECT 
                e.id,
                e.full_name,
                e.email,
                e.position,
                TO_CHAR(e.hire_date, 'YYYY-MM-DD') AS hire_date,
                d.name AS department_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY e.id DESC
            LIMIT 5;
        `);

        res.status(200).json({
            success: true,
            data: {
                currentMonth,
                currentYear,
                totalEmployees,
                totalDepartments,
                totalPayrollCurrentMonth: parseFloat(salaryStats.total_payroll),
                totalSlips: salaryStats.total_slips,
                paidSlips: salaryStats.paid_slips,
                unpaidSlips: salaryStats.unpaid_slips,
                departmentDistribution: deptDistributionRes.rows,
                recentEmployees: recentEmployeesRes.rows,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
};

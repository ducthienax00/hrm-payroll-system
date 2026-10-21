const db = require('../config/db');
const { calculateSalary: doSalaryCalculation } = require('../utils/salaryCalculator');

/**
 * Lấy danh sách bảng lương (hỗ trợ lọc theo tháng, năm, phòng ban, trạng thái)
 * GET /api/salaries?month=&year=&department_id=&payment_status=
 */
const getSalaries = async (req, res, next) => {
    try {
        const { month, year, department_id, payment_status } = req.query;

        let queryText = `
            SELECT 
                s.id,
                s.employee_id,
                s.month,
                s.year,
                s.work_days,
                s.allowance,
                s.deductions,
                s.final_salary,
                s.payment_status,
                s.created_at,
                e.full_name AS employee_name,
                e.email AS employee_email,
                e.position AS employee_position,
                e.base_salary,
                e.salary_coefficient,
                d.id AS department_id,
                d.name AS department_name,
                d.dept_code AS department_code
            FROM salaries s
            JOIN employees e ON s.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE 1=1
        `;

        const queryParams = [];
        let paramIndex = 1;

        if (month) {
            queryText += ` AND s.month = $${paramIndex}`;
            queryParams.push(parseInt(month, 10));
            paramIndex++;
        }

        if (year) {
            queryText += ` AND s.year = $${paramIndex}`;
            queryParams.push(parseInt(year, 10));
            paramIndex++;
        }

        if (department_id && department_id !== 'all') {
            queryText += ` AND e.department_id = $${paramIndex}`;
            queryParams.push(parseInt(department_id, 10));
            paramIndex++;
        }

        if (payment_status && payment_status !== 'all') {
            queryText += ` AND s.payment_status = $${paramIndex}`;
            queryParams.push(payment_status.trim().toUpperCase());
            paramIndex++;
        }

        queryText += ` ORDER BY s.year DESC, s.month DESC, s.id DESC`;

        const result = await db.query(queryText, queryParams);

        // Tính tổng tiền lương của danh sách hiện tại
        const totalAmount = result.rows.reduce((sum, item) => sum + parseFloat(item.final_salary || 0), 0);

        res.status(200).json({
            success: true,
            total: result.rows.length,
            totalAmount,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Tính và lưu phiếu lương cho nhân viên
 * POST /api/salaries/calculate
 */
const calculateSalary = async (req, res, next) => {
    try {
        const {
            employee_id,
            month,
            year,
            work_days = 26,
            allowance = 0,
            deductions = 0,
            payment_status = 'UNPAID',
        } = req.body;

        if (!employee_id || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn nhân viên, tháng và năm tính lương!',
            });
        }

        const parsedEmpId = parseInt(employee_id, 10);
        const parsedMonth = parseInt(month, 10);
        const parsedYear = parseInt(year, 10);
        const parsedWorkDays = parseFloat(work_days);
        const parsedAllowance = parseFloat(allowance) || 0;
        const parsedDeductions = parseFloat(deductions) || 0;

        if (parsedMonth < 1 || parsedMonth > 12) {
            return res.status(400).json({
                success: false,
                message: 'Tháng không hợp lệ (phải từ 1 đến 12)!',
            });
        }

        // Lấy thông tin lương cơ bản và hệ số từ nhân viên
        const empRes = await db.query('SELECT * FROM employees WHERE id = $1', [parsedEmpId]);
        if (empRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin nhân viên!',
            });
        }

        const employee = empRes.rows[0];
        const { dailySalary, finalSalary } = doSalaryCalculation(
            employee.base_salary,
            employee.salary_coefficient,
            parsedWorkDays,
            parsedAllowance,
            parsedDeductions
        );

        // Sử dụng INSERT ... ON CONFLICT để cập nhật nếu đã tồn tại bản ghi cho nhân viên tháng đó (Upsert)
        const upsertQuery = `
            INSERT INTO salaries (
                employee_id,
                month,
                year,
                work_days,
                allowance,
                deductions,
                final_salary,
                payment_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (employee_id, month, year)
            DO UPDATE SET 
                work_days = EXCLUDED.work_days,
                allowance = EXCLUDED.allowance,
                deductions = EXCLUDED.deductions,
                final_salary = EXCLUDED.final_salary,
                payment_status = EXCLUDED.payment_status
            RETURNING *;
        `;

        const result = await db.query(upsertQuery, [
            parsedEmpId,
            parsedMonth,
            parsedYear,
            parsedWorkDays,
            parsedAllowance,
            parsedDeductions,
            finalSalary,
            payment_status.trim().toUpperCase(),
        ]);

        res.status(201).json({
            success: true,
            message: `Đã tính và lưu bảng lương tháng ${parsedMonth}/${parsedYear} cho nhân viên ${employee.full_name}!`,
            calculationDetails: {
                dailySalary,
                baseSalary: employee.base_salary,
                salaryCoefficient: employee.salary_coefficient,
                workDays: parsedWorkDays,
                allowance: parsedAllowance,
                deductions: parsedDeductions,
                finalSalary,
            },
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật trạng thái thanh toán (UNPAID / PAID)
 * PATCH /api/salaries/:id/status
 */
const updateSalaryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const checkSalary = await db.query('SELECT * FROM salaries WHERE id = $1', [id]);
        if (checkSalary.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiếu lương!',
            });
        }

        // Tự động chuyển đổi trạng thái nếu không truyền status cụ thể
        let newStatus = payment_status;
        if (!newStatus) {
            newStatus = checkSalary.rows[0].payment_status === 'PAID' ? 'UNPAID' : 'PAID';
        } else {
            newStatus = newStatus.trim().toUpperCase();
        }

        const updateQuery = `
            UPDATE salaries 
            SET payment_status = $1 
            WHERE id = $2 
            RETURNING *;
        `;

        const result = await db.query(updateQuery, [newStatus, id]);

        res.status(200).json({
            success: true,
            message: `Đã cập nhật trạng thái bảng lương thành: ${newStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}`,
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa một phiếu lương
 * DELETE /api/salaries/:id
 */
const deleteSalary = async (req, res, next) => {
    try {
        const { id } = req.params;

        const checkSalary = await db.query('SELECT id FROM salaries WHERE id = $1', [id]);
        if (checkSalary.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiếu lương cần xóa!',
            });
        }

        await db.query('DELETE FROM salaries WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: 'Đã xóa phiếu lương thành công!',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSalaries,
    calculateSalary,
    updateSalaryStatus,
    deleteSalary,
};

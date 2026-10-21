const db = require('../config/db');

/**
 * Lấy danh sách nhân viên (hỗ trợ tìm kiếm theo từ khóa và lọc theo phòng ban)
 * GET /api/employees?search=&department_id=
 */
const getEmployees = async (req, res, next) => {
    try {
        const { search, department_id } = req.query;

        let queryText = `
            SELECT 
                e.id,
                e.full_name,
                e.email,
                e.phone,
                e.position,
                e.department_id,
                e.base_salary,
                e.salary_coefficient,
                TO_CHAR(e.hire_date, 'YYYY-MM-DD') AS hire_date,
                e.created_at,
                d.name AS department_name,
                d.dept_code AS department_code
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE 1=1
        `;

        const queryParams = [];
        let paramIndex = 1;

        // Lọc theo từ khóa tìm kiếm (họ tên, email, số điện thoại, chức vụ)
        if (search && search.trim() !== '') {
            queryText += ` AND (
                e.full_name ILIKE $${paramIndex} 
                OR e.email ILIKE $${paramIndex} 
                OR e.phone ILIKE $${paramIndex}
                OR e.position ILIKE $${paramIndex}
            )`;
            queryParams.push(`%${search.trim()}%`);
            paramIndex++;
        }

        // Lọc theo phòng ban
        if (department_id && department_id !== 'all') {
            queryText += ` AND e.department_id = $${paramIndex}`;
            queryParams.push(parseInt(department_id, 10));
            paramIndex++;
        }

        queryText += ` ORDER BY e.id DESC`;

        const result = await db.query(queryText, queryParams);

        res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lấy chi tiết một nhân viên
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const queryText = `
            SELECT 
                e.id,
                e.full_name,
                e.email,
                e.phone,
                e.position,
                e.department_id,
                e.base_salary,
                e.salary_coefficient,
                TO_CHAR(e.hire_date, 'YYYY-MM-DD') AS hire_date,
                e.created_at,
                d.name AS department_name,
                d.dept_code AS department_code
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.id = $1
        `;

        const result = await db.query(queryText, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin nhân viên!',
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Thêm mới nhân viên
 * POST /api/employees
 */
const createEmployee = async (req, res, next) => {
    try {
        const {
            full_name,
            email,
            phone,
            position,
            department_id,
            base_salary,
            salary_coefficient,
            hire_date,
        } = req.body;

        if (!full_name || !email || !position) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ Họ tên, Email và Chức vụ!',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Kiểm tra trùng email nhân viên
        const checkDuplicate = await db.query('SELECT id FROM employees WHERE email = $1', [normalizedEmail]);
        if (checkDuplicate.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Email '${normalizedEmail}' đã được sử dụng bởi một nhân viên khác!`,
            });
        }

        const parsedBaseSalary = parseFloat(base_salary) || 5000000.00;
        const parsedCoeff = parseFloat(salary_coefficient) || 1.00;
        const parsedDeptId = department_id ? parseInt(department_id, 10) : null;
        const parsedHireDate = hire_date || new Date().toISOString().slice(0, 10);

        const insertQuery = `
            INSERT INTO employees (
                full_name,
                email,
                phone,
                position,
                department_id,
                base_salary,
                salary_coefficient,
                hire_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;

        const result = await db.query(insertQuery, [
            full_name.trim(),
            normalizedEmail,
            phone ? phone.trim() : null,
            position.trim(),
            parsedDeptId,
            parsedBaseSalary,
            parsedCoeff,
            parsedHireDate,
        ]);

        res.status(201).json({
            success: true,
            message: 'Thêm mới nhân viên thành công!',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật thông tin nhân viên
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            email,
            phone,
            position,
            department_id,
            base_salary,
            salary_coefficient,
            hire_date,
        } = req.body;

        if (!full_name || !email || !position) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ Họ tên, Email và Chức vụ!',
            });
        }

        // Kiểm tra nhân viên có tồn tại không
        const checkEmp = await db.query('SELECT id FROM employees WHERE id = $1', [id]);
        if (checkEmp.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên cần cập nhật!',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Kiểm tra trùng email với nhân viên khác
        const checkDuplicate = await db.query(
            'SELECT id FROM employees WHERE email = $1 AND id <> $2',
            [normalizedEmail, id]
        );
        if (checkDuplicate.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Email '${normalizedEmail}' đã được sử dụng bởi nhân viên khác!`,
            });
        }

        const parsedBaseSalary = parseFloat(base_salary) || 5000000.00;
        const parsedCoeff = parseFloat(salary_coefficient) || 1.00;
        const parsedDeptId = department_id ? parseInt(department_id, 10) : null;
        const parsedHireDate = hire_date || new Date().toISOString().slice(0, 10);

        const updateQuery = `
            UPDATE employees
            SET 
                full_name = $1,
                email = $2,
                phone = $3,
                position = $4,
                department_id = $5,
                base_salary = $6,
                salary_coefficient = $7,
                hire_date = $8
            WHERE id = $9
            RETURNING *;
        `;

        const result = await db.query(updateQuery, [
            full_name.trim(),
            normalizedEmail,
            phone ? phone.trim() : null,
            position.trim(),
            parsedDeptId,
            parsedBaseSalary,
            parsedCoeff,
            parsedHireDate,
            id,
        ]);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin nhân viên thành công!',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa nhân viên
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        const checkEmp = await db.query('SELECT id FROM employees WHERE id = $1', [id]);
        if (checkEmp.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên cần xóa!',
            });
        }

        // Xóa nhân viên (ràng buộc CASCADE ở bảng salaries sẽ tự xóa các bản ghi lương liên quan)
        await db.query('DELETE FROM employees WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: 'Đã xóa nhân viên thành công!',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};

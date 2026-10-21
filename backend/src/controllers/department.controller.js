const db = require('../config/db');

/**
 * Lấy danh sách tất cả phòng ban kèm số lượng nhân viên
 * GET /api/departments
 */
const getDepartments = async (req, res, next) => {
    try {
        const queryText = `
            SELECT 
                d.id,
                d.dept_code,
                d.name,
                d.description,
                d.created_at,
                COUNT(e.id)::int AS employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            GROUP BY d.id
            ORDER BY d.id ASC;
        `;

        const result = await db.query(queryText);
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
 * Lấy thông tin chi tiết một phòng ban
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const queryText = `
            SELECT 
                d.id,
                d.dept_code,
                d.name,
                d.description,
                d.created_at,
                COUNT(e.id)::int AS employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            WHERE d.id = $1
            GROUP BY d.id;
        `;

        const result = await db.query(queryText, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban!',
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
 * Thêm mới phòng ban
 * POST /api/departments
 */
const createDepartment = async (req, res, next) => {
    try {
        const { dept_code, name, description } = req.body;

        if (!dept_code || !name) {
            return res.status(400).json({
                success: false,
                message: 'Mã phòng ban và Tên phòng ban là bắt buộc!',
            });
        }

        // Kiểm tra trùng mã phòng ban
        const checkDuplicate = await db.query('SELECT id FROM departments WHERE dept_code = $1', [dept_code.trim().toUpperCase()]);
        if (checkDuplicate.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã phòng ban '${dept_code.trim().toUpperCase()}' đã tồn tại! Vui lòng chọn mã khác.`,
            });
        }

        const insertQuery = `
            INSERT INTO departments (dept_code, name, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const result = await db.query(insertQuery, [
            dept_code.trim().toUpperCase(),
            name.trim(),
            description ? description.trim() : null,
        ]);

        res.status(201).json({
            success: true,
            message: 'Tạo phòng ban mới thành công!',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật thông tin phòng ban
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { dept_code, name, description } = req.body;

        if (!dept_code || !name) {
            return res.status(400).json({
                success: false,
                message: 'Mã phòng ban và Tên phòng ban là bắt buộc!',
            });
        }

        // Kiểm tra phòng ban tồn tại
        const existingDept = await db.query('SELECT id FROM departments WHERE id = $1', [id]);
        if (existingDept.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban cần sửa!',
            });
        }

        // Kiểm tra trùng mã với phòng ban khác
        const checkDuplicate = await db.query(
            'SELECT id FROM departments WHERE dept_code = $1 AND id <> $2',
            [dept_code.trim().toUpperCase(), id]
        );
        if (checkDuplicate.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã phòng ban '${dept_code.trim().toUpperCase()}' đã được dùng bởi phòng ban khác!`,
            });
        }

        const updateQuery = `
            UPDATE departments 
            SET dept_code = $1, name = $2, description = $3
            WHERE id = $4
            RETURNING *;
        `;

        const result = await db.query(updateQuery, [
            dept_code.trim().toUpperCase(),
            name.trim(),
            description ? description.trim() : null,
            id,
        ]);

        res.status(200).json({
            success: true,
            message: 'Cập nhật phòng ban thành công!',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa phòng ban
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const checkDept = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
        if (checkDept.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban cần xóa!',
            });
        }

        // Xóa phòng ban (ràng buộc ON DELETE SET NULL ở bảng employees sẽ tự chuyển nhân viên về NULL)
        await db.query('DELETE FROM departments WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: 'Đã xóa phòng ban thành công!',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};

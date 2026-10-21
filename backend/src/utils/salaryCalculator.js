/**
 * Tính lương tháng theo công thức trong tài liệu BTL (AGENT.md)
 * 
 * Lương 1 ngày = (base_salary * salary_coefficient) / 26
 * final_salary = (Lương 1 ngày * work_days) + allowance - deductions
 * 
 * @param {number} baseSalary - Lương cơ bản
 * @param {number} salaryCoefficient - Hệ số lương
 * @param {number} workDays - Số ngày công thực tế (mặc định chuẩn 26)
 * @param {number} allowance - Phụ cấp (mặc định 0)
 * @param {number} deductions - Các khoản giảm trừ (mặc định 0)
 * @returns {object} { dailySalary, finalSalary }
 */
const calculateSalary = (baseSalary, salaryCoefficient = 1.0, workDays = 26.0, allowance = 0, deductions = 0) => {
    const base = parseFloat(baseSalary) || 0;
    const coeff = parseFloat(salaryCoefficient) || 1.0;
    const days = parseFloat(workDays) || 0;
    const allow = parseFloat(allowance) || 0;
    const deduct = parseFloat(deductions) || 0;

    // Lương 1 ngày công chuẩn dựa trên 26 ngày công tháng
    const dailySalary = (base * coeff) / 26.0;

    // Lương thực lĩnh
    const rawFinalSalary = (dailySalary * days) + allow - deduct;

    // Làm tròn đến 2 chữ số thập phân (chuẩn tiền tệ)
    const finalSalary = Math.max(0, Math.round(rawFinalSalary * 100) / 100);

    return {
        dailySalary: Math.round(dailySalary * 100) / 100,
        finalSalary,
    };
};

module.exports = {
    calculateSalary,
};

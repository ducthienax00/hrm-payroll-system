const express = require('express');
const router = express.Router();
const {
    getSalaries,
    calculateSalary,
    updateSalaryStatus,
    deleteSalary,
} = require('../controllers/salary.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Áp dụng xác thực cho toàn bộ endpoint bảng lương
router.use(authenticate);

router.get('/', getSalaries);
router.post('/calculate', calculateSalary);
router.patch('/:id/status', updateSalaryStatus);
router.delete('/:id', deleteSalary);

module.exports = router;

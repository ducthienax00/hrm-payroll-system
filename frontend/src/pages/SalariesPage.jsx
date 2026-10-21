import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Select,
    Space,
    Modal,
    Form,
    InputNumber,
    Popconfirm,
    message,
    Tag,
    Card,
    Typography,
    Alert,
    Tooltip,
} from 'antd';
import {
    CalculatorOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    ReloadOutlined,
    DollarCircleOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import salaryApi from '../api/salaryApi';
import employeeApi from '../api/employeeApi';
import departmentApi from '../api/departmentApi';

const { Title, Text } = Typography;
const { Option } = Select;

const SalariesPage = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Modal Tính lương
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
    const [previewFinalSalary, setPreviewFinalSalary] = useState(0);
    const [form] = Form.useForm();

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedMonth) params.month = selectedMonth;
            if (selectedYear) params.year = selectedYear;
            if (selectedDepartment && selectedDepartment !== 'all') params.department_id = selectedDepartment;
            if (selectedStatus && selectedStatus !== 'all') params.payment_status = selectedStatus;

            const res = await salaryApi.getAll(params);
            if (res.success) {
                setSalaries(res.data);
                setTotalAmount(res.totalAmount || 0);
            }
        } catch (err) {
            console.error('Lỗi tải bảng lương:', err);
            message.error(err.message || 'Không thể tải bảng lương!');
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [empRes, deptRes] = await Promise.all([
                employeeApi.getAll(),
                departmentApi.getAll(),
            ]);
            if (empRes.success) setEmployees(empRes.data);
            if (deptRes.success) setDepartments(deptRes.data);
        } catch (err) {
            console.error('Lỗi tải dữ liệu khởi tạo:', err);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchSalaries();
    }, [selectedMonth, selectedYear, selectedDepartment, selectedStatus]);

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value || 0);
    };

    const handleToggleStatus = async (record) => {
        try {
            const nextStatus = record.payment_status === 'PAID' ? 'UNPAID' : 'PAID';
            await salaryApi.updateStatus(record.id, { payment_status: nextStatus });
            message.success(
                nextStatus === 'PAID'
                    ? `Đã chốt thanh toán lương cho ${record.employee_name}`
                    : `Đã chuyển về Chưa thanh toán cho ${record.employee_name}`
            );
            fetchSalaries();
        } catch (err) {
            console.error('Lỗi đổi trạng thái lương:', err);
            message.error(err.message || 'Không thể thay đổi trạng thái!');
        }
    };

    const handleDeleteSalary = async (id) => {
        try {
            await salaryApi.delete(id);
            message.success('Đã xóa phiếu lương thành công!');
            fetchSalaries();
        } catch (err) {
            console.error('Lỗi khi xóa phiếu lương:', err);
            message.error(err.message || 'Không thể xóa phiếu lương!');
        }
    };

    const openCalculateModal = () => {
        form.resetFields();
        setSelectedEmployeeData(null);
        setPreviewFinalSalary(0);
        form.setFieldsValue({
            month: selectedMonth,
            year: selectedYear,
            work_days: 26,
            allowance: 0,
            deductions: 0,
            payment_status: 'UNPAID',
        });
        setIsModalOpen(true);
    };

    // Khi người dùng chọn nhân viên trong Modal
    const handleEmployeeSelect = (empId) => {
        const emp = employees.find((e) => e.id === empId);
        setSelectedEmployeeData(emp);
        recalcPreview(emp, form.getFieldsValue());
    };

    // Tính toán live preview lương ngay trong Form Modal
    const recalcPreview = (emp, values) => {
        const targetEmp = emp || selectedEmployeeData;
        if (!targetEmp) {
            setPreviewFinalSalary(0);
            return;
        }

        const base = parseFloat(targetEmp.base_salary) || 0;
        const coeff = parseFloat(targetEmp.salary_coefficient) || 1.0;
        const days = parseFloat(values.work_days ?? 26) || 0;
        const allow = parseFloat(values.allowance ?? 0) || 0;
        const deduct = parseFloat(values.deductions ?? 0) || 0;

        const dailySalary = (base * coeff) / 26.0;
        const finalVal = Math.max(0, (dailySalary * days) + allow - deduct);
        setPreviewFinalSalary(Math.round(finalVal));
    };

    const handleFormValuesChange = (_, allValues) => {
        recalcPreview(selectedEmployeeData, allValues);
    };

    const handleCalculateSubmit = async (values) => {
        setSubmitting(true);
        try {
            await salaryApi.calculate(values);
            message.success('Đã tính và cập nhật bảng lương thành công!');
            setIsModalOpen(false);
            fetchSalaries();
        } catch (err) {
            console.error('Lỗi tính bảng lương:', err);
            message.error(err.message || 'Lỗi khi tính lương!');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Nhân viên',
            dataIndex: 'employee_name',
            key: 'employee_name',
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#1890ff' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {record.department_name ? `[${record.department_code || ''}] ${record.department_name}` : 'Chưa phân bổ'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Lương cơ bản / Hệ số',
            key: 'base_info',
            render: (_, record) => (
                <div>
                    <div>{formatVND(record.base_salary)}</div>
                    <Tag color="purple" style={{ fontSize: 11 }}>HS: {record.salary_coefficient}</Tag>
                </div>
            ),
        },
        {
            title: 'Ngày công',
            dataIndex: 'work_days',
            key: 'work_days',
            align: 'center',
            render: (days) => <strong>{days} / 26</strong>,
        },
        {
            title: 'Phụ cấp',
            dataIndex: 'allowance',
            key: 'allowance',
            align: 'right',
            render: (val) => <span style={{ color: '#52c41a' }}>+{formatVND(val)}</span>,
        },
        {
            title: 'Giảm trừ',
            dataIndex: 'deductions',
            key: 'deductions',
            align: 'right',
            render: (val) => <span style={{ color: '#ff4d4f' }}>-{formatVND(val)}</span>,
        },
        {
            title: 'Thực lĩnh (Final)',
            dataIndex: 'final_salary',
            key: 'final_salary',
            align: 'right',
            render: (finalVal) => (
                <span style={{ fontSize: 15, fontWeight: 'bold', color: '#389e0d' }}>
                    {formatVND(finalVal)}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'payment_status',
            key: 'payment_status',
            align: 'center',
            render: (status) => (
                status === 'PAID' ? (
                    <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>
                        ĐÃ THANH TOÁN
                    </Tag>
                ) : (
                    <Tag color="volcano" icon={<CloseCircleOutlined />} style={{ fontWeight: 600 }}>
                        CHƯA THANH TOÁN
                    </Tag>
                )
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 170,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        type={record.payment_status === 'PAID' ? 'default' : 'primary'}
                        style={record.payment_status === 'PAID' ? { color: '#ff4d4f', borderColor: '#ffa39e' } : {}}
                        onClick={() => handleToggleStatus(record)}
                    >
                        {record.payment_status === 'PAID' ? 'Hủy chốt' : 'Chốt lương'}
                    </Button>

                    <Tooltip title="Xóa phiếu lương">
                        <Popconfirm
                            title="Xác nhận xóa phiếu lương"
                            description={`Bạn có chắc muốn xóa phiếu lương tháng ${record.month}/${record.year} của "${record.employee_name}"?`}
                            onConfirm={() => handleDeleteSalary(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 20,
            }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Bảng Lương & Chi Trả Nhân Sự
                    </Title>
                    <Text type="secondary">
                        Công thức chuẩn: Lương ngày = (Lương CB × Hệ số) / 26 • Thực lĩnh = (Lương ngày × Công) + Phụ cấp − Giảm trừ
                    </Text>
                </div>

                <Button
                    type="primary"
                    icon={<CalculatorOutlined />}
                    size="large"
                    onClick={openCalculateModal}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                    Tính / Thêm Phiếu Lương
                </Button>
            </div>

            {/* Thanh Bộ Lọc Tháng / Năm / Phòng ban / Trạng thái */}
            <Card style={{ marginBottom: 20 }} bodyStyle={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>Tháng:</Text>
                        <Select
                            value={selectedMonth}
                            onChange={(val) => setSelectedMonth(val)}
                            style={{ width: 110 }}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <Option key={m} value={m}>
                                    Tháng {m}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>Năm:</Text>
                        <Select
                            value={selectedYear}
                            onChange={(val) => setSelectedYear(val)}
                            style={{ width: 100 }}
                        >
                            {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((y) => (
                                <Option key={y} value={y}>
                                    {y}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>Phòng ban:</Text>
                        <Select
                            value={selectedDepartment}
                            onChange={(val) => setSelectedDepartment(val)}
                            style={{ width: 200 }}
                        >
                            <Option value="all">-- Tất cả phòng ban --</Option>
                            {departments.map((d) => (
                                <Option key={d.id} value={d.id}>
                                    [{d.dept_code}] {d.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong>Trạng thái:</Text>
                        <Select
                            value={selectedStatus}
                            onChange={(val) => setSelectedStatus(val)}
                            style={{ width: 170 }}
                        >
                            <Option value="all">-- Tất cả trạng thái --</Option>
                            <Option value="PAID">ĐÃ THANH TOÁN</Option>
                            <Option value="UNPAID">CHƯA THANH TOÁN</Option>
                        </Select>
                    </div>

                    <Button icon={<ReloadOutlined />} onClick={fetchSalaries}>
                        Tải lại
                    </Button>
                </div>
            </Card>

            {/* Khối Tổng tiền Quỹ lương đã lọc */}
            <Alert
                message={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span>
                            <DollarCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                            Tổng quỹ lương tháng <strong>{selectedMonth}/{selectedYear}</strong>:
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#389e0d' }}>
                            {formatVND(totalAmount)}
                        </span>
                    </div>
                }
                type="info"
                style={{ marginBottom: 20, border: '1px solid #b7eb8f', background: '#f6ffed' }}
            />

            {/* Bảng Dữ liệu Lương */}
            <Card bodyStyle={{ padding: 0 }}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={salaries}
                    loading={loading}
                    pagination={{
                        pageSize: 8,
                        showTotal: (total) => `Tổng số ${total} phiếu lương`,
                    }}
                />
            </Card>

            {/* Modal Tính & Lưu Phiếu Lương */}
            <Modal
                title="Tính & Cập Nhật Phiếu Lương Tháng"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={580}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCalculateSubmit}
                    onValuesChange={handleFormValuesChange}
                    requiredMark="optional"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="employee_id"
                        label="Chọn nhân viên"
                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên cần tính lương!' }]}
                    >
                        <Select
                            placeholder="Tìm và chọn nhân viên"
                            onChange={handleEmployeeSelect}
                            showSearch
                            optionFilterProp="children"
                        >
                            {employees.map((e) => (
                                <Option key={e.id} value={e.id}>
                                    {e.full_name} ({e.email}) - {formatVND(e.base_salary)} (HS: {e.salary_coefficient})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {selectedEmployeeData && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#f5f5f5',
                            borderRadius: 8,
                            marginBottom: 16,
                            fontSize: 13,
                        }}>
                            <div><strong>Chức danh:</strong> {selectedEmployeeData.position}</div>
                            <div>
                                <strong>Lương cơ bản:</strong> {formatVND(selectedEmployeeData.base_salary)} •{' '}
                                <strong>Hệ số:</strong> {selectedEmployeeData.salary_coefficient}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="month"
                            label="Tháng tính lương"
                            rules={[{ required: true, message: 'Chọn tháng!' }]}
                        >
                            <Select>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <Option key={m} value={m}>Tháng {m}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="year"
                            label="Năm tính lương"
                            rules={[{ required: true, message: 'Chọn năm!' }]}
                        >
                            <Select>
                                {[currentYear + 1, currentYear, currentYear - 1].map((y) => (
                                    <Option key={y} value={y}>{y}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="work_days"
                            label="Số ngày công"
                            rules={[{ required: true, message: 'Nhập ngày công!' }]}
                        >
                            <InputNumber min={0} max={31} step={0.5} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="allowance"
                            label="Phụ cấp (VNĐ)"
                        >
                            <InputNumber
                                min={0}
                                step={100000}
                                style={{ width: '100%' }}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="deductions"
                            label="Giảm trừ (VNĐ)"
                        >
                            <InputNumber
                                min={0}
                                step={100000}
                                style={{ width: '100%' }}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="payment_status"
                        label="Trạng thái thanh toán ban đầu"
                    >
                        <Select>
                            <Option value="UNPAID">Chưa thanh toán (Tạm tính)</Option>
                            <Option value="PAID">Đã thanh toán (Chốt sổ)</Option>
                        </Select>
                    </Form.Item>

                    {/* Preview kết quả tính toán */}
                    <div style={{
                        padding: 16,
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: 8,
                        marginTop: 8,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontWeight: 600, color: '#262626' }}>
                                    Lương thực lĩnh ước tính (Final):
                                </span>
                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                    Công thức: [ (Base × HS) / 26 × Ngày công ] + Phụ cấp − Giảm trừ
                                </div>
                            </div>
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#389e0d' }}>
                                {formatVND(previewFinalSalary)}
                            </span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Lưu Phiếu Lương
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default SalariesPage;

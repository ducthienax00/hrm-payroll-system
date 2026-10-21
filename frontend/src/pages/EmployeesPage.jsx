import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Select,
    Space,
    Modal,
    Form,
    InputNumber,
    DatePicker,
    Popconfirm,
    message,
    Tag,
    Card,
    Typography,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    UserOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import employeeApi from '../api/employeeApi';
import departmentApi from '../api/departmentApi';

const { Title, Text } = Typography;
const { Option } = Select;

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    // State cho Modal Thêm / Sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchKeyword.trim()) {
                params.search = searchKeyword.trim();
            }
            if (selectedDepartment && selectedDepartment !== 'all') {
                params.department_id = selectedDepartment;
            }

            const res = await employeeApi.getAll(params);
            if (res.success) {
                setEmployees(res.data);
            }
        } catch (err) {
            console.error('Lỗi tải danh sách nhân viên:', err);
            message.error(err.message || 'Không thể tải danh sách nhân viên!');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await departmentApi.getAll();
            if (res.success) {
                setDepartments(res.data);
            }
        } catch (err) {
            console.error('Lỗi tải danh sách phòng ban:', err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [selectedDepartment]);

    const handleSearch = () => {
        fetchEmployees();
    };

    const handleResetFilter = () => {
        setSearchKeyword('');
        setSelectedDepartment('all');
    };

    const openAddModal = () => {
        setEditingEmployee(null);
        form.resetFields();
        form.setFieldsValue({
            salary_coefficient: 1.0,
            base_salary: 5000000,
            hire_date: dayjs(),
        });
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingEmployee(record);
        form.setFieldsValue({
            full_name: record.full_name,
            email: record.email,
            phone: record.phone,
            position: record.position,
            department_id: record.department_id,
            base_salary: record.base_salary,
            salary_coefficient: record.salary_coefficient,
            hire_date: record.hire_date ? dayjs(record.hire_date) : dayjs(),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await employeeApi.delete(id);
            message.success('Đã xóa nhân viên thành công!');
            fetchEmployees();
        } catch (err) {
            console.error('Lỗi khi xóa nhân viên:', err);
            message.error(err.message || 'Không thể xóa nhân viên này!');
        }
    };

    const handleFormSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                hire_date: values.hire_date ? values.hire_date.format('YYYY-MM-DD') : null,
            };

            if (editingEmployee) {
                await employeeApi.update(editingEmployee.id, payload);
                message.success('Cập nhật thông tin nhân viên thành công!');
            } else {
                await employeeApi.create(payload);
                message.success('Thêm mới nhân viên thành công!');
            }

            setIsModalOpen(false);
            fetchEmployees();
        } catch (err) {
            console.error('Lỗi khi lưu nhân viên:', err);
            message.error(err.message || 'Lỗi thao tác dữ liệu nhân viên!');
        } finally {
            setSubmitting(false);
        }
    };

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value || 0);
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#1890ff' }}>{text}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.email}</div>
                </div>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone || <Text type="secondary">Chưa có</Text>,
        },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            key: 'position',
            render: (pos) => <Tag color="blue">{pos}</Tag>,
        },
        {
            title: 'Phòng ban',
            dataIndex: 'department_name',
            key: 'department_name',
            render: (deptName, record) => (
                deptName ? (
                    <Tag color="cyan">
                        {record.department_code ? `[${record.department_code}] ` : ''}{deptName}
                    </Tag>
                ) : (
                    <Tag color="default">Chưa phân bổ</Tag>
                )
            ),
        },
        {
            title: 'Lương cơ bản',
            dataIndex: 'base_salary',
            key: 'base_salary',
            align: 'right',
            render: (salary) => <strong>{formatVND(salary)}</strong>,
        },
        {
            title: 'Hệ số',
            dataIndex: 'salary_coefficient',
            key: 'salary_coefficient',
            align: 'center',
            render: (coeff) => <Tag color="purple">{coeff}</Tag>,
        },
        {
            title: 'Ngày vào làm',
            dataIndex: 'hire_date',
            key: 'hire_date',
            align: 'center',
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 140,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa nhân sự">
                        <Popconfirm
                            title="Xác nhận xóa nhân viên"
                            description={`Bạn có chắc muốn xóa nhân viên "${record.full_name}"? Mọi bảng lương liên quan cũng sẽ bị xóa.`}
                            onConfirm={() => handleDelete(record.id)}
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
                        Danh Sách Nhân Viên
                    </Title>
                    <Text type="secondary">
                        Quản lý hồ sơ nhân sự, hệ số lương và chức danh phòng ban
                    </Text>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={openAddModal}
                >
                    Thêm Nhân Viên Mới
                </Button>
            </div>

            {/* Thanh Tìm kiếm & Bộ lọc */}
            <Card style={{ marginBottom: 20 }} bodyStyle={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <Input
                        placeholder="Tìm kiếm theo họ tên, email, chức vụ, sđt..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 320 }}
                        allowClear
                    />

                    <Select
                        value={selectedDepartment}
                        onChange={(val) => setSelectedDepartment(val)}
                        style={{ width: 220 }}
                    >
                        <Option value="all">-- Tất cả phòng ban --</Option>
                        {departments.map((d) => (
                            <Option key={d.id} value={d.id}>
                                [{d.dept_code}] {d.name}
                            </Option>
                        ))}
                    </Select>

                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        Tìm kiếm
                    </Button>

                    <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
                        Làm mới
                    </Button>
                </div>
            </Card>

            {/* Bảng Dữ liệu */}
            <Card bodyStyle={{ padding: 0 }}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={employees}
                    loading={loading}
                    pagination={{
                        pageSize: 8,
                        showTotal: (total) => `Tổng số ${total} nhân viên`,
                    }}
                />
            </Card>

            {/* Modal Thêm / Chỉnh Sửa Nhân Viên */}
            <Modal
                title={editingEmployee ? 'Chỉnh Sửa Thông Tin Nhân Viên' : 'Thêm Mới Nhân Viên'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={620}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    requiredMark="optional"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="full_name"
                        label="Họ và tên nhân viên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn An" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="email"
                            label="Email liên hệ"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input placeholder="an.nguyen@hrm.vn" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                        >
                            <Input placeholder="0912345678" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="position"
                            label="Chức danh / Vị trí công tác"
                            rules={[{ required: true, message: 'Vui lòng nhập chức danh!' }]}
                        >
                            <Input placeholder="Ví dụ: Senior Developer, Kế toán..." />
                        </Form.Item>

                        <Form.Item
                            name="department_id"
                            label="Phòng ban trực thuộc"
                        >
                            <Select placeholder="Chọn phòng ban" allowClear>
                                {departments.map((d) => (
                                    <Option key={d.id} value={d.id}>
                                        [{d.dept_code}] {d.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="base_salary"
                            label="Lương cơ bản (VNĐ)"
                            rules={[{ required: true, message: 'Vui lòng nhập lương cơ bản!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={1000000}
                                step={500000}
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                                prefix={<DollarOutlined />}
                            />
                        </Form.Item>

                        <Form.Item
                            name="salary_coefficient"
                            label="Hệ số lương"
                            rules={[{ required: true, message: 'Nhập hệ số!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0.5}
                                max={10.0}
                                step={0.1}
                            />
                        </Form.Item>

                        <Form.Item
                            name="hire_date"
                            label="Ngày vào làm"
                            rules={[{ required: true, message: 'Chọn ngày!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingEmployee ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeesPage;

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Modal,
    Form,
    Popconfirm,
    message,
    Tag,
    Card,
    Typography,
    Tooltip,
    Badge,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    ApartmentOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import departmentApi from '../api/departmentApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await departmentApi.getAll();
            if (res.success) {
                setDepartments(res.data);
            }
        } catch (err) {
            console.error('Lỗi tải danh sách phòng ban:', err);
            message.error(err.message || 'Không thể tải danh sách phòng ban!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const openAddModal = () => {
        setEditingDept(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingDept(record);
        form.setFieldsValue({
            dept_code: record.dept_code,
            name: record.name,
            description: record.description,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await departmentApi.delete(id);
            message.success('Đã xóa phòng ban thành công!');
            fetchDepartments();
        } catch (err) {
            console.error('Lỗi xóa phòng ban:', err);
            message.error(err.message || 'Không thể xóa phòng ban!');
        }
    };

    const handleFormSubmit = async (values) => {
        setSubmitting(true);
        try {
            if (editingDept) {
                await departmentApi.update(editingDept.id, values);
                message.success('Cập nhật phòng ban thành công!');
            } else {
                await departmentApi.create(values);
                message.success('Thêm mới phòng ban thành công!');
            }

            setIsModalOpen(false);
            fetchDepartments();
        } catch (err) {
            console.error('Lỗi lưu phòng ban:', err);
            message.error(err.message || 'Lỗi thao tác dữ liệu phòng ban!');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Mã phòng',
            dataIndex: 'dept_code',
            key: 'dept_code',
            width: 120,
            render: (code) => <Tag color="blue" style={{ fontWeight: 600 }}>{code}</Tag>,
        },
        {
            title: 'Tên phòng ban',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <strong>{name}</strong>,
        },
        {
            title: 'Mô tả nhiệm vụ',
            dataIndex: 'description',
            key: 'description',
            render: (desc) => desc || <Text type="secondary">Chưa cập nhật</Text>,
        },
        {
            title: 'Quy mô nhân sự',
            dataIndex: 'employee_count',
            key: 'employee_count',
            align: 'center',
            width: 160,
            render: (count) => (
                <Space>
                    <TeamOutlined style={{ color: '#1890ff' }} />
                    <Badge
                        count={count}
                        overflowCount={999}
                        style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
                    />
                    <Text type="secondary">người</Text>
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa phòng ban">
                        <Popconfirm
                            title="Xác nhận xóa phòng ban"
                            description={`Bạn có chắc muốn xóa phòng "${record.name}"? Các nhân viên thuộc phòng này sẽ được chuyển về Chưa phân bổ.`}
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
                        Danh Sách Phòng Ban
                    </Title>
                    <Text type="secondary">
                        Quản lý cơ cấu tổ chức, phòng ban chuyên trách và phân bổ nhân sự
                    </Text>
                </div>

                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchDepartments}>
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={openAddModal}
                    >
                        Thêm Phòng Ban
                    </Button>
                </Space>
            </div>

            {/* Bảng Dữ liệu */}
            <Card bodyStyle={{ padding: 0 }}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={departments}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng số ${total} phòng ban`,
                    }}
                />
            </Card>

            {/* Modal Thêm / Chỉnh Sửa Phòng Ban */}
            <Modal
                title={editingDept ? 'Chỉnh Sửa Thông Tin Phòng Ban' : 'Thêm Mới Phòng Ban'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={500}
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
                        name="dept_code"
                        label="Mã phòng ban (Viết tắt)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã phòng ban!' },
                            { max: 20, message: 'Mã phòng tối đa 20 ký tự!' },
                        ]}
                    >
                        <Input
                            prefix={<ApartmentOutlined />}
                            placeholder="Ví dụ: IT, HR, MKT, SALES"
                            style={{ textTransform: 'uppercase' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Tên phòng ban đầy đủ"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban!' }]}
                    >
                        <Input placeholder="Ví dụ: Phòng Công Nghệ Thông Tin" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả chức năng & nhiệm vụ"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Mô tả khái quát về hoạt động, trách nhiệm của phòng ban..."
                        />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingDept ? 'Lưu Thay Đổi' : 'Tạo Phòng Ban'}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default DepartmentsPage;

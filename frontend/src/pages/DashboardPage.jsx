import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, Spin, Progress, Space, Alert } from 'antd';
import {
    UsergroupAddOutlined,
    ApartmentOutlined,
    DollarCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ArrowRightOutlined,
    PlusOutlined,
    CalculatorOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dashboardApi from '../api/dashboardApi';

const { Title, Text } = Typography;

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await dashboardApi.getStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Lỗi tải thống kê:', err);
            setError(err.message || 'Không thể tải dữ liệu thống kê dashboard!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value || 0);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" tip="Đang tổng hợp số liệu nhân sự và quỹ lương..." />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi tải dữ liệu"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" type="primary" onClick={fetchStats}>
                        Thử lại
                    </Button>
                }
            />
        );
    }

    const recentColumns = [
        {
            title: 'Họ và tên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Phòng ban',
            dataIndex: 'department_name',
            key: 'department_name',
            render: (dept) => (
                <Tag color="cyan">{dept || 'Chưa phân bổ'}</Tag>
            ),
        },
        {
            title: 'Ngày vào làm',
            dataIndex: 'hire_date',
            key: 'hire_date',
        },
    ];

    return (
        <div>
            {/* Header Chào mừng & Hành động nhanh */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 24,
            }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        Bảng Điều Khiển Tổng Quan
                    </Title>
                    <Text type="secondary">
                        Tháng {stats?.currentMonth}/{stats?.currentYear} • Báo cáo nhân sự & quỹ lương thời gian thực
                    </Text>
                </div>

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/employees')}
                    >
                        Thêm nhân viên
                    </Button>
                    <Button
                        icon={<CalculatorOutlined />}
                        style={{ borderColor: '#52c41a', color: '#52c41a' }}
                        onClick={() => navigate('/salaries')}
                    >
                        Tính lương tháng
                    </Button>
                </Space>
            </div>

            {/* Hàng Thống kê KPI Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        style={{
                            background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
                            borderLeft: '4px solid #1890ff',
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontWeight: 600, color: '#595959' }}>TỔNG SỐ NHÂN VIÊN</span>}
                            value={stats?.totalEmployees || 0}
                            prefix={<UsergroupAddOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
                            suffix="người"
                        />
                        <div style={{ marginTop: 8 }}>
                            <Button
                                type="link"
                                size="small"
                                style={{ padding: 0 }}
                                onClick={() => navigate('/employees')}
                            >
                                Quản lý nhân viên <ArrowRightOutlined />
                            </Button>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        style={{
                            background: 'linear-gradient(135deg, #f9f0ff 0%, #ffffff 100%)',
                            borderLeft: '4px solid #722ed1',
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontWeight: 600, color: '#595959' }}>TỔNG SỐ PHÒNG BAN</span>}
                            value={stats?.totalDepartments || 0}
                            prefix={<ApartmentOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
                            suffix="phòng ban"
                        />
                        <div style={{ marginTop: 8 }}>
                            <Button
                                type="link"
                                size="small"
                                style={{ padding: 0, color: '#722ed1' }}
                                onClick={() => navigate('/departments')}
                            >
                                Quản lý phòng ban <ArrowRightOutlined />
                            </Button>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        style={{
                            background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
                            borderLeft: '4px solid #52c41a',
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontWeight: 600, color: '#595959' }}>QUỸ LƯƠNG DỰ KIẾN (T{stats?.currentMonth})</span>}
                            value={formatVND(stats?.totalPayrollCurrentMonth)}
                            prefix={<DollarCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                            valueStyle={{ color: '#389e0d', fontSize: '20px', fontWeight: 'bold' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Button
                                type="link"
                                size="small"
                                style={{ padding: 0, color: '#52c41a' }}
                                onClick={() => navigate('/salaries')}
                            >
                                Xem chi tiết bảng lương <ArrowRightOutlined />
                            </Button>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        bordered={false}
                        hoverable
                        style={{
                            background: 'linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)',
                            borderLeft: '4px solid #fa8c16',
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontWeight: 600, color: '#595959' }}>TÌNH TRẠNG CHI TRẢ LƯƠNG</span>}
                            value={stats?.paidSlips || 0}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                            suffix={`/ ${stats?.totalSlips || 0} đã chốt`}
                        />
                        <div style={{ marginTop: 8, fontSize: 13, color: '#fa8c16' }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            Chưa thanh toán: <strong>{stats?.unpaidSlips || 0}</strong> phiếu
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Khối Chi Tiết: Cơ Cấu Nhân Sự & Nhân Viên Mới */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                    <Card
                        title="Phân Bổ Nhân Lực Theo Phòng Ban"
                        bordered={false}
                        style={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                    >
                        {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
                            stats.departmentDistribution.map((dept) => {
                                const percent = stats.totalEmployees > 0
                                    ? Math.round((dept.employee_count / stats.totalEmployees) * 100)
                                    : 0;

                                return (
                                    <div key={dept.id} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontWeight: 500 }}>
                                                <Tag color="geekblue">{dept.dept_code}</Tag>
                                                {dept.name}
                                            </span>
                                            <span style={{ color: '#595959', fontWeight: 600 }}>
                                                {dept.employee_count} người ({percent}%)
                                            </span>
                                        </div>
                                        <Progress
                                            percent={percent}
                                            strokeColor={{
                                                '0%': '#108ee9',
                                                '100%': '#87d068',
                                            }}
                                            showInfo={false}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <Text type="secondary">Chưa có phòng ban nào trong hệ thống.</Text>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card
                        title="Nhân Sự Mới Tuyển Dụng Gần Đây"
                        extra={
                            <Button type="link" onClick={() => navigate('/employees')}>
                                Xem tất cả
                            </Button>
                        }
                        bordered={false}
                        style={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                    >
                        <Table
                            rowKey="id"
                            columns={recentColumns}
                            dataSource={stats?.recentEmployees || []}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;

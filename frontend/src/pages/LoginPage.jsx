import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [unverifiedEmail, setUnverifiedEmail] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        setErrorMsg(null);
        setUnverifiedEmail(null);

        try {
            await login(values.email, values.password);
            message.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác!');
            if (err.data && err.data.is_verified === false) {
                setUnverifiedEmail(err.data.email || values.email);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFillDemo = () => {
        form.setFieldsValue({
            email: 'admin@hrm.vn',
            password: 'Admin@123',
        });
        message.info('Đã điền thông tin tài khoản Admin Test!');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #092b00 0%, #001529 50%, #002766 100%)',
            padding: 20,
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: 440,
                    borderRadius: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: '#e6f7ff',
                        color: '#1890ff',
                        fontSize: 30,
                        marginBottom: 12,
                    }}>
                        <TeamOutlined />
                    </div>
                    <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>
                        HRM & Payroll System
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Hệ thống Quản lý Nhân sự & Tính lương chuẩn Ant Design
                    </Text>
                </div>

                {errorMsg && (
                    <Alert
                        message={errorMsg}
                        type="error"
                        showIcon
                        style={{ marginBottom: 20 }}
                        action={
                            unverifiedEmail && (
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`)}
                                >
                                    Xác thực ngay
                                </Button>
                            )
                        }
                    />
                )}

                <Form
                    form={form}
                    name="loginForm"
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    initialValues={{
                        email: 'admin@hrm.vn',
                        password: 'Admin@123',
                    }}
                >
                    <Form.Item
                        name="email"
                        label="Email công việc"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Định dạng email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="name@hrm.vn"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Mật khẩu của bạn"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            icon={<LoginOutlined />}
                            loading={loading}
                            block
                            style={{ height: 44, fontWeight: 600, fontSize: 15 }}
                        >
                            Đăng Nhập
                        </Button>
                    </Form.Item>

                    <Button
                        type="dashed"
                        icon={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
                        onClick={handleFillDemo}
                        block
                        style={{ height: 40, borderColor: '#ffd591', color: '#d46b08' }}
                    >
                        Điền nhanh tài khoản Admin Test
                    </Button>
                </Form>

                <Divider style={{ margin: '20px 0 16px' }} />

                <div style={{ textAlign: 'center', fontSize: 13 }}>
                    <Text type="secondary">Chưa có tài khoản quản lý? </Text>
                    <Link to="/register" style={{ fontWeight: 600, color: '#1890ff' }}>
                        Đăng ký ngay
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message, Select, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await register({
                full_name: values.full_name,
                email: values.email,
                password: values.password,
                role: values.role || 'HR',
            });

            message.success('Đăng ký tài khoản thành công! Mã OTP đã được gửi đến email.');
            // Chuyển hướng sang trang nhập OTP kèm email
            navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`, {
                state: { otpPreview: res.otpPreview },
            });
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
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
                    maxWidth: 480,
                    borderRadius: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>
                        Tạo Tài Khoản Quản Trị
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Đăng ký tài khoản HR / Quản lý để truy cập hệ thống
                    </Text>
                </div>

                {errorMsg && (
                    <Alert
                        message={errorMsg}
                        type="error"
                        showIcon
                        style={{ marginBottom: 20 }}
                    />
                )}

                <Form
                    form={form}
                    name="registerForm"
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    initialValues={{
                        role: 'HR',
                    }}
                >
                    <Form.Item
                        name="full_name"
                        label="Họ và tên đầy đủ"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Ví dụ: Nguyễn Văn An"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Địa chỉ Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="name@company.vn"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Vai trò (Quyền hạn)"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select size="large">
                            <Option value="HR">Chuyên viên Nhân sự (HR)</Option>
                            <Option value="Manager">Quản lý Phòng ban (Manager)</Option>
                            <Option value="Admin">Quản trị viên Hệ thống (Admin)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Tối thiểu 6 ký tự"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirm_password"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Nhập lại mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            icon={<UserAddOutlined />}
                            loading={loading}
                            block
                            style={{ height: 44, fontWeight: 600, fontSize: 15 }}
                        >
                            Đăng Ký & Nhận Mã OTP
                        </Button>
                    </Form.Item>
                </Form>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ textAlign: 'center' }}>
                    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#595959' }}>
                        <ArrowLeftOutlined /> Quay lại trang Đăng nhập
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;

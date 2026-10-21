import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message, Divider } from 'antd';
import { KeyOutlined, CheckCircleOutlined, ReloadOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';

const { Title, Text, Paragraph } = Typography;

const VerifyOtpPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp } = useAuth();

    const emailParam = searchParams.get('email') || '';
    const otpPreview = location.state?.otpPreview;

    useEffect(() => {
        if (emailParam) {
            form.setFieldsValue({ email: emailParam });
        }
        if (otpPreview) {
            form.setFieldsValue({ otp_code: otpPreview });
        }
    }, [emailParam, otpPreview, form]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const onFinish = async (values) => {
        setLoading(true);
        setErrorMsg(null);

        try {
            await verifyOtp(values.email, values.otp_code);
            message.success('Kích hoạt tài khoản thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const currentEmail = form.getFieldValue('email');
        if (!currentEmail) {
            message.warning('Vui lòng nhập địa chỉ email để gửi lại mã OTP!');
            return;
        }

        setResending(true);
        setErrorMsg(null);

        try {
            const res = await authApi.resendOtp({ email: currentEmail });
            message.success('Đã gửi lại mã OTP mới!');
            if (res.otpPreview) {
                form.setFieldsValue({ otp_code: res.otpPreview });
            }
            setCountdown(60);
            setCanResend(false);
        } catch (err) {
            console.error(err);
            message.error(err.message || 'Không thể gửi lại OTP lúc này!');
        } finally {
            setResending(false);
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
                    maxWidth: 440,
                    borderRadius: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: '#f6ffed',
                        color: '#52c41a',
                        fontSize: 28,
                        marginBottom: 12,
                    }}>
                        <CheckCircleOutlined />
                    </div>
                    <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>
                        Xác Thực Mã OTP
                    </Title>
                    <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 6 }}>
                        Hệ thống đã gửi mã OTP 6 chữ số tới hòm thư của bạn. Vui lòng nhập mã để kích hoạt tài khoản.
                    </Paragraph>
                </div>

                {otpPreview && (
                    <Alert
                        message={
                            <div>
                                <strong>Chế độ Test nhanh:</strong> Mã OTP vừa tạo là{' '}
                                <span style={{ color: '#096dd9', fontSize: 16, fontWeight: 700 }}>
                                    {otpPreview}
                                </span>
                            </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

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
                    name="verifyOtpForm"
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label="Email tài khoản"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="name@hrm.vn"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="otp_code"
                        label="Mã OTP (6 chữ số)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã OTP!' },
                            { len: 6, message: 'Mã OTP gồm đúng 6 chữ số!' },
                        ]}
                    >
                        <Input
                            prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Ví dụ: 123456"
                            maxLength={6}
                            size="large"
                            style={{
                                textAlign: 'center',
                                fontSize: 22,
                                letterSpacing: 6,
                                fontWeight: 'bold',
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                            style={{ height: 44, fontWeight: 600, fontSize: 15 }}
                        >
                            Kích Hoạt Tài Khoản
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        {canResend ? (
                            <Button
                                type="link"
                                icon={<ReloadOutlined />}
                                onClick={handleResendOtp}
                                loading={resending}
                                style={{ padding: 0 }}
                            >
                                Gửi lại mã OTP
                            </Button>
                        ) : (
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                Gửi lại mã sau: <strong>{countdown}s</strong>
                            </Text>
                        )}
                    </div>
                </Form>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ textAlign: 'center' }}>
                    <Link to="/login" style={{ color: '#1890ff', fontSize: 13 }}>
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default VerifyOtpPage;

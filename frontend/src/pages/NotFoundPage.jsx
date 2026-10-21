import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5',
        }}>
            <Result
                status="404"
                title="404"
                subTitle="Xin lỗi, trang bạn đang tìm kiếm không tồn tại trên hệ thống HRM!"
                extra={
                    <Button type="primary" onClick={() => navigate('/dashboard')}>
                        Về Bảng Điều Khiển
                    </Button>
                }
            />
        </div>
    );
};

export default NotFoundPage;

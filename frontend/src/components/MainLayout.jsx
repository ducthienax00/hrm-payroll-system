import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Tag, Popconfirm, theme } from 'antd';
import {
    DashboardOutlined,
    UsergroupAddOutlined,
    ApartmentOutlined,
    DollarOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng quan (Dashboard)',
        },
        {
            key: '/employees',
            icon: <UsergroupAddOutlined />,
            label: 'Quản lý Nhân sự',
        },
        {
            key: '/departments',
            icon: <ApartmentOutlined />,
            label: 'Quản lý Phòng ban',
        },
        {
            key: '/salaries',
            icon: <DollarOutlined />,
            label: 'Quản lý Bảng lương',
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
                    zIndex: 10,
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0' : '0 20px',
                    background: '#001529',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <TeamOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: collapsed ? 0 : 12 }} />
                    {!collapsed && (
                        <div>
                            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 16, lineHeight: '20px' }}>
                                HRM & Payroll
                            </div>
                            <div style={{ color: '#8c8c8c', fontSize: 11 }}>
                                Nhóm 6 - Web Nâng Cao
                            </div>
                        </div>
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0, marginTop: 8 }}
                />
            </Sider>

            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: colorBgContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                    zIndex: 9,
                    height: 64,
                    lineHeight: 'normal',
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 44, height: 44 }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '6px 14px',
                            background: '#f5f5f5',
                            borderRadius: 24,
                            border: '1px solid #e8e8e8',
                            marginRight: 16,
                            lineHeight: 1,
                        }}>
                            <Avatar
                                size={34}
                                style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                                icon={<UserOutlined />}
                            />
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: 2,
                                textAlign: 'left',
                            }}>
                                <span style={{
                                    fontWeight: 600,
                                    color: '#262626',
                                    fontSize: 13,
                                    lineHeight: '16px',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {user?.full_name || 'Quản Trị Viên HR'}
                                </span>
                                <div>
                                    <Tag color="blue" style={{
                                        margin: 0,
                                        fontSize: 11,
                                        lineHeight: '16px',
                                        padding: '0 6px',
                                        border: 'none',
                                    }}>
                                        {user?.role || 'HR'}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        <Popconfirm
                            title="Xác nhận đăng xuất"
                            description="Bạn có chắc chắn muốn kết thúc phiên làm việc?"
                            onConfirm={handleLogout}
                            okText="Đăng xuất"
                            cancelText="Hủy"
                        >
                            <Button
                                danger
                                icon={<LogoutOutlined />}
                                type="primary"
                                ghost
                                style={{ fontWeight: 500 }}
                            >
                                Thoát
                            </Button>
                        </Popconfirm>
                    </div>
                </Header>

                <Content style={{
                    margin: '24px',
                    padding: '24px',
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    minHeight: 380,
                }}>
                    <Outlet />
                </Content>

                <Footer style={{ textAlign: 'center', color: '#8c8c8c', padding: '16px 50px' }}>
                    HRM & Payroll Management System © 2026 BTL Web Nâng Cao - Nhóm 6. Built with Ant Design & Express.
                </Footer>
            </Layout>
        </Layout>
    );
};

export default MainLayout;

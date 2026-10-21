import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('hrm_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('hrm_token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra tính hợp lệ của token khi khởi động
        const verifyExistingToken = async () => {
            if (token) {
                try {
                    const res = await authApi.getMe();
                    if (res && res.data) {
                        setUser(res.data);
                        localStorage.setItem('hrm_user', JSON.stringify(res.data));
                    }
                } catch (err) {
                    // Token hết hạn hoặc không hợp lệ
                    logout();
                }
            }
            setLoading(false);
        };

        verifyExistingToken();
    }, []);

    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        if (res.success && res.token) {
            setToken(res.token);
            setUser(res.user);
            localStorage.setItem('hrm_token', res.token);
            localStorage.setItem('hrm_user', JSON.stringify(res.user));
            return res;
        }
        throw new Error(res.message || 'Đăng nhập không thành công');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('hrm_token');
        localStorage.removeItem('hrm_user');
    };

    const register = async (userData) => {
        return await authApi.register(userData);
    };

    const verifyOtp = async (email, otpCode) => {
        return await authApi.verifyOtp({ email, otp_code: otpCode });
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        register,
        verifyOtp,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
    }
    return context;
};

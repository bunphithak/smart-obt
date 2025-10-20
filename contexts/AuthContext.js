// Authentication Context
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Verify token is still valid
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            setAccessToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, try to refresh
            await refreshToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auto refresh token before expiration
  useEffect(() => {
    if (!accessToken) return;

    // Refresh token every 6 days (token expires in 7 days)
    const interval = setInterval(() => {
      refreshToken();
    }, 6 * 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Return error without throwing
        return { 
          success: false, 
          error: data.error || data.message || 'เข้าสู่ระบบไม่สำเร็จ' 
        };
      }

      if (!data.success) {
        return { 
          success: false, 
          error: data.error || 'เข้าสู่ระบบไม่สำเร็จ' 
        };
      }

      // Store tokens and user
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setAccessToken(data.data.accessToken);
      setUser(data.data.user);

      return { success: true, user: data.data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' 
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API if exists
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }).catch(() => {});
      }
    } finally {
      clearAuth();
      router.push('/admin/login');
    }
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        clearAuth();
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      
      localStorage.setItem('accessToken', data.data.accessToken);
      setAccessToken(data.data.accessToken);

      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      clearAuth();
      return false;
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser'); // Remove old format
    setAccessToken(null);
    setUser(null);
  };

  const apiCall = async (url, options = {}) => {
    try {
      const token = accessToken || localStorage.getItem('accessToken');

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If unauthorized, try to refresh token
      if (response.status === 401) {
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Retry request with new token
          const newToken = localStorage.getItem('accessToken');
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json'
            }
          });
        } else {
          // Refresh failed, redirect to login
          router.push('/admin/login');
          return response;
        }
      }

      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user && !!accessToken,
    login,
    logout,
    refreshToken,
    apiCall
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

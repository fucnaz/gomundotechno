import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple utility to compute SHA-256 hash in pure JS (for local/demo fallback check)
// This is to hash password locally if we are in demo mode
const sha256 = async (message) => {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (e) {
    // Basic fallback if crypto API is not supported in environment
    return message; 
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there is an active session in localStorage
    const savedSession = localStorage.getItem('gt_session');
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem('gt_session');
      }
    }
    setLoading(false);
  }, []);

  const loginLocal = async (username, password, usersList) => {
    // If we have a downloaded user list from Sheets, validate against it
    if (usersList && usersList.length > 0) {
      const hashed = await sha256(password);
      // Wait, the API deletes password from download. So Sheets API does the auth.
      // But if we're offline or doing local fallback:
      const matchedUser = usersList.find(
        u => u.username.toLowerCase() === username.toLowerCase()
      );
      if (matchedUser) {
        // NOTE: In online mode, we login via API, which checks password.
        // This local login is ONLY for demo mode fallback when Sheets is not connected.
      }
    }

    // Default Demo Mode users:
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      const sessionUser = {
        id: 'admin-id-1',
        username: 'admin',
        name: 'Administrador Demo',
        role: 'admin',
        isDemo: true
      };
      setUser(sessionUser);
      localStorage.setItem('gt_session', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    } else if (username.toLowerCase() === 'vendedor' && password === 'vendedor123') {
      const sessionUser = {
        id: 'seller-id-1',
        username: 'vendedor',
        name: 'Vendedor Demo',
        role: 'vendedor_tecnico',
        isDemo: true
      };
      setUser(sessionUser);
      localStorage.setItem('gt_session', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }

    return { success: false, error: 'Credenciales inválidas en modo Demo' };
  };

  const loginOnline = (userData) => {
    setUser(userData);
    localStorage.setItem('gt_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gt_session');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isSeller = () => {
    return user && user.role === 'vendedor_tecnico';
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginLocal, loginOnline, logout, isAdmin, isSeller }}>
      {children}
    </AuthContext.Provider>
  );
};

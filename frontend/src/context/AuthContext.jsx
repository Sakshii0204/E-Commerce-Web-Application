import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('novamart_user');
      return saved ? JSON.parse(saved) : {
        name: "Sakshi Sharma",
        email: "sakshi@example.com",
        role: "admin", // Admin enabled for testing customer & admin views seamlessly
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        phone: "+91 98765 43210",
        joinedDate: "January 2025"
      };
    } catch {
      return null;
    }
  });

  const login = (email, _password) => {
    // Mock login
    const isMockAdmin = email.toLowerCase().includes('admin');
    const mockUser = {
      name: isMockAdmin ? "Admin Manager" : (email.split('@')[0] || "Shopper"),
      email,
      role: isMockAdmin ? "admin" : "customer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98765 43210",
      joinedDate: "February 2025"
    };
    setUser(mockUser);
    localStorage.setItem('novamart_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const register = ({ fullName, email }) => {
    // Mock register
    const newUser = {
      name: fullName,
      email,
      role: "customer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98000 00000",
      joinedDate: "February 2025"
    };
    setUser(newUser);
    localStorage.setItem('novamart_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('novamart_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

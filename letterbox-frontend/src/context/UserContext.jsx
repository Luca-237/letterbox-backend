import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

// 1. Creamos el Contexto
const UserContext = createContext(null);

// 2. Creamos el "Proveedor" del contexto
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token guardado al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Función de login con JWT
  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      const { token, ...userData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  // Función de registro con JWT
  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      const { token, ...newUserData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUserData));
      setCurrentUser(newUserData);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrarse' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const isAuthenticated = () => {
    return !!currentUser && !!localStorage.getItem('token');
  };

  const value = { 
    currentUser, 
    login, 
    register, 
    logout, 
    isAuthenticated,
    loading 
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 3. Creamos un "hook" personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(UserContext);
}
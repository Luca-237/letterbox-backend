import React, { createContext, useState, useContext } from 'react';

// 1. Creamos el Contexto
const UserContext = createContext(null);

// 2. Creamos el "Proveedor" del contexto
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Esta función sería llamada después de un login exitoso
  const login = (userData) => {
    setCurrentUser(userData);
    // Opcional: guardar en localStorage para persistir la sesión
    // localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    // localStorage.removeItem('user');
  };

  const value = { currentUser, login, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 3. Creamos un "hook" personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(UserContext);
}
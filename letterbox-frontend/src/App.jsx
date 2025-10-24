import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage'; // <-- 1. Importar
//import LoginPage from './pages/LoginPage'; // Ya no es necesaria si usamos el Modal
import './App.css';

function App() {
  return (
    <UserProvider>
      <div className="App">
        {/* Aquí podrías poner un componente Navbar */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* 2. Añadir la ruta para detalles */}
          <Route path="/movie/:movieId" element={<MovieDetailPage />} />
          {/* <Route path="/login" element={<LoginPage />} /> Ya no la necesitamos si AuthModal funciona bien */}
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;
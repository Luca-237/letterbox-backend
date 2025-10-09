import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// import MovieDetailPage from './pages/MovieDetailPage'; // Los crearemos luego
// import LoginPage from './pages/LoginPage'; // Los crearemos luego
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Aquí podrías poner un componente Navbar que se vea en todas las páginas */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Descomentaremos estas líneas a medida que creemos los componentes
        <Route path="/movie/:movieId" element={<MovieDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        */}
      </Routes>
    </div>
  );
}

export default App;
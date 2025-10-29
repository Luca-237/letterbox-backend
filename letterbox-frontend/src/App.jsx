import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import './App.css';

function App() {
  return (
    <UserProvider>
      <div className="App">
        {}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {}
          <Route path="/movie/:movieId" element={<MovieDetailPage />} />
          {}
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;

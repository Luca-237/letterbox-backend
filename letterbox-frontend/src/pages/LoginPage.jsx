import React, { useState } from 'react';
import { useAuth } from '../context/UserContext';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Obtenemos la función login del contexto
  const navigate = useNavigate(); // Hook para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // NOTA: Esta parte requiere que tu backend tenga un endpoint de login
      // que devuelva los datos del usuario si las credenciales son correctas.
      const response = await loginUser({ username, password });
      
      // Usamos la función del contexto para actualizar el estado global
      login(response.data.user); 
      localStorage.setItem('token', response.data.token);
      // Redirigimos al usuario a la página principal
      navigate('/'); 
    } catch (err) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <input 
          type="text" 
          placeholder="Nombre de usuario" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
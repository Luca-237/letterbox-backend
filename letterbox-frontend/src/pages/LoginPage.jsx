import React, { useState } from 'react';
import { useAuth } from '../context/UserContext';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const response = await loginUser({ username, password });
      
 
      login(response.data.user); 
      localStorage.setItem('token', response.data.token);
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

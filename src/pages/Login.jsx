import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSheet } from '../context/SheetContext';
import { Lock, User, AlertCircle, Wrench, ChevronRight } from 'lucide-react';

export default function Login() {
  const { loginLocal, loginOnline } = useAuth();
  const { sheetUrl, loginSheet, loading: apiLoading, showToast } = useSheet();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (sheetUrl) {
        // Online login via Google Sheets
        const res = await loginSheet(username, password);
        if (!res.success) {
          setError(res.error || 'Error al iniciar sesión.');
        }
      } else {
        // Offline demo fallback login
        const res = await loginLocal(username, password);
        if (res.success) {
          showToast('Sesión iniciada en Modo Demo (Local)', 'info');
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const isDemoMode = !sheetUrl;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      padding: '1rem',
      position: 'relative'
    }}>
      {/* Visual background accents */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(0, 242, 254, 0.1)',
        filter: 'blur(80px)',
        top: '20%',
        left: '25%',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(155, 93, 229, 0.1)',
        filter: 'blur(80px)',
        bottom: '20%',
        right: '25%',
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'var(--primary-grad)',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: 'var(--glow-cyan)'
          }}>
            <Wrench size={28} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            marginBottom: '0.25rem',
            background: 'var(--primary-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-display)'
          }}>
            Go Mundo Techno
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Acceso al Sistema de Gestión de Ventas
          </p>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div style={{
            background: 'rgba(255, 179, 0, 0.08)',
            border: '1px solid rgba(255, 179, 0, 0.25)',
            borderRadius: '10px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--color-warning)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
              <AlertCircle size={16} />
              <span>Modo Demo Activo (Local)</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Para probar el sistema sin configurar Google Sheets, inicia sesión con:
            </p>
            <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Vendedor:</strong> vendedor / vendedor123</div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(255, 23, 68, 0.08)',
            border: '1px solid rgba(255, 23, 68, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">Nombre de usuario</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || apiLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || apiLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            disabled={loading || apiLoading}
          >
            {loading || apiLoading ? (
              <span className="spinner" style={{ width: '18px', height: '18px' }}></span>
            ) : (
              <>
                Ingresar al Sistema
                <ChevronRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

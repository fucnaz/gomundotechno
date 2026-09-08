import React from 'react';
import { ShieldCheck, KeyRound } from 'lucide-react';

export default function Settings() {
  const handleOpenSuperAdmin = () => {
    window.dispatchEvent(new CustomEvent('open-superadmin'));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 10rem)',
      gap: '1.25rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(0, 242, 254, 0.1)',
        color: 'var(--primary-cyan)',
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: 'var(--glow-cyan)'
      }}>
        <ShieldCheck size={36} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
        Zona Exclusiva SuperAdmin
      </h2>
      
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', fontSize: '0.95rem', lineHeight: '1.6' }}>
        Por motivos de seguridad y estabilidad del servicio, los parámetros y la base de datos de Google Sheets están protegidos mediante PIN Maestro.
      </p>

      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem 2rem',
        marginTop: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Atajo de acceso rápido: <kbd style={{
            background: 'rgba(0, 242, 254, 0.1)',
            color: 'var(--primary-cyan)',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            fontFamily: 'monospace'
          }}>Ctrl + Shift + S</kbd> o 5 clics en el logo
        </span>

        <button
          type="button"
          onClick={handleOpenSuperAdmin}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
        >
          <KeyRound size={16} />
          Desbloquear con PIN SuperAdmin
        </button>
      </div>
    </div>
  );
}

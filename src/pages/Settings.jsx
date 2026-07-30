import React from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { Database, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const { sheetUrl, connected } = useSheet();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 10rem)',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 23, 68, 0.1)',
          color: 'var(--color-danger)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 23, 68, 0.2)'
        }}>
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Lo sentimos, solo los usuarios con el rol de <strong>Administrador</strong> tienen permisos para ver la configuración del sistema.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Configuración del Sistema
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Información de la base de datos de Google Sheets del sistema.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Database Status */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <Database size={20} color="var(--primary-cyan)" />
            Base de Datos Integrada
          </h2>
          
          <div style={{
            background: connected ? 'rgba(0, 230, 118, 0.06)' : 'rgba(255, 179, 0, 0.06)',
            border: `1px solid ${connected ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 179, 0, 0.2)'}`,
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: connected ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {connected ? 'Conectado a Google Sheets' : 'Intentando conectar a Google Sheets...'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {connected 
                  ? 'Las transacciones, productos y reparaciones se sincronizan en tiempo real con la hoja de cálculo del sistema.'
                  : 'Hubo un problema al conectar con el servidor. Se utilizará una copia de respaldo local hasta restablecer la conexión.'}
              </p>
              <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-cyan)', marginTop: '0.75rem', wordBreak: 'break-all' }}>
                URL: {sheetUrl}
              </p>
            </div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: connected ? 'var(--color-success)' : 'var(--color-warning)',
              boxShadow: connected ? 'var(--glow-success)' : 'none'
            }}></div>
          </div>
        </section>

        <div style={{
          background: 'rgba(155, 93, 229, 0.05)',
          border: '1px solid rgba(155, 93, 229, 0.15)',
          borderRadius: '10px',
          padding: '1.25rem',
          color: 'var(--text-primary)',
          fontSize: '0.875rem'
        }}>
          <strong>Nota de Configuración:</strong> La base de datos del sistema está integrada de forma fija y permanente en el código para mayor comodidad y estabilidad del servicio. Los cambios de inventario y ventas se reflejan instantáneamente en las pestañas correspondientes de tu documento de Google Sheets.
        </div>

      </div>
    </div>
  );
}

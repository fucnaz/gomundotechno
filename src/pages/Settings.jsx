import React, { useState } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { Database, Link, Save, HelpCircle, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function Settings() {
  const { sheetUrl, saveSheetUrl, connected, loading, refreshData, showToast } = useSheet();
  const { user } = useAuth();
  
  const [urlInput, setUrlInput] = useState(sheetUrl);
  const [testResult, setTestResult] = useState(null); // 'success' | 'error' | null
  const [testLoading, setTestLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Solo los administradores pueden cambiar la URL de conexión', 'danger');
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    const success = await saveSheetUrl(urlInput);
    if (success) {
      setTestResult('success');
    } else {
      setTestResult('error');
    }
    setTestLoading(false);
  };

  const handleResetCache = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar la base de datos local? Esto restaurará el inventario, ventas y reparaciones de demostración iniciales y perderás tus cambios locales.')) {
      localStorage.removeItem('gt_products');
      localStorage.removeItem('gt_repairs');
      localStorage.removeItem('gt_sales');
      localStorage.removeItem('gt_users');
      refreshData();
      showToast('Base de datos local restablecida', 'success');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Configuración del Sistema
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestiona la conexión con Google Sheets y opciones del sistema.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Connection Form */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <Database size={20} color="var(--primary-cyan)" />
            Conexión con Google Sheets
          </h2>
          
          <div style={{
            background: connected ? 'rgba(0, 230, 118, 0.06)' : 'rgba(255, 179, 0, 0.06)',
            border: `1px solid ${connected ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 179, 0, 0.2)'}`,
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: connected ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {connected ? 'Conectado a Google Sheets' : 'Operando en Modo Demo (Local)'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {connected 
                  ? 'Las transacciones, productos y reparaciones se sincronizan en tiempo real con tu hoja de cálculo.'
                  : 'Los datos se guardan únicamente en el navegador (localStorage). Ideal para pruebas y demostración.'}
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

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="sheet-url">URL de Google Apps Script Web App</label>
              <div style={{ position: 'relative' }}>
                <Link size={18} color="var(--text-muted)" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  id="sheet-url"
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={!isAdmin || loading || testLoading}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                {!isAdmin 
                  ? 'Solo un Administrador puede modificar esta URL.' 
                  : 'Ingresa la URL completa que copiaste al implementar tu script en Google Sheets.'}
              </p>
            </div>

            {isAdmin && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || testLoading}
                  style={{ minWidth: '160px' }}
                >
                  {loading || testLoading ? (
                    <span className="spinner" style={{ width: '18px', height: '18px' }}></span>
                  ) : (
                    <>
                      <Save size={16} />
                      Conectar y Guardar
                    </>
                  )}
                </button>

                {testResult === 'success' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} />
                    <span>Conexión exitosa.</span>
                  </div>
                )}
                {testResult === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                    <XCircle size={16} />
                    <span>Error de conexión. Verifica la URL.</span>
                  </div>
                )}
              </div>
            )}
          </form>
        </section>

        {/* Demo Mode Actions */}
        {!connected && (
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
              <RefreshCw size={20} color="var(--primary-blue)" />
              Opciones de Simulación (Modo Demo)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Si estás probando el sistema y deseas restablecer los productos, ventas y reparaciones a los valores iniciales por defecto, utiliza el siguiente botón:
            </p>
            <button
              onClick={handleResetCache}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--color-warning)' }}
            >
              <RefreshCw size={16} />
              Restablecer Base de Datos Demo
            </button>
          </section>
        )}

        {/* Instructions Panel */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
            <HelpCircle size={20} color="var(--accent-purple)" />
            Guía de Configuración en Google Sheets
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <p>Sigue estos sencillos pasos para conectar tu propio almacenamiento en Google Sheets:</p>
            
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                Crea una nueva hoja de cálculo en <strong>Google Sheets</strong>.
              </li>
              <li>
                Ve al menú superior y selecciona <strong>Extensiones</strong> &gt; <strong>Apps Script</strong>.
              </li>
              <li>
                Abre el archivo <a href="file:///c:/Users/Administrator/Desktop/gomundotechno/google-apps-script.js" style={{ color: 'var(--primary-cyan)', textDecoration: 'underline' }}>google-apps-script.js</a> en la raíz del proyecto, copia todo su contenido y pégalo en el editor de Apps Script (reemplazando cualquier código anterior).
              </li>
              <li>
                Haz clic en el ícono de disco (Guardar proyecto).
              </li>
              <li>
                Haz clic en el botón superior derecho <strong>Implementar</strong> &gt; <strong>Nueva implementación</strong>.
              </li>
              <li>
                Haz clic en el ícono de engranaje de "Seleccionar tipo" y elige <strong>Aplicación web</strong>.
              </li>
              <li>
                Configura los siguientes campos:
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyleType: 'disc' }}>
                  <li><strong>Descripción:</strong> API Go Mundo Techno</li>
                  <li><strong>Ejecutar como:</strong> Tu usuario (Mismo correo de Google)</li>
                  <li><strong>Quién tiene acceso:</strong> Cualquier persona (Cualquiera/Anyone)</li>
                </ul>
              </li>
              <li>
                Haz clic en <strong>Implementar</strong>. Te pedirá "Autorizar acceso". Haz clic, selecciona tu cuenta, pulsa en "Configuración Avanzada" (Advanced) y luego en "Ir a Proyecto (no seguro)" para autorizar los permisos.
              </li>
              <li>
                Una vez completado, te proporcionará una <strong>URL de la aplicación web</strong>. Cópiala, pégala en el formulario superior de esta página y haz clic en "Conectar y Guardar".
              </li>
            </ol>
            
            <div style={{
              background: 'rgba(155, 93, 229, 0.05)',
              border: '1px solid rgba(155, 93, 229, 0.15)',
              borderRadius: '10px',
              padding: '1rem',
              marginTop: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              <strong>Nota sobre la Seguridad:</strong> Las contraseñas creadas se almacenan hasheadas con SHA-256 en la pestaña <code>users</code>. Al conectar por primera vez, el sistema creará un usuario administrador inicial con el usuario: <code>admin</code> y la contraseña: <code>admin123</code>. ¡Asegúrate de cambiarla o borrar este usuario inicial en la pestaña de Usuarios una vez creado tu propio admin!
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

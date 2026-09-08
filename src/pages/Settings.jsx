import React, { useState, useEffect } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  Database, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Copy, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  Layers,
  Users as UsersIcon,
  Package,
  Wrench,
  ShoppingBag
} from 'lucide-react';

export default function Settings() {
  const { 
    sheetUrl, 
    defaultSheetUrl, 
    isCustomUrl, 
    connected, 
    saveSheetUrl, 
    testConnection, 
    resetSheetUrl, 
    products, 
    repairs, 
    sales, 
    users, 
    expenses 
  } = useSheet();
  const { user } = useAuth();

  const [inputUrl, setInputUrl] = useState(sheetUrl || '');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Sync local input with current sheetUrl if it changes externally
  useEffect(() => {
    setInputUrl(sheetUrl || '');
  }, [sheetUrl]);

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
          Lo sentimos, solo los usuarios con el rol de <strong>Administrador</strong> tienen permisos para ver y configurar los parámetros de base de datos del sistema.
        </p>
      </div>
    );
  }

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({ success: false, error: 'Por favor, ingresa una URL válida.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(inputUrl.trim());
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, error: err.message || 'Error al conectar' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setSaving(true);
    try {
      const res = await saveSheetUrl(inputUrl.trim());
      if (res.success) {
        setTestResult({
          success: true,
          message: 'Base de datos conectada y sincronizada correctamente.'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer la URL de la base de datos al valor por defecto (.env)?')) {
      const def = resetSheetUrl();
      setInputUrl(def);
      setTestResult(null);
    }
  };

  const handleCopyUrl = () => {
    if (!inputUrl) return;
    navigator.clipboard.writeText(inputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasChanges = inputUrl.trim() !== (sheetUrl || '').trim();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Configuración del Sistema
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestiona la conexión de datos, sincronización con Google Sheets y parámetros del sistema.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`badge ${connected ? 'badge-success' : 'badge-warning'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connected ? 'var(--color-success)' : 'var(--color-warning)',
              boxShadow: connected ? 'var(--glow-success)' : 'none'
            }}></span>
            {connected ? 'Servidor Conectado' : 'Modo Contingencia / Desconectado'}
          </span>
        </div>
      </div>

      {/* Main Database Card */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(0, 242, 254, 0.1)',
              color: 'var(--primary-cyan)',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 242, 254, 0.2)'
            }}>
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', margin: 0 }}>
                Base de Datos (Google Apps Script Web App)
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Conecta tu Google Spreadsheet personalizada para almacenar ventas, inventario y reparaciones.
              </p>
            </div>
          </div>

          <span className={`badge ${isCustomUrl ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
            {isCustomUrl ? 'URL Personalizada (Guardada en Navegador)' : 'URL por Defecto (.env)'}
          </span>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="sheet-url-input" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>URL del Endpoint Web App</span>
              {defaultSheetUrl && isCustomUrl && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 'auto' }}
                  title="Restablecer a la URL configurada en el archivo .env"
                >
                  <RotateCcw size={12} style={{ marginRight: '0.25rem' }} />
                  Restablecer por defecto
                </button>
              )}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
              <input
                id="sheet-url-input"
                type="url"
                required
                className="form-input"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  paddingRight: '3rem'
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setTestResult(null);
                }}
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="btn btn-secondary"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '0.4rem',
                  height: 'auto'
                }}
                title="Copiar URL"
              >
                {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Debe ser un Web App implementado con permisos de acceso para <em>«Cualquiera» (Anyone)</em>.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving || !inputUrl.trim()}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} className={testing ? 'spin' : ''} />
              {testing ? 'Comprobando conexión...' : 'Probar Conexión'}
            </button>

            <button
              type="submit"
              disabled={saving || testing || (!hasChanges && connected)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {saving ? 'Guardando...' : hasChanges ? 'Guardar y Sincronizar' : 'Guardado'}
            </button>
          </div>
        </form>

        {/* Test Connection Feedback */}
        {testResult && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            borderRadius: '10px',
            background: testResult.success ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)',
            border: `1px solid ${testResult.success ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 23, 68, 0.25)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {testResult.success ? (
                <CheckCircle2 size={20} color="var(--color-success)" />
              ) : (
                <AlertTriangle size={20} color="var(--color-danger)" />
              )}
              <strong style={{ color: testResult.success ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.95rem' }}>
                {testResult.success ? 'Conexión Exitosa con Google Sheets' : 'Error en la Conexión'}
              </strong>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {testResult.success 
                ? (testResult.message || 'La URL responde correctamente y se encuentra lista para sincronizar datos.')
                : (testResult.error || 'No se pudo recibir respuesta del Web App.')}
            </p>

            {testResult.success && testResult.productCount !== undefined && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {testResult.productCount}
                  </span>
                  Productos
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {testResult.repairCount}
                  </span>
                  Reparaciones
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {testResult.userCount}
                  </span>
                  Usuarios
                </div>
                {testResult.duration && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'block', fontWeight: 700, color: 'var(--primary-cyan)', fontSize: '1.1rem' }}>
                      {testResult.duration}ms
                    </span>
                    Latencia
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Database Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary-cyan)' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{products.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Productos Cargados</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(79, 172, 254, 0.1)', color: 'var(--primary-blue)' }}>
            <Wrench size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{repairs.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reparaciones</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(0, 230, 118, 0.1)', color: 'var(--color-success)' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{sales.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ventas Registradas</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(155, 93, 229, 0.1)', color: 'var(--accent-purple)' }}>
            <UsersIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{users.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Usuarios del Sistema</div>
          </div>
        </div>
      </div>

      {/* Deployment Guide Accordion */}
      <section className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HelpCircle size={20} color="var(--primary-cyan)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              ¿Cómo crear y conectar una nueva base de datos de Google Sheets?
            </span>
          </div>
          {showGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showGuide && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'var(--primary-grad)',
                color: '#000',
                fontWeight: 700,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.85rem'
              }}>1</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Crea tu Google Spreadsheet</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Abre <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-cyan)', textDecoration: 'underline' }}>sheets.new <ExternalLink size={12} style={{ display: 'inline' }} /></a> y crea una hoja en blanco con el nombre que prefieras (ej. <em>"Go Mundo Tecno DB"</em>).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'var(--primary-grad)',
                color: '#000',
                fontWeight: 700,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.85rem'
              }}>2</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Abre el editor de Google Apps Script</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  En el menú superior de Google Sheets, ve a <strong>Extensiones</strong> &gt; <strong>Apps Script</strong>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'var(--primary-grad)',
                color: '#000',
                fontWeight: 700,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.85rem'
              }}>3</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Pega el código del backend</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Borra todo el contenido del archivo <code>Código.gs</code> y pega el código que se encuentra en el archivo <code>google-apps-script.js</code> del proyecto.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'var(--primary-grad)',
                color: '#000',
                fontWeight: 700,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.85rem'
              }}>4</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Implementar como Web App</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Haz clic en el botón azul <strong>Implementar (Deploy)</strong> &gt; <strong>Nueva implementación</strong>.<br />
                  - Tipo: <strong>Aplicación web (Web App)</strong>.<br />
                  - Ejecutar como: <strong>Yo (tu cuenta de Google)</strong>.<br />
                  - Quién tiene acceso: <strong>Cualquiera (Anyone)</strong>.<br />
                  Haz clic en <strong>Implementar</strong>, autoriza los permisos y copia la URL terminada en <code>/exec</code>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                background: 'var(--primary-grad)',
                color: '#000',
                fontWeight: 700,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.85rem'
              }}>5</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Pega la URL y guarda</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Pega la URL obtenida en el campo de arriba, presiona <strong>Probar Conexión</strong> y luego <strong>Guardar y Sincronizar</strong>.
                </p>
              </div>
            </div>

          </div>
        )}
      </section>

    </div>
  );
}

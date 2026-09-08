import React, { useState, useEffect, useRef } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Database, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  Copy, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Trash2,
  Package,
  Wrench,
  ShoppingBag,
  Users as UsersIcon,
  UserPlus,
  UserCheck,
  Shield,
  Key
} from 'lucide-react';

const SUPERADMIN_PIN = import.meta.env.VITE_SUPERADMIN_PIN || '9891';

export default function SuperAdminModal({ isOpen, onClose }) {
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
    saveUser,
    refreshData
  } = useSheet();
  const { logout } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Database URL state
  const [inputUrl, setInputUrl] = useState(sheetUrl || '');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Create User state
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userMsg, setUserMsg] = useState(null);

  // Password reset inline state
  const [resettingUserId, setResettingUserId] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const pinInputRef = useRef(null);

  // Focus PIN input when opened
  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        setPinInput('');
        setPinError('');
        setTimeout(() => pinInputRef.current?.focus(), 100);
      } else {
        setInputUrl(sheetUrl || '');
        setTestResult(null);
      }
    }
  }, [isOpen, isAuthenticated, sheetUrl]);

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === SUPERADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError('');
      setInputUrl(sheetUrl || '');
    } else {
      setPinError('PIN incorrecto. Acceso denegado.');
      setPinInput('');
      pinInputRef.current?.focus();
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
    setTestResult(null);
    setUserMsg(null);
    setResettingUserId(null);
    onClose();
  };

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

  const handleSaveUrl = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setSaving(true);
    try {
      const res = await saveSheetUrl(inputUrl.trim());
      if (res.success) {
        setTestResult({
          success: true,
          message: 'Base de datos actualizada y sincronizada en tiempo real.'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const def = resetSheetUrl();
    setInputUrl(def);
    setTestResult(null);
    setShowConfirmReset(false);
  };

  const handleClearLocalSession = () => {
    if (window.confirm('¿Deseas cerrar la sesión activa y limpiar la caché local de respaldo?')) {
      logout();
      localStorage.removeItem('gt_products');
      localStorage.removeItem('gt_repairs');
      localStorage.removeItem('gt_sales');
      localStorage.removeItem('gt_users');
      localStorage.removeItem('gt_expenses');
      window.location.reload();
    }
  };

  const handleCopyUrl = () => {
    if (!inputUrl) return;
    navigator.clipboard.writeText(inputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create new user handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()) {
      setUserMsg({ success: false, error: 'Por favor completa todos los campos del nuevo usuario.' });
      return;
    }

    setIsCreatingUser(true);
    setUserMsg(null);

    try {
      const userData = {
        name: newUserName.trim(),
        username: newUserUsername.trim().toLowerCase(),
        password: newUserPassword.trim(),
        role: newUserRole,
        status: 'activo'
      };

      const success = await saveUser(userData);
      if (success) {
        setUserMsg({
          success: true,
          message: `¡Usuario «${userData.username}» creado y guardado en Google Sheets con éxito!`
        });
        setNewUserName('');
        setNewUserUsername('');
        setNewUserPassword('');
        setNewUserRole('admin');
      } else {
        setUserMsg({
          success: false,
          error: 'No se pudo registrar el usuario. Verifica la conexión con Sheets.'
        });
      }
    } catch (err) {
      setUserMsg({ success: false, error: err.message || 'Error al crear usuario' });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Reset password for an existing user
  const handleSaveNewPassword = async (userObj) => {
    if (!newPasswordVal.trim()) {
      alert('La nueva contraseña no puede estar vacía.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const updated = {
        ...userObj,
        password: newPasswordVal.trim()
      };
      const success = await saveUser(updated);
      if (success) {
        setUserMsg({
          success: true,
          message: `Contraseña restablecida exitosamente para «${userObj.username}».`
        });
        setResettingUserId(null);
        setNewPasswordVal('');
      } else {
        alert('No se pudo actualizar la contraseña.');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const hasChanges = inputUrl.trim() !== (sheetUrl || '').trim();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 4, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      
      {/* Stage 1: PIN Authentication Modal */}
      {!isAuthenticated ? (
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          position: 'relative',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.15)',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <button
            onClick={handleClose}
            className="btn-icon"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              color: 'var(--text-muted)'
            }}
            title="Cerrar"
          >
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: 'var(--primary-cyan)',
              boxShadow: 'var(--glow-cyan)'
            }}>
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '0.4rem' }}>
              Acceso SuperAdmin
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Ingresa el PIN Maestro para gestionar la base de datos y usuarios del sistema.
            </p>
          </div>

          <form onSubmit={handlePinSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  ref={pinInputRef}
                  type="password"
                  maxLength={10}
                  placeholder="Ingresa PIN Maestro (9891)"
                  className="form-input"
                  style={{
                    paddingLeft: '2.75rem',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    letterSpacing: '0.25em',
                    fontFamily: 'monospace'
                  }}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                />
              </div>

              {pinError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--color-danger)',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={14} />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={!pinInput.trim()}
              >
                Desbloquear
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Stage 2: SuperAdmin Database & User Management Panel */
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 242, 254, 0.2)',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(0, 230, 118, 0.1)',
                color: 'var(--color-success)',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 230, 118, 0.3)'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', margin: 0 }}>
                    Panel SuperAdmin
                  </h2>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    Autorizado
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Gestión maestra de base de datos, creación de usuarios y recuperación de accesos.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsAuthenticated(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                title="Bloquear panel"
              >
                <Lock size={14} style={{ marginRight: '0.35rem' }} />
                Bloquear
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn-icon"
                title="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* 1. Database Connection Section */}
            <div style={{
              background: 'rgba(15, 18, 36, 0.7)',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={18} color="var(--primary-cyan)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    1. URL de la Base de Datos (Google Apps Script)
                  </span>
                </div>
                <span className={`badge ${isCustomUrl ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                  {isCustomUrl ? 'URL Personalizada en Navegador' : 'URL por Defecto (.env)'}
                </span>
              </div>

              <form onSubmit={handleSaveUrl}>
                <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', marginBottom: '0.75rem' }}>
                  <input
                    id="superadmin-sheet-url"
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

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || saving || !inputUrl.trim()}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <RefreshCw size={16} className={testing ? 'spin' : ''} />
                    {testing ? 'Comprobando...' : 'Probar Conexión'}
                  </button>

                  <button
                    type="submit"
                    disabled={saving || testing || (!hasChanges && connected)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Save size={16} />
                    {saving ? 'Guardando...' : hasChanges ? 'Guardar Base de Datos' : 'Guardado'}
                  </button>

                  {isCustomUrl && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(true)}
                      className="btn btn-outline"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}
                    >
                      <RotateCcw size={14} />
                      Restablecer por Defecto
                    </button>
                  )}
                </div>
              </form>

              {/* Confirmation Prompt for Reset */}
              {showConfirmReset && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 179, 0, 0.1)',
                  border: '1px solid rgba(255, 179, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-warning)' }}>
                    ¿Confirmas que deseas volver a la URL original de <code>.env</code>?
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn btn-primary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--color-warning)' }}
                    >
                      Sí, Restablecer
                    </button>
                  </div>
                </div>
              )}

              {/* Test Result Feedback */}
              {testResult && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: testResult.success ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)',
                  border: `1px solid ${testResult.success ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 23, 68, 0.25)'}`,
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    {testResult.success ? <CheckCircle2 size={16} color="var(--color-success)" /> : <AlertTriangle size={16} color="var(--color-danger)" />}
                    <strong style={{ color: testResult.success ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {testResult.success ? 'Conexión Exitosa' : 'Error en la conexión'}
                    </strong>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    {testResult.message || testResult.error} {testResult.duration ? `(${testResult.duration}ms)` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Create User / Admin Section */}
            <div style={{
              background: 'rgba(15, 18, 36, 0.7)',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid rgba(0, 242, 254, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <UserPlus size={18} color="var(--primary-cyan)" />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  2. Crear Nuevo Administrador o Usuario Inicial
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Registra la cuenta del Administrador directamente en la Google Sheet conectada para que pueda ingresar al sistema.
              </p>

              {userMsg && (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  background: userMsg.success ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)',
                  border: `1px solid ${userMsg.success ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 23, 68, 0.25)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: userMsg.success ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                  {userMsg.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{userMsg.message || userMsg.error}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Juan Administrador"
                      className="form-input"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre de Usuario (Login)</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. admin"
                      className="form-input"
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Contraseña</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. admin123"
                      className="form-input"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Rol en el Sistema</label>
                    <select
                      className="form-input"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="admin">Administrador (Acceso Total)</option>
                      <option value="vendedor_tecnico">Vendedor / Técnico</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingUser || !newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
                >
                  <UserPlus size={16} />
                  {isCreatingUser ? 'Registrando en Google Sheets...' : 'Crear Usuario en Google Sheets'}
                </button>
              </form>
            </div>

            {/* 3. Existing Users in Database & Password Recovery */}
            <div style={{
              background: 'rgba(15, 18, 36, 0.7)',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UsersIcon size={18} color="var(--primary-cyan)" />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    3. Usuarios Detectados en la Base de Datos ({users.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => refreshData()}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  <RefreshCw size={12} style={{ marginRight: '0.25rem' }} />
                  Refrescar Lista
                </button>
              </div>

              {users.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No se detectaron usuarios en esta base de datos aún. Usa el formulario de arriba para crear al Administrador.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {users.map((u) => {
                    const isEditingThis = resettingUserId === u.id;
                    return (
                      <div
                        key={u.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{u.name}</strong>
                            <code style={{ fontSize: '0.75rem', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary-cyan)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              @{u.username}
                            </code>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                            <span className={`badge ${u.role === 'admin' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                              {u.role === 'admin' ? 'Administrador' : 'Vendedor/Técnico'}
                            </span>
                            <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                              {u.status || 'activo'}
                            </span>
                          </div>
                        </div>

                        {/* Inline Password Reset */}
                        {isEditingThis ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              placeholder="Nueva contraseña"
                              className="form-input"
                              style={{ width: '160px', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                              value={newPasswordVal}
                              onChange={(e) => setNewPasswordVal(e.target.value)}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveNewPassword(u)}
                              disabled={isSavingPassword || !newPasswordVal.trim()}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            >
                              {isSavingPassword ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResettingUserId(null);
                                setNewPasswordVal('');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setResettingUserId(u.id);
                              setNewPasswordVal('');
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Key size={13} />
                            Cambiar Contraseña
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Emergency Tools & Deployment Guide */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(255, 23, 68, 0.04)',
                border: '1px solid rgba(255, 23, 68, 0.15)',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>
                    Herramienta de Emergencia / Reseteo de Sesión
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0 0' }}>
                    Si las credenciales locales quedaron desincronizadas, limpia la memoria local y recarga.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearLocalSession}
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    color: 'var(--color-danger)',
                    borderColor: 'rgba(255, 23, 68, 0.3)'
                  }}
                >
                  <Trash2 size={13} style={{ marginRight: '0.35rem' }} />
                  Limpiar Caché y Sesión
                </button>
              </div>

              {/* Deployment Guide Accordion */}
              <div style={{
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: 'none',
                    color: 'inherit',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '0.85rem 1.25rem',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <HelpCircle size={16} color="var(--primary-cyan)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Guía: ¿Cómo conectar una nueva Google Sheet desde cero?
                    </span>
                  </div>
                  {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showGuide && (
                  <div style={{
                    padding: '1.25rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <p>1. Crea una hoja en blanco en <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-cyan)' }}>sheets.new <ExternalLink size={12} style={{ display: 'inline' }} /></a>.</p>
                    <p>2. Ve a <strong>Extensiones &gt; Apps Script</strong> y pega el código de <code>google-apps-script.js</code>.</p>
                    <p>3. Haz clic en <strong>Implementar &gt; Nueva implementación</strong> (Tipo: <em>Aplicación web</em>, Ejecutar como: <em>Yo</em>, Acceso: <em>Cualquiera</em>).</p>
                    <p>4. Copia la URL generada terminada en <code>/exec</code> y pégala en la sección 1 de arriba.</p>
                    <p>5. Usa la sección 2 para crear al Administrador inicial con el usuario y contraseña que desees.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

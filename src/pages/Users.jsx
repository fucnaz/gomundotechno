import React, { useState } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Edit2, 
  X, 
  Lock, 
  Check, 
  ShieldAlert,
  UserCheck,
  UserMinus
} from 'lucide-react';

export default function Users() {
  const { users, saveUser, loading, showToast } = useSheet();
  const { user: currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'admin';

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('vendedor_tecnico');
  const [status, setStatus] = useState('activo');

  // Access control check
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
          <Lock size={28} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Lo sentimos, solo los usuarios con el rol de <strong>Administrador</strong> tienen permisos para gestionar los usuarios y accesos del sistema.
        </p>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setName('');
    setRole('vendedor_tecnico');
    setStatus('activo');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(''); // leave blank by default, only fill to change password
    setName(user.name);
    setRole(user.role);
    setStatus(user.status);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      showToast('Completa todos los campos obligatorios', 'warning');
      return;
    }

    if (!editingUser && !password) {
      showToast('La contraseña es obligatoria para nuevos usuarios', 'warning');
      return;
    }

    const userData = {
      id: editingUser ? editingUser.id : undefined,
      username: username.trim(),
      password: password || undefined, // undefined will notify script to preserve old password
      name: name.trim(),
      role: role,
      status: status
    };

    const success = await saveUser(userData);
    if (success) {
      setIsFormOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 6rem)' }}>
      
      {/* Header Panel */}
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Gestión de Usuarios y Roles
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Registra empleados, asigna roles de Administrador o Vendedor/Técnico y controla el acceso.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
          <UserPlus size={18} strokeWidth={2.5} />
          Nuevo Usuario
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>Nombre Completo</th>
              <th style={{ padding: '0.75rem' }}>Nombre de Usuario</th>
              <th style={{ padding: '0.75rem', width: '160px' }}>Rol</th>
              <th style={{ padding: '0.75rem', width: '120px', textAlign: 'center' }}>Estado</th>
              <th style={{ padding: '0.75rem', width: '100px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron usuarios cargados.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr 
                  key={u.id} 
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {u.name}
                    {u.id === currentUser.id && (
                      <span style={{ fontSize: '0.65rem', marginLeft: '0.5rem', opacity: 0.6, verticalAlign: 'middle' }}>(Tú)</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                    {u.username}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                      {u.role === 'admin' ? 'Administrador' : 'Vendedor / Técnico'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {u.status === 'activo' ? (
                      <span className="badge badge-success" style={{ fontSize: '0.6rem', display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                        <UserCheck size={10} />
                        Activo
                      </span>
                    ) : (
                      <span className="badge badge-danger" style={{ fontSize: '0.6rem', display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                        <UserMinus size={10} />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      style={{
                        background: 'rgba(0, 242, 254, 0.05)',
                        border: '1px solid rgba(0, 242, 254, 0.1)',
                        borderRadius: '6px',
                        padding: '0.35rem',
                        color: 'var(--primary-cyan)',
                        cursor: 'pointer'
                      }}
                      title="Editar Usuario"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM DIALOG (CREATE / EDIT) */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsFormOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UsersIcon size={22} color="var(--primary-cyan)" />
              {editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Eduardo Franco"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre de Usuario (Login) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: eduardo.f"
                  className="form-input"
                  style={{ textTransform: 'lowercase' }}
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  disabled={!!editingUser} // No cambiar login username una vez creado
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Contraseña {editingUser ? '(Dejar en blanco para mantener actual)' : '*'}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Ingresa contraseña de acceso'}
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rol del Sistema *</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="vendedor_tecnico">Vendedor / Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Estado de Acceso *</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Safety notice for self-deactivation */}
              {editingUser && editingUser.id === currentUser.id && (status === 'inactivo' || role !== 'admin') && (
                <div style={{
                  background: 'rgba(255, 23, 68, 0.06)',
                  border: '1px solid rgba(255, 23, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  gap: '0.25rem',
                  alignItems: 'center'
                }}>
                  <ShieldAlert size={16} />
                  <span>¡Cuidado! Estás inhabilitando o degradando tu propia cuenta.</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }}></span> : editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

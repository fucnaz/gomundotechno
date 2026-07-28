import React from 'react';
import { 
  ShoppingBag, 
  Wrench, 
  Package, 
  BarChart3, 
  Users as UsersIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  User as UserIcon,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSheet } from '../context/SheetContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout, isAdmin } = useAuth();
  const { connected } = useSheet();

  const menuItems = [
    { id: 'sales', label: 'Ventas (POS)', icon: ShoppingBag, roles: ['admin', 'vendedor_tecnico'] },
    { id: 'repairs', label: 'Reparaciones', icon: Wrench, roles: ['admin', 'vendedor_tecnico'] },
    { id: 'inventory', label: 'Inventario', icon: Package, roles: ['admin', 'vendedor_tecnico'] },
    { id: 'reports', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
    { id: 'users', label: 'Usuarios', icon: UsersIcon, roles: ['admin'] },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon, roles: ['admin'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="glass-panel" style={{
      width: '280px',
      margin: '1rem',
      marginRight: '0',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 2rem)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem',
      borderRadius: '24px'
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
        padding: '0.5rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-cyan)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}>
          <img 
            src="/iconologo.png" 
            alt="Logo Go Mundo Techno" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            background: 'var(--primary-grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(0,242,254,0.15)',
            fontFamily: 'var(--font-display)'
          }}>
            Go Mundo Techno
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            SISTEMA DE GESTIÓN
          </span>
        </div>
      </div>

      {/* User Information */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UserIcon size={18} color="var(--text-secondary)" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {user?.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-info'}`} style={{
              fontSize: '0.55rem',
              padding: '0.1rem 0.4rem'
            }}>
              {user?.role === 'admin' ? 'Admin' : 'Técnico/Vendedor'}
            </span>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: connected ? 'var(--color-success)' : 'var(--color-warning)',
              boxShadow: connected ? 'var(--glow-success)' : 'none',
              display: 'inline-block'
            }} title={connected ? 'Conectado a Sheets' : 'Modo Demo (Local)'}></div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {filteredItems.map(item => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.85rem 1rem',
                border: 'none',
                borderRadius: '12px',
                background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                color: isActive ? 'var(--primary-cyan)' : 'var(--text-secondary)',
                borderLeft: isActive ? '3px solid var(--primary-cyan)' : '3px solid transparent',
                textAlign: 'left',
                fontSize: '0.925rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-display)'
              }}
              className={isActive ? '' : 'nav-hover-effect'}
            >
              <IconComponent size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Database Connection Status Bar */}
      <div style={{
        fontSize: '0.75rem',
        color: connected ? 'var(--color-success)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        marginBottom: '1rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <Database size={14} />
        <span>{connected ? 'Base de datos en línea' : 'Base de datos: MODO DEMO'}</span>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="btn btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          borderRadius: '12px',
          padding: '0.75rem'
        }}
      >
        <LogOut size={16} />
        Cerrar Sesión
      </button>
    </aside>
  );
}

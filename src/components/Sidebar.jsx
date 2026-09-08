import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Wrench, 
  Package, 
  BarChart3, 
  Users as UsersIcon, 
  LogOut, 
  User as UserIcon,
  Database,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSheet } from '../context/SheetContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { connected } = useSheet();

  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);

  const handleLogoClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        window.dispatchEvent(new CustomEvent('open-superadmin'));
        return 0;
      }
      return next;
    });

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
  };

  // Standard menu items (Settings is restricted to SuperAdmin via shortcut / 5-clicks)
  const menuItems = [
    { id: 'sales', label: 'Ventas (POS)', icon: ShoppingBag, roles: ['admin', 'vendedor_tecnico'] },
    { id: 'repairs', label: 'Reparaciones', icon: Wrench, roles: ['admin', 'vendedor_tecnico'] },
    { id: 'inventory', label: 'Inventario', icon: Package, roles: ['admin', 'vendedor_tecnico'] },
    { id: 'cash', label: 'Caja Diario', icon: Coins, roles: ['admin', 'vendedor_tecnico'] },
    { id: 'reports', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
    { id: 'users', label: 'Usuarios', icon: UsersIcon, roles: ['admin'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="glass-panel sidebar-aside" style={{
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
        {/* Brand Header with 5-clicks SuperAdmin trigger */}
        <div 
          onClick={handleLogoClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            padding: '0.5rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          title="Go Mundo Tecno"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.15s ease'
          }}>
            <img 
              src="/iconologo.png" 
              alt="Logo Go Mundo Tecno" 
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
              Go Mundo Tecno
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
          borderRadius: '16px',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: user?.role === 'admin' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(0, 176, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: user?.role === 'admin' ? 'var(--color-success)' : 'var(--primary-cyan)'
          }}>
            <UserIcon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.name || user?.username || 'Usuario'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-info'}`} style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem'
              }}>
                {user?.role === 'admin' ? 'Admin' : 'Técnico/Vendedor'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--primary-grad)' : 'transparent',
                  color: isActive ? '#03040a' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: isActive ? 'var(--glow-cyan)' : 'none'
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#03040a' : 'currentColor'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Database Status Indicator (Compact) */}
        <div style={{
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Database size={14} color={connected ? 'var(--color-success)' : 'var(--color-warning)'} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Base de datos:
          </span>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            color: connected ? 'var(--color-success)' : 'var(--color-warning)',
            marginLeft: 'auto'
          }}>
            {connected ? 'Online' : 'Respaldo'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-outline"
          style={{
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

      {/* Mobile Top Header */}
      <div className="mobile-header-bar">
        <div 
          onClick={handleLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <img src="/iconologo.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
            Go Mundo Tecno
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-info'}`} style={{
            fontSize: '0.55rem',
            padding: '0.1rem 0.4rem'
          }}>
            {user?.role === 'admin' ? 'Admin' : 'Técnico'}
          </span>
          <button 
            onClick={logout} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-danger)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center' 
            }}
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-nav-bar">
        {filteredItems.map(item => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                background: 'none',
                border: 'none',
                color: isActive ? 'var(--primary-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem',
                flex: 1
              }}
            >
              <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 600 : 400, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                {item.label === 'Reparaciones' ? 'Taller' : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

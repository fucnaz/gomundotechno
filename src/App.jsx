import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useSheet } from './context/SheetContext';
import Sidebar from './components/Sidebar';
import SuperAdminModal from './components/SuperAdminModal';

// Pages
import Login from './pages/Login';
import Sales from './pages/Sales';
import Repairs from './pages/Repairs';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import CashRegister from './pages/CashRegister';

// Toast Icon mapper
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X,
  Wrench
} from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { loading: sheetLoading, toasts, removeToast } = useSheet();
  const [activeTab, setActiveTab] = useState('sales');
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);

  // Global listener for SuperAdmin trigger (Ctrl + Shift + S or Custom Event)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Shift + S or Cmd + Shift + S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsSuperAdminOpen(prev => !prev);
      }
    };

    const handleCustomOpen = () => {
      setIsSuperAdminOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-superadmin', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-superadmin', handleCustomOpen);
    };
  }, []);

  const isLoading = authLoading || (sheetLoading && !user); // only show global loading screen initially if user is not set

  // Loading Screen Render
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div style={{
          background: 'var(--primary-grad)',
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-cyan)',
          marginBottom: '1rem',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          <Wrench size={32} color="#000" strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>
          Cargando Go Mundo Tecno...
        </h2>
        <span className="spinner"></span>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  // Auth Screen Redirect
  if (!user) {
    return (
      <>
        <Login />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <SuperAdminModal 
          isOpen={isSuperAdminOpen} 
          onClose={() => setIsSuperAdminOpen(false)} 
        />
      </>
    );
  }

  // Active View Switch
  const renderActiveView = () => {
    switch (activeTab) {
      case 'sales':
        return <Sales setActiveTab={setActiveTab} />;
      case 'repairs':
        return <Repairs setActiveTab={setActiveTab} />;
      case 'inventory':
        return <Inventory />;
      case 'cash':
        return <CashRegister />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Sales setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Toast Alert System Overlay */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* SuperAdmin Global Modal Overlay */}
      <SuperAdminModal 
        isOpen={isSuperAdminOpen} 
        onClose={() => setIsSuperAdminOpen(false)} 
      />
    </div>
  );
}

// Toast Alert System Component
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let bgColor = 'var(--bg-surface-solid)';
        let borderColor = 'var(--border-color)';
        let textColor = 'var(--text-primary)';
        let Icon = Info;

        if (toast.type === 'success') {
          bgColor = 'rgba(10, 36, 20, 0.95)';
          borderColor = 'rgba(0, 230, 118, 0.4)';
          textColor = 'var(--color-success)';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          bgColor = 'rgba(36, 28, 10, 0.95)';
          borderColor = 'rgba(255, 179, 0, 0.4)';
          textColor = 'var(--color-warning)';
          Icon = AlertTriangle;
        } else if (toast.type === 'danger') {
          bgColor = 'rgba(36, 12, 20, 0.95)';
          borderColor = 'rgba(255, 23, 68, 0.4)';
          textColor = 'var(--color-danger)';
          Icon = XCircle;
        }

        return (
          <div 
            key={toast.id} 
            className="toast" 
            style={{ 
              background: bgColor, 
              border: `1px solid ${borderColor}`,
              color: textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              fontSize: '0.875rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{toast.message}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '0.75rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default App;

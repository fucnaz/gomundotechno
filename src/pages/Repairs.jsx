import React, { useState, useMemo } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ShoppingBag, 
  MessageSquare, 
  User, 
  Phone, 
  Cpu, 
  X,
  FileEdit,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Repairs({ setActiveTab }) {
  const { repairs, saveRepair, updateRepairStatus, users, loading, showToast } = useSheet();
  const { user } = useAuth();

  // Dialog / Form States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Create Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [estimatePrice, setEstimatePrice] = useState('');
  const [initialComment, setInitialComment] = useState('');

  // Kanban Columns
  const columns = ['Recibido', 'En Reparación', 'Listo para Entregar', 'Entregado'];

  // Categorize Repairs by Status
  const repairsByStatus = useMemo(() => {
    const groups = {
      'Recibido': [],
      'En Reparación': [],
      'Listo para Entregar': [],
      'Entregado': []
    };
    repairs.forEach(rep => {
      if (groups[rep.status]) {
        groups[rep.status].push(rep);
      } else {
        // Safe check
        groups['Recibido'].push(rep);
      }
    });
    return groups;
  }, [repairs]);

  // Handle Repair Registration
  const handleCreateRepair = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !deviceModel.trim() || !issueDescription.trim() || !estimatePrice) {
      showToast('Completa todos los campos obligatorios', 'warning');
      return;
    }

    const price = Number(estimatePrice);
    if (isNaN(price) || price <= 0) {
      showToast('Ingresa un presupuesto válido', 'warning');
      return;
    }

    const dateStr = new Date().toISOString().substring(0, 10);
    const commentsList = `[${dateStr}]: Reparación recibida por ${user.name}. Problema: ${issueDescription.trim()}` + 
                         (initialComment.trim() ? `\n[${dateStr}]: ${initialComment.trim()}` : '');

    const newRepair = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deviceModel: deviceModel.trim(),
      issueDescription: issueDescription.trim(),
      estimatePrice: price,
      status: 'Recibido',
      comments: commentsList,
      technicianId: user.id
    };

    const success = await saveRepair(newRepair);
    if (success) {
      // Clear inputs
      setCustomerName('');
      setCustomerPhone('');
      setDeviceModel('');
      setIssueDescription('');
      setEstimatePrice('');
      setInitialComment('');
      setIsCreateOpen(false);
    }
  };

  // Add Comment to active repair
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await updateRepairStatus(selectedRepair.id, selectedRepair.status, newComment.trim());
    if (success) {
      // Update selectedRepair local view
      const dateStr = new Date().toISOString().substring(0, 10);
      setSelectedRepair(current => ({
        ...current,
        comments: current.comments + `\n[${dateStr}]: ${newComment.trim()}`
      }));
      setNewComment('');
    }
  };

  // Move repair to next state
  const handleMoveStatus = async (repair, newStatus) => {
    const commentMap = {
      'En Reparación': 'Se inicia la reparación del equipo.',
      'Listo para Entregar': 'Reparación completada. Listo para coordinar entrega con el cliente.',
      'Entregado': 'Equipo retirado por el cliente.'
    };
    
    const success = await updateRepairStatus(repair.id, newStatus, commentMap[newStatus] || `Estado cambiado a ${newStatus}`);
    if (success) {
      if (selectedRepair && selectedRepair.id === repair.id) {
        setSelectedRepair(current => ({
          ...current,
          status: newStatus,
          comments: current.comments + `\n[${new Date().toISOString().substring(0, 10)}]: Estado cambiado a "${newStatus}"`
        }));
      }
    }
  };

  // Billing integration
  const handleInvoiceClick = (repair) => {
    // We will save the repair reference to localStorage so Sales page can pick it up
    localStorage.setItem('gt_pending_invoice_repair_id', repair.id);
    setSelectedRepair(null);
    setActiveTab('sales'); // navigate to Sales tab
  };

  // Helper to format date
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 6rem)', gap: '1rem' }}>
      
      {/* Header Panel */}
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Órdenes de Reparación
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Control de equipos en servicio técnico. Registra, actualiza y factura reparaciones.
          </p>
        </div>
        
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Nueva Reparación
        </button>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        flex: 1,
        overflow: 'hidden'
      }}>
        {columns.map(col => {
          const columnRepairs = repairsByStatus[col] || [];
          
          // Style markers based on status
          const borderHighlight = 
            col === 'Recibido' ? 'rgba(0, 176, 255, 0.4)' :
            col === 'En Reparación' ? 'rgba(155, 93, 229, 0.4)' :
            col === 'Listo para Entregar' ? 'rgba(255, 179, 0, 0.4)' :
            'rgba(0, 230, 118, 0.4)';

          const headerColor = 
            col === 'Recibido' ? 'var(--color-info)' :
            col === 'En Reparación' ? 'var(--accent-purple)' :
            col === 'Listo para Entregar' ? 'var(--color-warning)' :
            'var(--color-success)';

          return (
            <div 
              key={col} 
              className="glass-panel" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                maxHeight: '100%', 
                overflow: 'hidden',
                borderRadius: '16px',
                borderTop: `4px solid ${headerColor}`,
                padding: '1rem'
              }}
            >
              {/* Column Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem'
              }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: headerColor }}>
                  {col}
                </h3>
                <span className="badge" style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.65rem'
                }}>
                  {columnRepairs.length}
                </span>
              </div>

              {/* Column Cards (Scrollable) */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem',
                paddingBottom: '1rem'
              }}>
                {columnRepairs.length === 0 ? (
                  <div style={{ 
                    padding: '2rem 1rem', 
                    textAlign: 'center', 
                    color: 'var(--text-muted)', 
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '10px'
                  }}>
                    Sin órdenes
                  </div>
                ) : (
                  columnRepairs.map(rep => {
                    const commentsCount = rep.comments ? rep.comments.split('\n').length : 0;
                    return (
                      <div 
                        key={rep.id}
                        className="glass-card"
                        onClick={() => setSelectedRepair(rep)}
                        style={{
                          padding: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                            {rep.deviceModel}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {formatDate(rep.date)}
                          </span>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rep.issueDescription}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={12} />
                            {rep.customerName}
                          </span>
                          <span style={{ color: 'var(--primary-cyan)', fontWeight: 'bold' }}>
                            ${Number(rep.estimatePrice).toLocaleString()}
                          </span>
                        </div>

                        {commentsCount > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.4rem' }}>
                            <MessageSquare size={12} />
                            <span>{commentsCount} actualizaciones</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW REPAIR DIALOG */}
      {isCreateOpen && (
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
            maxWidth: '550px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsCreateOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={22} color="var(--primary-cyan)" />
              Registrar Nueva Orden de Servicio
            </h2>

            <form onSubmit={handleCreateRepair} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cliente (Nombre Completo) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    className="form-input"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: +54 9 11..."
                    className="form-input"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Equipo (Marca y Modelo) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Samsung Galaxy A52"
                    className="form-input"
                    value={deviceModel}
                    onChange={e => setDeviceModel(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Presupuesto Estimado ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="form-input"
                    value={estimatePrice}
                    onChange={e => setEstimatePrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Falla / Problema Reportado *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej: Vidrio roto, pin de carga no funciona..."
                  className="form-input"
                  style={{ resize: 'none' }}
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notas Iniciales o Diagnóstico Rápido</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre accesorios recibidos con el equipo, estado físico, etc."
                  className="form-input"
                  style={{ resize: 'none' }}
                  value={initialComment}
                  onChange={e => setInitialComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }}></span> : 'Crear Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL & ACTION DIALOG */}
      {selectedRepair && (
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
            maxWidth: '650px',
            padding: '2rem',
            position: 'relative',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button 
              onClick={() => setSelectedRepair(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={22} color="var(--primary-cyan)" />
              Ficha Técnica: {selectedRepair.deviceModel}
            </h2>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
              
              {/* Customer & General info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cliente</span>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={14} color="var(--primary-cyan)" />
                    {selectedRepair.customerName}
                  </span>
                  {selectedRepair.customerPhone && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={12} />
                      {selectedRepair.customerPhone}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Costo Presupuestado</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>
                    ${Number(selectedRepair.estimatePrice).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Fecha Ingreso: {formatDate(selectedRepair.date)}
                  </span>
                </div>
              </div>

              {/* Status Flow Actions */}
              <div style={{
                background: 'rgba(0,242,254,0.03)',
                border: '1px solid rgba(0,242,254,0.1)',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                  Estado de la Reparación: 
                  <span className={`badge ${
                    selectedRepair.status === 'Recibido' ? 'badge-info' :
                    selectedRepair.status === 'En Reparación' ? 'badge-warning' :
                    selectedRepair.status === 'Listo para Entregar' ? 'badge-danger' : 'badge-success'
                  }`} style={{ marginLeft: '0.5rem' }}>{selectedRepair.status}</span>
                </span>

                {/* Status Transitions */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {selectedRepair.status === 'Recibido' && (
                    <button 
                      onClick={() => handleMoveStatus(selectedRepair, 'En Reparación')}
                      className="btn btn-primary" 
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                      disabled={loading}
                    >
                      <Clock size={14} />
                      Iniciar Reparación
                    </button>
                  )}
                  
                  {selectedRepair.status === 'En Reparación' && (
                    <button 
                      onClick={() => handleMoveStatus(selectedRepair, 'Listo para Entregar')}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'var(--accent-purple-grad)', color: '#fff' }}
                      disabled={loading}
                    >
                      <CheckCircle size={14} />
                      Completar y Marcar Listo
                    </button>
                  )}

                  {selectedRepair.status === 'Listo para Entregar' && (
                    <button 
                      onClick={() => handleInvoiceClick(selectedRepair)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                      <ShoppingBag size={14} />
                      Entregar y Cobrar en Caja (POS)
                      <ArrowRight size={14} />
                    </button>
                  )}

                  {selectedRepair.status === 'Entregado' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle size={16} />
                      <span>Equipo entregado e insonorizado correctamente.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Historial de Notas y Cambios
                </span>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  {selectedRepair.comments ? (
                    selectedRepair.comments.split('\n').map((comm, idx) => (
                      <div key={idx} style={{ paddingBottom: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.02)', whiteSpace: 'pre-wrap' }}>
                        {comm}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Sin historial registrado</span>
                  )}
                </div>
              </div>

              {/* Add Note/Comment */}
              {selectedRepair.status !== 'Entregado' && (
                <form onSubmit={handleAddComment}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Agregar Nueva Nota al Historial</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Ej: Se soldó pin de prueba..."
                        className="form-input"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={loading}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-secondary" 
                        disabled={loading || !newComment.trim()}
                        style={{ height: '42px', padding: '0.75rem 1rem' }}
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedRepair(null)} className="btn btn-secondary">
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

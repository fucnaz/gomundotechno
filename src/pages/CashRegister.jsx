import React, { useState, useMemo } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  Coins, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Trash2, 
  Printer, 
  X,
  PlusCircle,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function CashRegister() {
  const { sales, expenses, saveExpense, deleteExpense, loading, showToast } = useSheet();
  const { user } = useAuth();

  // Date selection (default to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });

  // Expense Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  // Arqueo Modal State
  const [isArqueoOpen, setIsArqueoOpen] = useState(false);

  // Filter Sales & Expenses by Selected Date
  const daySales = useMemo(() => {
    return sales.filter(sale => {
      try {
        return sale.date && sale.date.startsWith(selectedDate);
      } catch (e) {
        return false;
      }
    });
  }, [sales, selectedDate]);

  const dayExpenses = useMemo(() => {
    return expenses.filter(exp => {
      try {
        return exp.date && exp.date.startsWith(selectedDate);
      } catch (e) {
        return false;
      }
    });
  }, [expenses, selectedDate]);

  // Totals calculations
  const totals = useMemo(() => {
    // Sales totals by payment method
    let salesEfectivo = 0;
    let salesTarjeta = 0;
    let salesTransferencia = 0;

    daySales.forEach(s => {
      const amt = Number(s.total || 0);
      if (s.paymentMethod === 'Efectivo') salesEfectivo += amt;
      else if (s.paymentMethod === 'Tarjeta') salesTarjeta += amt;
      else if (s.paymentMethod === 'Transferencia') salesTransferencia += amt;
    });

    const totalSales = salesEfectivo + salesTarjeta + salesTransferencia;

    // Expenses totals by payment method
    let expEfectivo = 0;
    let expTarjeta = 0;
    let expTransferencia = 0;

    dayExpenses.forEach(e => {
      const amt = Number(e.amount || 0);
      if (e.paymentMethod === 'Efectivo') expEfectivo += amt;
      else if (e.paymentMethod === 'Tarjeta') expTarjeta += amt;
      else if (e.paymentMethod === 'Transferencia') expTransferencia += amt;
    });

    const totalExpenses = expEfectivo + expTarjeta + expTransferencia;

    return {
      sales: { total: totalSales, efectivo: salesEfectivo, tarjeta: salesTarjeta, transferencia: salesTransferencia },
      expenses: { total: totalExpenses, efectivo: expEfectivo, tarjeta: expTarjeta, transferencia: expTransferencia },
      netBalance: totalSales - totalExpenses,
      expectedCash: salesEfectivo - expEfectivo
    };
  }, [daySales, dayExpenses]);

  // Handle Expense log submit
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      showToast('Por favor completa todos los campos del gasto', 'warning');
      return;
    }

    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      showToast('Por favor ingresa un monto válido', 'warning');
      return;
    }

    const expenseData = {
      userId: user.id,
      description: description.trim(),
      amount: amtNum,
      paymentMethod: paymentMethod,
      date: new Date(selectedDate + 'T12:00:00').toISOString() // align with selected date
    };

    const success = await saveExpense(expenseData);
    if (success) {
      setDescription('');
      setAmount('');
      setPaymentMethod('Efectivo');
    }
  };

  const handleDeleteExpense = async (id, desc) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el gasto "${desc}"?`)) {
      await deleteExpense(id);
    }
  };

  const formatDateLabel = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* Header Panel */}
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Caja Diario y Arqueo
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Registra gastos y compras del día, consulta balances y realiza el arqueo de caja.
          </p>
        </div>

        {/* Date Selector and Print Arqueo Button */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input 
              type="date" 
              className="form-input" 
              style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }} 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsArqueoOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <Printer size={18} />
            Hacer Arqueo de Caja
          </button>
        </div>
      </div>

      {/* Quick Financial Summary */}
      <div className="stats-grid">
        {/* Sales (Inflow) */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Ingresos (Ventas)
            </span>
            <div style={{ color: 'var(--color-success)', background: 'rgba(0, 230, 118, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            +${totals.sales.total.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Efectivo: ${totals.sales.efectivo.toLocaleString()} | Transf: ${totals.sales.transferencia.toLocaleString()}
          </span>
        </div>

        {/* Expenses (Outflow) */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Egresos (Compras/Gastos)
            </span>
            <div style={{ color: 'var(--color-danger)', background: 'rgba(255, 23, 68, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            -${totals.expenses.total.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Efectivo: ${totals.expenses.efectivo.toLocaleString()} | Transf: ${totals.expenses.transferencia.toLocaleString()}
          </span>
        </div>

        {/* Expected Cash in Register */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Efectivo Esperado en Caja
            </span>
            <div style={{ color: 'var(--primary-cyan)', background: 'rgba(0, 242, 254, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-cyan)', fontFamily: 'var(--font-display)' }}>
            ${totals.expectedCash.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Monto a rendir físicamente en efectivo
          </span>
        </div>

        {/* Daily Net Balance */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Saldo Neto Diario
            </span>
            <div style={{ color: 'var(--accent-purple)', background: 'rgba(155, 93, 229, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <Scale size={18} />
            </div>
          </div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            color: totals.netBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)', 
            fontFamily: 'var(--font-display)' 
          }}>
            {totals.netBalance >= 0 ? '+' : '-'}${Math.abs(totals.netBalance).toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Balance general de la jornada
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }} className="sales-grid">
        
        {/* Left Side: Daily Transactions Lists */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '400px' }}>
          <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)' }}>
            Transacciones del {formatDateLabel(selectedDate)}
          </h2>

          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Sales (Ingresos) list */}
            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--color-success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowUpRight size={16} />
                Ingresos (Ventas)
              </h3>
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left', background: 'rgba(0,0,0,0.2)' }}>
                      <th style={{ padding: '0.5rem' }}>ID</th>
                      <th style={{ padding: '0.5rem' }}>Detalle</th>
                      <th style={{ padding: '0.5rem' }}>Método</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daySales.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay ingresos registrados</td>
                      </tr>
                    ) : (
                      daySales.map(s => {
                        let details = 'Venta';
                        try {
                          const items = typeof s.items === 'string' ? JSON.parse(s.items) : s.items;
                          if (items && items.length > 0) {
                            details = items.map(it => `${it.quantity}x ${it.name.substring(0, 15)}`).join(', ');
                          }
                        } catch (e) {}

                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{s.id.substring(0, 8)}</td>
                            <td style={{ padding: '0.5rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={details}>{details}</td>
                            <td style={{ padding: '0.5rem' }}>{s.paymentMethod}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-success)' }}>${Number(s.total).toLocaleString()}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses (Egresos) list */}
            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--color-danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowDownRight size={16} />
                Egresos (Gastos / Compras)
              </h3>
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left', background: 'rgba(0,0,0,0.2)' }}>
                      <th style={{ padding: '0.5rem' }}>Detalle / Concepto</th>
                      <th style={{ padding: '0.5rem' }}>Método</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '0.5rem', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay gastos registrados</td>
                      </tr>
                    ) : (
                      dayExpenses.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '0.5rem' }}>{e.description}</td>
                          <td style={{ padding: '0.5rem' }}>{e.paymentMethod}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-danger)' }}>-${Number(e.amount).toLocaleString()}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteExpense(e.id, e.description)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.2rem' }}
                              title="Eliminar Gasto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Log Expense Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="var(--primary-cyan)" />
            Registrar Egreso / Gasto
          </h2>

          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Descripción del Gasto / Compra *</label>
              <input
                type="text"
                required
                placeholder="Ej: Repuesto pantalla Samsung A32"
                className="form-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Monto del Egreso ($) *</label>
              <input
                type="number"
                required
                placeholder="0"
                className="form-input"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Método de Pago Utilizado *</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }}></span> : 'Registrar Egreso'}
            </button>
          </form>
        </div>

      </div>

      {/* ARQUEO DE CAJA PRINTABLE MODAL */}
      {isArqueoOpen && (
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
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '1.5rem',
            position: 'relative',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Close */}
            <button 
              onClick={() => setIsArqueoOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Printable Report Content */}
            <div id="arqueo-print-area" style={{
              background: '#ffffff',
              color: '#000000',
              fontFamily: 'monospace',
              padding: '1.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              overflowY: 'auto',
              flex: 1,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 0.2rem 0', fontFamily: 'monospace' }}>
                  GO MUNDO TECHNO
                </h2>
                <p style={{ margin: '0 0 0.15rem 0' }}>Reporte de Arqueo y Cierre de Caja</p>
                <p style={{ margin: '0' }}><strong>FECHA:</strong> {formatDateLabel(selectedDate)}</p>
              </div>

              <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                <p style={{ margin: '0 0 0.15rem 0' }}><strong>RESPONSABLE:</strong> {user.name}</p>
                <p style={{ margin: '0 0 0.15rem 0' }}><strong>HORA EMISIÓN:</strong> {new Date().toLocaleTimeString()}</p>
                <p style={{ margin: '0' }}><strong>ESTADO:</strong> Cierre de Turno</p>
              </div>

              {/* Inflow vs Outflow Table */}
              <div style={{ borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.35rem 0', fontWeight: 'bold' }}>RESUMEN DE FLUJO</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
                  <span>(+) Ingresos por Ventas:</span>
                  <span>${totals.sales.total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.1rem 0' }}>
                  <span>(-) Egresos / Gastos:</span>
                  <span>-${totals.expenses.total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderTop: '1px solid #000', fontWeight: 'bold' }}>
                  <span>(=) Balance Neto:</span>
                  <span>${totals.netBalance.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div style={{ borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.35rem 0', fontWeight: 'bold' }}>DESGLOSE POR MÉTODO</h4>
                
                <p style={{ margin: '0.25rem 0 0.1rem 0', textDecoration: 'underline' }}><strong>Efectivo</strong></p>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                  <span>Ventas Efectivo:</span>
                  <span>+${totals.sales.efectivo.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                  <span>Gastos Efectivo:</span>
                  <span>-${totals.expenses.efectivo.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem', fontWeight: 'bold' }}>
                  <span>Rendición Efectivo:</span>
                  <span>${totals.expectedCash.toLocaleString()}</span>
                </div>

                <p style={{ margin: '0.25rem 0 0.1rem 0', textDecoration: 'underline' }}><strong>Transferencia bancaria</strong></p>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                  <span>Ventas Transf:</span>
                  <span>+${totals.sales.transferencia.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                  <span>Egresos Transf:</span>
                  <span>-${totals.expenses.transferencia.toLocaleString()}</span>
                </div>

                <p style={{ margin: '0.25rem 0 0.1rem 0', textDecoration: 'underline' }}><strong>Tarjeta Débito/Crédito</strong></p>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                  <span>Ventas Tarjeta:</span>
                  <span>+${totals.sales.tarjeta.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                  <span>Egresos Tarjeta:</span>
                  <span>-${totals.expenses.tarjeta.toLocaleString()}</span>
                </div>
              </div>

              {/* Expected Physical Cash */}
              <div style={{ borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '1rem', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <strong>EFECTIVO ESPERADO:</strong>
                  <strong>${totals.expectedCash.toLocaleString()}</strong>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ borderTop: '1px solid #000', width: '120px', marginTop: '1rem' }}></div>
                  <span style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>Responsable de Caja</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ borderTop: '1px solid #000', width: '120px', marginTop: '1rem' }}></div>
                  <span style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>Auditor / Admin</span>
                </div>
              </div>
            </div>

            {/* Receipt Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  const printContents = document.getElementById('arqueo-print-area').innerHTML;
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Cierre de Caja - Go Mundo Techno</title>
                        <style>
                          body { font-family: monospace; padding: 20px; color: #000; background: #fff; }
                          .text-center { text-align: center; }
                          .text-right { text-align: right; }
                        </style>
                      </head>
                      <body>
                        ${printContents}
                        <script>
                          window.onload = function() {
                            window.print();
                            window.close();
                          }
                        </script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.65rem' }}
              >
                <Printer size={16} />
                Imprimir
              </button>
              <button 
                onClick={() => setIsArqueoOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.65rem' }}
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

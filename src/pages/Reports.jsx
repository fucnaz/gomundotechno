import React, { useMemo } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Wrench, 
  CreditCard,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export default function Reports() {
  const { sales, repairs, products } = useSheet();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Access check
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
          Lo sentimos, solo los usuarios con el rol de <strong>Administrador</strong> tienen permisos para ver reportes y estadísticas financieras.
        </p>
      </div>
    );
  }

  // Dashboard calculations
  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  }, [sales]);

  const salesCount = sales.length;

  const averageTicket = useMemo(() => {
    return salesCount > 0 ? (totalRevenue / salesCount) : 0;
  }, [totalRevenue, salesCount]);

  const pendingRepairsCount = useMemo(() => {
    return repairs.filter(r => r.status !== 'Entregado').length;
  }, [repairs]);

  // Chart 1: Sales Over Time (Grouped by date)
  const salesOverTimeData = useMemo(() => {
    const dailyMap = {};
    
    // Sort sales by date ascending
    const sortedSales = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedSales.forEach(sale => {
      try {
        const dateStr = new Date(sale.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + Number(sale.total);
      } catch (e) {
        // ignore invalid dates
      }
    });

    return Object.keys(dailyMap).map(date => ({
      fecha: date,
      Monto: dailyMap[date]
    }));
  }, [sales]);

  // Chart 2: Sales by Category
  const salesByCategoryData = useMemo(() => {
    const categoryMap = {};
    
    sales.forEach(sale => {
      let items = [];
      try {
        items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
      } catch (e) {
        items = [];
      }
      
      if (Array.isArray(items)) {
        items.forEach(item => {
          const category = item.category || 'Otros';
          const subtotal = Number(item.price || 0) * Number(item.quantity || 1);
          categoryMap[category] = (categoryMap[category] || 0) + subtotal;
        });
      }
    });

    return Object.keys(categoryMap).map(cat => ({
      name: cat,
      value: categoryMap[cat]
    }));
  }, [sales]);

  // Chart 3: Payment Method
  const paymentMethodData = useMemo(() => {
    const methods = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
    sales.forEach(sale => {
      const method = sale.paymentMethod || 'Efectivo';
      methods[method] = (methods[method] || 0) + Number(sale.total);
    });

    return Object.keys(methods).map(m => ({
      name: m,
      Monto: methods[m]
    }));
  }, [sales]);

  // Colors for charts
  const COLORS = ['#00f2fe', '#9b5de5', '#ffb300', '#00e676', '#ff1744', '#00b0ff'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div className="header-actions">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            Reportes e Indicadores
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Estadísticas comerciales, flujo de caja y análisis de ventas en tiempo real.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Ingresos Totales
            </span>
            <div style={{ color: 'var(--color-success)', background: 'rgba(0, 230, 118, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            ${totalRevenue.toLocaleString()}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <TrendingUp size={12} color="var(--color-success)" />
            <span>Facturación acumulada</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Transacciones (Ventas)
            </span>
            <div style={{ color: 'var(--primary-cyan)', background: 'rgba(0, 242, 254, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            {salesCount}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <ArrowUpRight size={12} color="var(--primary-cyan)" />
            <span>Tickets de venta emitidos</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Ticket Promedio
            </span>
            <div style={{ color: 'var(--accent-purple)', background: 'rgba(155, 93, 229, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            ${Math.round(averageTicket).toLocaleString()}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Valor medio por venta</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Reparaciones Activas
            </span>
            <div style={{ color: 'var(--color-warning)', background: 'rgba(255, 179, 0, 0.1)', padding: '0.35rem', borderRadius: '8px' }}>
              <Wrench size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            {pendingRepairsCount}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Equipos en taller</span>
          </div>
        </div>

      </div>

      {sales.length === 0 ? (
        <div className="glass-panel" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No hay ventas registradas aún para generar los gráficos y análisis financieros.
        </div>
      ) : (
        <>
          {/* Charts Row 1: Line chart for Sales Trend */}
          <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
              Tendencia de Ventas (Evolución Diaria)
            </h3>
            <div style={{ width: '100%', height: 'calc(100% - 2.5rem)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-cyan)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary-cyan)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="fecha" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '10px' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--primary-cyan)' }}
                  />
                  <Area type="monotone" dataKey="Monto" stroke="var(--primary-cyan)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2: Category and Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: '320px' }}>
            
            {/* Category Pie Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                Ventas por Categoría de Producto
              </h3>
              
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', height: '100%' }}>
                <div style={{ flex: 1, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {salesByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '160px', overflowY: 'auto', maxHeight: '180px' }}>
                  {salesByCategoryData.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{entry.name}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>${entry.value.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Methods Bar Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                Ventas por Métodos de Pago
              </h3>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '10px' }}
                    />
                    <Bar dataKey="Monto" radius={[8, 8, 0, 0]}>
                      {paymentMethodData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Efectivo' ? 'var(--color-success)' :
                            entry.name === 'Tarjeta' ? 'var(--primary-blue)' : 'var(--accent-purple)'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SheetContext = createContext(null);

export const useSheet = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('useSheet must be used within a SheetProvider');
  }
  return context;
};

// Initial Mock Data for Demo Mode
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'iPhone 13 Pro 128GB', description: 'Reacondicionado Grado A, color Grafito', price: 899, stock: 5, category: 'Celulares' },
  { id: 'p2', name: 'Vidrio Templado 9D iPhone 13/14', description: 'Vidrio templado dureza 9H con bordes curvos', price: 12, stock: 120, category: 'Vidrios' },
  { id: 'p3', name: 'Cargador Carga Rápida USB-C 20W', description: 'Cargador compatible con carga rápida Power Delivery', price: 25, stock: 45, category: 'Accesorios' },
  { id: 'p4', name: 'Samsung Galaxy A54 5G', description: 'Pantalla Super AMOLED 120Hz, 128GB ROM, 8GB RAM', price: 420, stock: 8, category: 'Celulares' },
  { id: 'p5', name: 'Auriculares Inalámbricos SoundBuds', description: 'Auriculares bluetooth con cancelación de ruido activa', price: 59, stock: 15, category: 'Audio' },
  { id: 'p6', name: 'Cable USB-C a Lightning 1.2m', description: 'Cable reforzado de nylon para carga y datos', price: 15, stock: 80, category: 'Accesorios' },
  { id: 'p7', name: 'Vidrio Templado UV Curvo Galaxy S23', description: 'Vidrio templado con pegamento líquido UV para pantallas curvas', price: 18, stock: 50, category: 'Vidrios' }
];

const INITIAL_REPAIRS = [
  { 
    id: 'r1', 
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
    customerName: 'Juan Pérez', 
    customerPhone: '+54 9 11 5555-0199', 
    deviceModel: 'iPhone 11', 
    issueDescription: 'Cambio de pantalla táctil (astillada por caída)', 
    estimatePrice: 110, 
    status: 'Recibido', 
    comments: '[2026-07-25]: Recibido con pantalla astillada. Se solicitó repuesto original.', 
    technicianId: 'admin-id-1' 
  },
  { 
    id: 'r2', 
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    customerName: 'María Gómez', 
    customerPhone: '+54 9 11 5555-0288', 
    deviceModel: 'Samsung Galaxy S20', 
    issueDescription: 'Pin de carga sulfatado, no toma carga', 
    estimatePrice: 45, 
    status: 'En Reparación', 
    comments: '[2026-07-26]: Limpieza de pin no resolvió. Requiere cambio de placa de carga secundaria.', 
    technicianId: 'admin-id-1' 
  },
  { 
    id: 'r3', 
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    customerName: 'Carlos López', 
    customerPhone: '+54 9 11 5555-0377', 
    deviceModel: 'Xiaomi Redmi Note 10 Pro', 
    issueDescription: 'Cambio de batería (se apaga al 30%)', 
    estimatePrice: 35, 
    status: 'Listo para Entregar', 
    comments: '[2026-07-27]: Batería nueva instalada. Ciclos de carga y retención de carga testeados OK.', 
    technicianId: 'admin-id-1' 
  }
];

const INITIAL_SALES = [
  { 
    id: 's1', 
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), 
    userId: 'admin-id-1', 
    items: JSON.stringify([
      { id: 'p3', name: 'Cargador Carga Rápida USB-C 20W', price: 25, quantity: 1, category: 'Accesorios' },
      { id: 'p6', name: 'Cable USB-C a Lightning 1.2m', price: 15, quantity: 1, category: 'Accesorios' }
    ]), 
    subtotal: 40, 
    total: 40, 
    paymentMethod: 'Efectivo', 
    type: 'venta_directa' 
  },
  { 
    id: 's2', 
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    userId: 'seller-id-1', 
    items: JSON.stringify([
      { id: 'p2', name: 'Vidrio Templado 9D iPhone 13/14', price: 12, quantity: 2, category: 'Vidrios' },
      { id: 'glass-manual', name: 'Colocación Vidrio Templado (Servicio)', price: 15, quantity: 1, category: 'Vidrios', isManual: true }
    ]), 
    subtotal: 39, 
    total: 39, 
    paymentMethod: 'Transferencia', 
    type: 'vidrio_templado' 
  },
  { 
    id: 's3', 
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    userId: 'admin-id-1', 
    items: JSON.stringify([
      { id: 'p4', name: 'Samsung Galaxy A54 5G', price: 420, quantity: 1, category: 'Celulares' }
    ]), 
    subtotal: 420, 
    total: 420, 
    paymentMethod: 'Tarjeta', 
    type: 'venta_directa' 
  }
];

const INITIAL_EXPENSES = [
  { id: 'e1', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), userId: 'admin-id-1', description: 'Compra de 10 Módulos de pantalla iPhone X', amount: 150, paymentMethod: 'Efectivo' },
  { id: 'e2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), userId: 'admin-id-1', description: 'Pack de 30 Vidrios Templados Curvos', amount: 60, paymentMethod: 'Transferencia' }
];

export const SheetProvider = ({ children }) => {
  const { loginOnline } = useAuth();
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('gt_sheet_url') || '');
  const [products, setProducts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast Notification Helpers
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to handle API operations
  const executeApi = async (action, data = {}) => {
    if (!sheetUrl) {
      throw new Error('Google Sheets URL no configurada');
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action, data })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Operación fallida en el servidor');
      }
      return resData;
    } catch (err) {
      console.error(`Error en API (${action}):`, err);
      setError(err.message);
      showToast(`Error: ${err.message}`, 'danger');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    
    if (!sheetUrl) {
      // Load from LocalStorage (Demo Mode)
      console.log('Cargando en Modo Demo...');
      
      const localProducts = localStorage.getItem('gt_products');
      const localRepairs = localStorage.getItem('gt_repairs');
      const localSales = localStorage.getItem('gt_sales');
      const localUsers = localStorage.getItem('gt_users');
      
      if (!localProducts) {
        localStorage.setItem('gt_products', JSON.stringify(INITIAL_PRODUCTS));
        setProducts(INITIAL_PRODUCTS);
      } else {
        setProducts(JSON.parse(localProducts));
      }

      if (!localRepairs) {
        localStorage.setItem('gt_repairs', JSON.stringify(INITIAL_REPAIRS));
        setRepairs(INITIAL_REPAIRS);
      } else {
        setRepairs(JSON.parse(localRepairs));
      }

      if (!localSales) {
        localStorage.setItem('gt_sales', JSON.stringify(INITIAL_SALES));
        setSales(INITIAL_SALES);
      } else {
        setSales(JSON.parse(localSales));
      }

      const localExpenses = localStorage.getItem('gt_expenses');
      if (!localExpenses) {
        localStorage.setItem('gt_expenses', JSON.stringify(INITIAL_EXPENSES));
        setExpenses(INITIAL_EXPENSES);
      } else {
        setExpenses(JSON.parse(localExpenses));
      }

      const defaultDemoUsers = [
        { id: 'admin-id-1', username: 'admin', name: 'Administrador Demo', role: 'admin', status: 'activo' },
        { id: 'seller-id-1', username: 'vendedor', name: 'Vendedor Demo', role: 'vendedor_tecnico', status: 'activo' }
      ];

      if (!localUsers) {
        localStorage.setItem('gt_users', JSON.stringify(defaultDemoUsers));
        setUsers(defaultDemoUsers);
      } else {
        setUsers(JSON.parse(localUsers));
      }
      
      setConnected(false);
      if (!silent) setLoading(false);
      return;
    }

    try {
      const res = await executeApi('getData');
      if (res.success) {
        setProducts(res.products || []);
        setRepairs(res.repairs || []);
        setSales(res.sales || []);
        setUsers(res.users || []);
        setExpenses(res.expenses || []);
        setConnected(true);
      }
    } catch (err) {
      setConnected(false);
      // Failover to local storage if API fails
      showToast('Falló la conexión a Sheets. Usando datos almacenados localmente.', 'warning');
      const localProducts = localStorage.getItem('gt_products') ? JSON.parse(localStorage.getItem('gt_products')) : INITIAL_PRODUCTS;
      const localRepairs = localStorage.getItem('gt_repairs') ? JSON.parse(localStorage.getItem('gt_repairs')) : INITIAL_REPAIRS;
      const localSales = localStorage.getItem('gt_sales') ? JSON.parse(localStorage.getItem('gt_sales')) : INITIAL_SALES;
      const localUsers = localStorage.getItem('gt_users') ? JSON.parse(localStorage.getItem('gt_users')) : [];
      const localExpenses = localStorage.getItem('gt_expenses') ? JSON.parse(localStorage.getItem('gt_expenses')) : INITIAL_EXPENSES;
      setProducts(localProducts);
      setRepairs(localRepairs);
      setSales(localSales);
      setUsers(localUsers);
      setExpenses(localExpenses);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Load initially
  useEffect(() => {
    fetchData();
  }, [sheetUrl]);

  // Save sheet URL
  const saveSheetUrl = async (url) => {
    if (!url) {
      localStorage.removeItem('gt_sheet_url');
      setSheetUrl('');
      setConnected(false);
      showToast('Google Sheets desconectado. Modo Demo activo.', 'info');
      return true;
    }

    // Try testing connection
    setLoading(true);
    try {
      const testRes = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!testRes.ok) throw new Error('Respuesta inválida del servidor');
      const testData = await testRes.json();
      
      if (testData.status === 'online') {
        localStorage.setItem('gt_sheet_url', url);
        setSheetUrl(url);
        setConnected(true);
        showToast('¡Conectado exitosamente a Google Sheets!', 'success');
        setLoading(false);
        return true;
      }
      throw new Error('El script no coincide con la versión requerida');
    } catch (err) {
      console.error(err);
      showToast(`Error de conexión: ${err.message}. Verifica que el script esté publicado como web app y con acceso a "Cualquiera".`, 'danger');
      setLoading(false);
      return false;
    }
  };

  // Authenticate user via Google Sheets
  const loginSheet = async (username, password) => {
    if (!sheetUrl) {
      throw new Error('Google Sheets URL no configurada');
    }
    const res = await executeApi('login', { username, password });
    if (res.success && res.user) {
      loginOnline(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Credenciales incorrectas' };
  };

  // Action methods
  const saveProduct = async (product) => {
    const isNew = !product.id;
    const finalProduct = {
      ...product,
      id: product.id || `p_${Date.now()}`,
      price: Number(product.price),
      stock: Number(product.stock)
    };

    if (!sheetUrl) {
      // Demo Mode Write
      const updatedProducts = isNew 
        ? [...products, finalProduct]
        : products.map(p => p.id === product.id ? finalProduct : p);
      
      localStorage.setItem('gt_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      showToast(isNew ? 'Producto creado localmente' : 'Producto actualizado localmente', 'success');
      return true;
    }

    try {
      await executeApi('saveProduct', finalProduct);
      showToast(isNew ? 'Producto creado en Sheets' : 'Producto actualizado en Sheets', 'success');
      fetchData(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const deleteProduct = async (id) => {
    if (!sheetUrl) {
      const updatedProducts = products.filter(p => p.id !== id);
      localStorage.setItem('gt_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      showToast('Producto eliminado localmente', 'warning');
      return true;
    }

    try {
      await executeApi('deleteProduct', { id });
      showToast('Producto eliminado de Sheets', 'warning');
      fetchData(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const saveSale = async (sale) => {
    const finalSale = {
      ...sale,
      id: sale.id || `s_${Date.now()}`,
      date: new Date().toISOString(),
      subtotal: Number(sale.subtotal),
      total: Number(sale.total)
    };

    if (!sheetUrl) {
      // Save Sale locally
      const updatedSales = [finalSale, ...sales];
      localStorage.setItem('gt_sales', JSON.stringify(updatedSales));
      setSales(updatedSales);

      // Decrement inventory stock locally
      const updatedProducts = products.map(p => {
        const saleItem = sale.items.find(item => item.id === p.id && !item.isManual);
        if (saleItem) {
          return { ...p, stock: Math.max(0, p.stock - saleItem.quantity) };
        }
        return p;
      });
      localStorage.setItem('gt_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);

      // If it is a repair sale, update repair status locally
      if (sale.type === 'reparacion' && sale.repairId) {
        const updatedRepairs = repairs.map(r => {
          if (r.id === sale.repairId) {
            return { 
              ...r, 
              status: 'Entregado',
              comments: r.comments + `\n[${new Date().toISOString().substring(0, 10)}] Reparación cobrada y entregada (Venta ID: ${finalSale.id})`
            };
          }
          return r;
        });
        localStorage.setItem('gt_repairs', JSON.stringify(updatedRepairs));
        setRepairs(updatedRepairs);
      }

      showToast('Venta registrada localmente', 'success');
      return finalSale;
    }

    try {
      await executeApi('saveSale', finalSale);
      showToast('Venta registrada en Sheets', 'success');
      fetchData(true);
      return finalSale;
    } catch (e) {
      return false;
    }
  };

  const saveRepair = async (repair) => {
    const isNew = !repair.id;
    const finalRepair = {
      ...repair,
      id: repair.id || `r_${Date.now()}`,
      date: repair.date || new Date().toISOString(),
      estimatePrice: Number(repair.estimatePrice)
    };

    if (!sheetUrl) {
      const updatedRepairs = isNew
        ? [finalRepair, ...repairs]
        : repairs.map(r => r.id === repair.id ? finalRepair : r);
      
      localStorage.setItem('gt_repairs', JSON.stringify(updatedRepairs));
      setRepairs(updatedRepairs);
      showToast(isNew ? 'Reparación registrada localmente' : 'Reparación actualizada localmente', 'success');
      return true;
    }

    try {
      await executeApi('saveRepair', finalRepair);
      showToast(isNew ? 'Reparación registrada en Sheets' : 'Reparación actualizada en Sheets', 'success');
      fetchData(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const updateRepairStatus = async (id, status, comment) => {
    if (!sheetUrl) {
      const updatedRepairs = repairs.map(r => {
        if (r.id === id) {
          const dateStr = new Date().toISOString().substring(0, 10);
          const newComments = r.comments + (comment ? `\n[${dateStr}]: ${comment}` : '');
          return { ...r, status, comments: newComments };
        }
        return r;
      });
      localStorage.setItem('gt_repairs', JSON.stringify(updatedRepairs));
      setRepairs(updatedRepairs);
      showToast('Estado de reparación actualizado localmente', 'success');
      return true;
    }

    try {
      await executeApi('updateRepairStatus', { id, status, comment });
      showToast('Estado de reparación actualizado en Sheets', 'success');
      fetchData(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const saveUser = async (user) => {
    const isNew = !user.id;
    const finalUser = {
      ...user,
      id: user.id || `u_${Date.now()}`
    };

    if (!sheetUrl) {
      // Validate username duplicate locally
      if (isNew) {
        const userExists = users.some(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (userExists) {
          showToast('El nombre de usuario ya existe', 'danger');
          return false;
        }
      }

      const updatedUsers = isNew
        ? [...users, finalUser]
        : users.map(u => u.id === user.id ? { ...u, ...finalUser } : u);
      
      // Don't save password in list
      const saveUsers = updatedUsers.map(u => {
        const copy = {...u};
        delete copy.password;
        return copy;
      });

      localStorage.setItem('gt_users', JSON.stringify(saveUsers));
      setUsers(saveUsers);
      showToast(isNew ? 'Usuario creado localmente' : 'Usuario actualizado localmente', 'success');
      return true;
    }

    try {
      const res = await executeApi('saveUser', finalUser);
      showToast(isNew ? 'Usuario creado en Sheets' : 'Usuario actualizado en Sheets', 'success');
      fetchData(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const saveExpense = async (expense) => {
    const isNew = !expense.id;
    const finalExpense = {
      ...expense,
      id: expense.id || `e_${Date.now()}`,
      date: expense.date || new Date().toISOString(),
      amount: Number(expense.amount)
    };

    if (!sheetUrl) {
      const updatedExpenses = isNew
        ? [finalExpense, ...expenses]
        : expenses.map(e => e.id === expense.id ? finalExpense : e);
      
      localStorage.setItem('gt_expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
      showToast(isNew ? 'Gasto registrado localmente' : 'Gasto actualizado localmente', 'success');
      return true;
    }

    try {
      await executeApi('saveExpense', finalExpense);
      showToast(isNew ? 'Gasto registrado en Sheets' : 'Gasto actualizado en Sheets', 'success');
      fetchData(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const deleteExpense = async (id) => {
    if (!sheetUrl) {
      const updatedExpenses = expenses.filter(e => e.id !== id);
      localStorage.setItem('gt_expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
      showToast('Gasto eliminado localmente', 'warning');
      return true;
    }

    try {
      await executeApi('deleteExpense', { id });
      showToast('Gasto eliminado de Sheets', 'warning');
      fetchData(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <SheetContext.Provider value={{
      sheetUrl,
      products,
      repairs,
      sales,
      users,
      loading,
      error,
      connected,
      toasts,
      showToast,
      removeToast,
      saveSheetUrl,
      loginSheet,
      saveProduct,
      deleteProduct,
      saveSale,
      saveRepair,
      updateRepairStatus,
      saveUser,
      expenses,
      saveExpense,
      deleteExpense,
      refreshData: () => fetchData(true)
    }}>
      {children}
    </SheetContext.Provider>
  );
};

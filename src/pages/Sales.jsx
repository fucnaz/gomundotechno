import React, { useState, useMemo, useEffect } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Send, 
  PlusCircle, 
  Printer, 
  X,
  FileText,
  ShoppingBag,
  Info
} from 'lucide-react';

export default function Sales() {
  const { products, saveSale, showToast, repairs } = useSheet();
  const { user } = useAuth();

  // POS State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  
  // Custom manual service state
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState('');
  const [manualItemCategory, setManualItemCategory] = useState('Vidrios');

  // Receipt Modal State
  const [completedSale, setCompletedSale] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Link sale to active ready repairs
  const [linkedRepairId, setLinkedRepairId] = useState('');

  // Auto-link pending repair from repairs tab redirection
  useEffect(() => {
    const pendingRepairId = localStorage.getItem('gt_pending_invoice_repair_id');
    if (pendingRepairId) {
      setLinkedRepairId(pendingRepairId);
      const repair = repairs.find(r => r.id === pendingRepairId);
      if (repair) {
        setCart(current => {
          const cleaned = current.filter(item => !item.id.startsWith('repair_'));
          return [...cleaned, {
            id: `repair_${repair.id}`,
            name: `Reparación: ${repair.deviceModel} (${repair.customerName})`,
            price: Number(repair.estimatePrice),
            category: 'Repuestos',
            quantity: 1,
            isManual: true,
            repairRefId: repair.id
          }];
        });
        showToast(`Reparación de ${repair.deviceModel} vinculada automáticamente`, 'success');
      }
      localStorage.removeItem('gt_pending_invoice_repair_id');
    }
  }, [repairs]);

  // Categories
  const categories = ['Todos', 'Celulares', 'Vidrios', 'Accesorios', 'Audio', 'Repuestos', 'Otros'];

  // Undelivered/ready repairs that can be paid
  const billableRepairs = useMemo(() => {
    return repairs.filter(r => r.status === 'Listo para Entregar');
  }, [repairs]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Add inventory product to cart
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast(`El producto ${product.name} no tiene stock disponible`, 'warning');
      return;
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id && !item.isManual);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showToast(`No puedes agregar más de ${product.stock} unidades de este producto`, 'warning');
          return currentCart;
        }
        return currentCart.map(item => 
          item.id === product.id && !item.isManual
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      showToast(`${product.name} agregado al carrito`, 'success');
      return [...currentCart, { 
        id: product.id, 
        name: product.name, 
        price: Number(product.price), 
        category: product.category,
        quantity: 1, 
        stock: product.stock,
        isManual: false,
        image: product.image
      }];
    });
  };

  // Add custom manual item (e.g. Glass installation, special repair)
  const addManualItem = (e) => {
    e.preventDefault();
    if (!manualItemName.trim()) {
      showToast('Ingresa un nombre para el servicio/item', 'warning');
      return;
    }
    const price = Number(manualItemPrice);
    if (isNaN(price) || price <= 0) {
      showToast('Ingresa un precio válido para el servicio/item', 'warning');
      return;
    }

    const manualId = `manual_${Date.now()}`;
    const newManualItem = {
      id: manualId,
      name: manualItemName.trim(),
      price: price,
      category: manualItemCategory,
      quantity: 1,
      isManual: true
    };

    setCart(current => [...current, newManualItem]);
    showToast(`Servicio "${manualItemName}" agregado al carrito`, 'success');
    
    // Reset inputs
    setManualItemName('');
    setManualItemPrice('');
  };

  // Link repair details directly into cart
  const handleLinkRepair = (e) => {
    const repairId = e.target.value;
    setLinkedRepairId(repairId);
    
    if (!repairId) return;

    const repair = repairs.find(r => r.id === repairId);
    if (repair) {
      // Check if this repair item is already in cart
      setCart(current => {
        // Remove previous repair items to avoid duplicates
        const cleaned = current.filter(item => !item.id.startsWith('repair_'));
        
        const repairCartItem = {
          id: `repair_${repair.id}`,
          name: `Reparación: ${repair.deviceModel} (${repair.customerName})`,
          price: Number(repair.estimatePrice),
          category: 'Repuestos',
          quantity: 1,
          isManual: true,
          repairRefId: repair.id
        };
        return [...cleaned, repairCartItem];
      });
      showToast(`Reparación de ${repair.deviceModel} agregada al carrito`, 'success');
    }
  };

  // Update Cart Quantity
  const updateQuantity = (itemId, isManual, delta) => {
    setCart(current => {
      return current.map(item => {
        if (item.id === itemId && item.isManual === isManual) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null; // Marked for deletion
          
          // Verify stock limit
          if (!isManual && newQty > item.stock) {
            showToast(`Máximo de stock alcanzado (${item.stock} unidades)`, 'warning');
            return item;
          }
          
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Remove item from Cart
  const removeFromCart = (itemId, isManual) => {
    setCart(current => current.filter(item => !(item.id === itemId && item.isManual === isManual)));
    showToast('Item eliminado del carrito', 'info');
    
    // If we removed a linked repair item, reset the dropdown link
    if (itemId.startsWith('repair_')) {
      setLinkedRepairId('');
    }
  };

  // Cart Calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  // Complete Sale
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('El carrito está vacío', 'warning');
      return;
    }

    const containsRepair = cart.some(item => item.id.startsWith('repair_'));
    const linkedRepairItem = cart.find(item => item.id.startsWith('repair_'));
    
    const saleType = containsRepair 
      ? 'reparacion' 
      : cart.some(item => item.category === 'Vidrios') 
        ? 'vidrio_templado' 
        : 'venta_directa';

    const saleData = {
      userId: user.id,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        isManual: item.isManual
      })),
      subtotal: cartTotal,
      total: cartTotal,
      paymentMethod: paymentMethod,
      type: saleType,
      repairId: containsRepair ? linkedRepairItem.repairRefId : ''
    };

    const result = await saveSale(saleData);
    if (result) {
      // Open receipt modal
      setCompletedSale({
        ...result,
        sellerName: user.name,
        items: cart // store full object for receipt rendering
      });
      setIsReceiptOpen(true);
      
      // Clear Cart and Inputs
      setCart([]);
      setLinkedRepairId('');
      setPaymentMethod('Efectivo');
    }
  };

  return (
    <div className="sales-grid">
      
      {/* Left Panel: Catalog and Service Adder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
        
        {/* Search and Filters */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar productos por nombre..."
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: selectedCategory === cat ? 'var(--primary-grad)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} color="var(--primary-cyan)" />
            Catálogo de Productos ({filteredProducts.length})
          </h2>
          
          {filteredProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron productos coincidentes.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {filteredProducts.map(prod => {
                const outOfStock = prod.stock <= 0;
                const lowStock = prod.stock > 0 && prod.stock <= 5;
                return (
                  <div 
                    key={prod.id} 
                    className="glass-card" 
                    onClick={() => !outOfStock && addToCart(prod)}
                    style={{ 
                      padding: '0.85rem', 
                      cursor: outOfStock ? 'not-allowed' : 'pointer',
                      opacity: outOfStock ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '270px',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Product Image Container */}
                      <div style={{
                        width: '100%',
                        height: '110px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(22,28,54,0.4) 0%, rgba(10,12,22,0.6) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)'
                          }}>
                            <Package size={36} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', gap: '0.25rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>
                          {prod.category}
                        </span>
                        {outOfStock ? (
                          <span className="badge badge-danger" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>Agotado</span>
                        ) : lowStock ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.55rem', padding: '0.1rem 0.35rem' }}>Stock: {prod.stock}</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stock: {prod.stock}</span>
                        )}
                      </div>
                      
                      <h3 style={{ 
                        fontSize: '0.85rem', 
                        marginTop: '0.4rem', 
                        lineHeight: '1.25', 
                        color: 'var(--text-primary)', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical',
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)'
                      }} title={prod.name}>
                        {prod.name}
                      </h3>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prod.description}>
                        {prod.description}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>
                        ${Number(prod.price).toLocaleString()}
                      </span>
                      <div style={{
                        background: outOfStock ? 'rgba(255,255,255,0.05)' : 'var(--primary-grad)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: outOfStock ? 'none' : 'var(--glow-cyan)'
                      }}>
                        <Plus size={16} color={outOfStock ? 'var(--text-muted)' : '#000'} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Service Adder */}
        <section className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} color="var(--accent-purple)" />
            Cargar Servicio o Producto Personalizado
          </h2>
          
          <form onSubmit={addManualItem} className="service-adder-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Descripción del Item/Servicio</label>
              <input
                type="text"
                placeholder="Ej: Vidrio Templado Colocado"
                className="form-input"
                value={manualItemName}
                onChange={e => setManualItemName(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Precio ($)</label>
              <input
                type="number"
                placeholder="0"
                className="form-input"
                value={manualItemPrice}
                onChange={e => setManualItemPrice(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={manualItemCategory}
                onChange={e => setManualItemCategory(e.target.value)}
              >
                <option value="Vidrios">Vidrio Templado</option>
                <option value="Repuestos">Reparación</option>
                <option value="Accesorios">Accesorio</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.75rem 1rem', height: '42px', display: 'flex', gap: '0.25rem', borderColor: 'var(--border-color)' }}>
              <Plus size={18} />
              Agregar
            </button>
          </form>
        </section>
      </div>

      {/* Right Panel: Shopping Cart & Checkout */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Cart Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--primary-cyan)" />
            Detalle de Venta
          </h2>
          <span className="badge badge-info" style={{ borderRadius: '6px' }}>
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Link ready repairs */}
          {billableRepairs.length > 0 && (
            <div style={{
              background: 'rgba(155, 93, 229, 0.05)',
              border: '1px solid rgba(155, 93, 229, 0.2)',
              borderRadius: '10px',
              padding: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <Info size={12} color="var(--accent-purple)" />
                ¿Cobrar una Reparación Lista?
              </label>
              <select
                className="form-select"
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', background: '#0a0b12' }}
                value={linkedRepairId}
                onChange={handleLinkRepair}
              >
                <option value="">-- Seleccionar reparación lista --</option>
                {billableRepairs.map(rep => (
                  <option key={rep.id} value={rep.id}>
                    {rep.deviceModel} ({rep.customerName}) - ${Number(rep.estimatePrice).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {cart.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem' }}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p style={{ fontSize: '0.875rem' }}>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={`${item.id}_${item.isManual}`} 
                style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '0.75rem',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={16} color="var(--text-muted)" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-cyan)', fontWeight: 700 }}>
                    ${Number(item.price).toLocaleString()}
                  </span>
                </div>
                
                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => updateQuantity(item.id, item.isManual, -1)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.1rem' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.isManual, 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.1rem' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Trash */}
                <button
                  onClick={() => removeFromCart(item.id, item.isManual)}
                  style={{
                    background: 'rgba(255, 23, 68, 0.05)',
                    border: '1px solid rgba(255, 23, 68, 0.1)',
                    borderRadius: '6px',
                    padding: '0.4rem',
                    color: 'var(--color-danger)',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Checkout Footer */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>Método de Pago</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {['Efectivo', 'Tarjeta', 'Transferencia'].map(method => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: `1px solid ${isSelected ? 'var(--primary-cyan)' : 'var(--border-color)'}`,
                      background: isSelected ? 'rgba(0,242,254,0.08)' : 'transparent',
                      color: isSelected ? 'var(--primary-cyan)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {method === 'Efectivo' && <DollarSign size={12} />}
                    {method === 'Tarjeta' && <CreditCard size={12} />}
                    {method === 'Transferencia' && <Send size={12} />}
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.25rem 0' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Monto Total:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>
              ${cartTotal.toLocaleString()}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCheckout}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={cart.length === 0}
          >
            Registrar Venta / Cobrar
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {isReceiptOpen && completedSale && (
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
            maxWidth: '380px',
            padding: '1.5rem',
            position: 'relative',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Close */}
            <button 
              onClick={() => setIsReceiptOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {/* Thermal Ticket Content */}
            <div id="receipt-print-area" style={{
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
                  GO MUNDO TECNO
                </h2>
                <p style={{ margin: '0 0 0.15rem 0' }}>Venta y Reparación de Celulares</p>
                <p style={{ margin: '0 0 0.15rem 0' }}>Colocación de Vidrios Templados</p>
                <p style={{ margin: '0' }}>Tel: +54 9 11 5555-0100</p>
              </div>

              <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                <p style={{ margin: '0 0 0.15rem 0' }}><strong>TICKET ID:</strong> {completedSale.id}</p>
                <p style={{ margin: '0 0 0.15rem 0' }}><strong>FECHA:</strong> {new Date(completedSale.date).toLocaleString()}</p>
                <p style={{ margin: '0 0 0.15rem 0' }}><strong>VENDEDOR:</strong> {completedSale.sellerName}</p>
                <p style={{ margin: '0' }}><strong>TIPO:</strong> {
                  completedSale.type === 'reparacion' ? 'Reparación de Celular' : 
                  completedSale.type === 'vidrio_templado' ? 'Instalación de Vidrio' : 'Venta General'
                }</p>
              </div>

              {/* Receipt Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px dashed #000' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '0.25rem' }}>Item</th>
                    <th style={{ textAlign: 'center', paddingBottom: '0.25rem', width: '40px' }}>Cant</th>
                    <th style={{ textAlign: 'right', paddingBottom: '0.25rem', width: '70px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSale.items.map(item => (
                    <tr key={item.id} style={{ fontSize: '0.75rem' }}>
                      <td style={{ paddingTop: '0.25rem', paddingBottom: '0.25rem', verticalAlign: 'top' }}>
                        {item.name}
                        {item.isManual && <span style={{ fontSize: '0.65rem', display: 'block', color: '#666' }}>(Servicio)</span>}
                      </td>
                      <td style={{ textAlign: 'center', paddingTop: '0.25rem', paddingBottom: '0.25rem', verticalAlign: 'top' }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: 'right', paddingTop: '0.25rem', paddingBottom: '0.25rem', verticalAlign: 'top' }}>
                        ${(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', marginBottom: '1rem' }}>
                <p style={{ margin: 0 }}><strong>Subtotal:</strong> ${completedSale.subtotal.toLocaleString()}</p>
                <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>TOTAL COBRADO:</strong> ${completedSale.total.toLocaleString()}</p>
              </div>

              <div style={{ borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                <p style={{ margin: 0 }}><strong>Método de pago:</strong> {completedSale.paymentMethod}</p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>¡Muchas gracias por su compra!</p>
                <p style={{ margin: 0 }}>Conserve este ticket para garantías.</p>
              </div>
            </div>

            {/* Receipt Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  const printContents = document.getElementById('receipt-print-area').innerHTML;
                  const originalContents = document.body.innerHTML;
                  
                  // Inject print styles & ticket contents to replace the whole view temporarily for clean system printing
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Imprimir Ticket - Go Mundo Tecno</title>
                        <style>
                          body { font-family: monospace; padding: 20px; color: #000; background: #fff; }
                          table { width: 100%; border-collapse: collapse; }
                          th, td { padding: 4px 0; }
                          tr { border-bottom: 1px dashed #000; }
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
                onClick={() => setIsReceiptOpen(false)}
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

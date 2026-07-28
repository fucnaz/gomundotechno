import React, { useState, useMemo } from 'react';
import { useSheet } from '../context/SheetContext';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  X,
  Sparkles,
  Info
} from 'lucide-react';

export default function Inventory() {
  const { products, saveProduct, deleteProduct, loading, showToast } = useSheet();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Accesorios');

  const categories = ['Accesorios', 'Celulares', 'Audio', 'Vidrios', 'Repuestos', 'Otros'];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleOpenCreate = () => {
    if (!isAdmin) {
      showToast('Solo los administradores pueden añadir productos al inventario', 'warning');
      return;
    }
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory('Accesorios');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    if (!isAdmin) {
      showToast('Solo los administradores pueden modificar productos del inventario', 'warning');
      return;
    }
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategory(product.category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!isAdmin) {
      showToast('Solo los administradores pueden eliminar productos', 'warning');
      return;
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${name}" de forma permanente del inventario?`)) {
      await deleteProduct(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !stock) {
      showToast('Completa todos los campos obligatorios', 'warning');
      return;
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Ingresa un precio válido', 'warning');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('Ingresa un stock válido', 'warning');
      return;
    }

    const productData = {
      id: editingProduct ? editingProduct.id : undefined,
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      stock: stockNum,
      category: category
    };

    const success = await saveProduct(productData);
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
            Inventario de Productos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Controla existencias, categorías y precios de tus productos tecnológicos.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
            <Plus size={18} strokeWidth={2.5} />
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Stats Quick Ribbon */}
      <div className="stats-grid">
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '0.5rem', borderRadius: '10px', color: 'var(--primary-cyan)' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Items</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{products.length}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 23, 68, 0.1)', padding: '0.5rem', borderRadius: '10px', color: 'var(--color-danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sin Stock</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{products.filter(p => p.stock <= 0).length}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 179, 0, 0.1)', padding: '0.5rem', borderRadius: '10px', color: 'var(--color-warning)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stock Bajo (&le; 5)</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{products.filter(p => p.stock > 0 && p.stock <= 5).length}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '0.5rem', borderRadius: '10px', color: 'var(--color-success)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Valor de Inventario</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '1rem' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar por código, nombre o descripción..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.6rem', paddingBottom: '0.6rem', fontSize: '0.875rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '180px', padding: '0.6rem 1rem', fontSize: '0.875rem' }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="Todos">Categorías: Todas</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Scrollable Table Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Nombre del Producto</th>
                <th style={{ padding: '0.75rem', width: '140px' }}>Categoría</th>
                <th style={{ padding: '0.75rem', width: '110px', textAlign: 'right' }}>Precio Unit.</th>
                <th style={{ padding: '0.75rem', width: '110px', textAlign: 'center' }}>Existencias</th>
                <th style={{ padding: '0.75rem', width: '110px', textAlign: 'center' }}>Estado</th>
                {isAdmin && <th style={{ padding: '0.75rem', width: '110px', textAlign: 'center' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron productos en el inventario.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const outOfStock = prod.stock <= 0;
                  const lowStock = prod.stock > 0 && prod.stock <= 5;
                  
                  return (
                    <tr 
                      key={prod.id} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        transition: 'background var(--transition-fast)'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{prod.description || 'Sin descripción'}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {prod.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-cyan)' }}>
                        ${Number(prod.price).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                        {prod.stock}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {outOfStock ? (
                          <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>Sin Stock</span>
                        ) : lowStock ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>Bajo Stock</span>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>Disponible</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              style={{
                                background: 'rgba(0, 242, 254, 0.05)',
                                border: '1px solid rgba(0, 242, 254, 0.1)',
                                borderRadius: '6px',
                                padding: '0.35rem',
                                color: 'var(--primary-cyan)',
                                cursor: 'pointer'
                              }}
                              title="Editar Producto"
                            >
                              <Edit2 size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              style={{
                                background: 'rgba(255, 23, 68, 0.05)',
                                border: '1px solid rgba(255, 23, 68, 0.1)',
                                borderRadius: '6px',
                                padding: '0.35rem',
                                color: 'var(--color-danger)',
                                cursor: 'pointer'
                              }}
                              title="Eliminar Producto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
            maxWidth: '500px',
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
              <Package size={22} color="var(--primary-cyan)" />
              {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Auriculares Inalámbricos Sony WH-1000XM4"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Auriculares circumaurales con cancelación activa de ruido"
                  className="form-input"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Precio Unitario ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="form-input"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stock Inicial *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="form-input"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Categoría *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }}></span> : editingProduct ? 'Actualizar' : 'Añadir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

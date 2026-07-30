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
  Info,
  Camera
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
  const [image, setImage] = useState('');

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 300, height: 300 }
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        const video = document.getElementById('camera-preview');
        if (video) {
          video.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      showToast('No se pudo acceder a la cámara o permisos denegados', 'danger');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-preview');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - minDim) / 2;
    const sy = (video.videoHeight - minDim) / 2;
    
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 150, 150);
    
    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
    setImage(compressedBase64);
    stopCamera();
  };

  const handleCloseForm = () => {
    stopCamera();
    setIsFormOpen(false);
  };

  const categories = ['Accesorios', 'Celulares', 'Audio', 'Vidrios', 'Repuestos', 'Otros'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setImage(compressedBase64);
      };
    };
  };

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
    setImage('');
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
    setImage(product.image || '');
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
      category: category,
      image: image
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Package size={20} color="var(--text-muted)" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prod.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{prod.description || 'Sin descripción'}</div>
                          </div>
                        </div>
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
              onClick={handleCloseForm}
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Imagen del Producto</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {image ? (
                      <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={28} color="var(--text-muted)" />
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById('product-image-file');
                          if (fileInput) fileInput.click();
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        Subir Archivo
                      </button>
                      
                      <button
                        type="button"
                        onClick={cameraActive ? stopCamera : startCamera}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Camera size={12} />
                        {cameraActive ? 'Apagar Cámara' : 'Tomar Foto'}
                      </button>

                      {image && !cameraActive && (
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', color: 'var(--color-danger)', borderColor: 'rgba(255,23,68,0.2)' }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      Las imágenes locales se optimizan automáticamente.
                    </span>
                  </div>
                  <input
                    type="file"
                    id="product-image-file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
                
                {cameraActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    <video
                      id="camera-preview"
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        height: '180px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        background: '#000'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderRadius: '6px' }}
                      >
                        Capturar Foto
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderRadius: '6px' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="O pega la URL de una imagen externa (ej. https://...)"
                  className="form-input"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  value={image}
                  onChange={e => setImage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={handleCloseForm} className="btn btn-secondary">
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

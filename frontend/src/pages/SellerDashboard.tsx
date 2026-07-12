import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  TrendingUp,
  ShoppingBag,
  ListFilter,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  Search,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './AdminDashboard.css'; // Reuse established Dark Brutalism CSS tokens

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  userId: string;
  shippingAddress: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export const SellerDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Search queries
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields (matching AdminDashboard patterns)
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Redirect non-sellers
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/seller/login');
      return;
    }
    if (user?.role !== 'SELLER') {
      navigate('/');
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Load stats, products, orders
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get<any>('/products/mine'),
        api.get<Order[]>('/orders/seller/mine'),
      ]);

      const prodArray = prodRes && Array.isArray(prodRes) ? prodRes : (prodRes?.content || []);
      setProducts(prodArray);
      setOrders(orderRes || []);
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'SELLER') {
      loadDashboardData();
    }
  }, [user]);

  // Handle Product CRUD (matching AdminDashboard patterns)
  const handleOpenProductModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      setProdName(product.name);
      setProdPrice(String(product.price));
      setProdCategory(product.category);
      setProdImageUrl(product.imageUrl);
      setProdDesc(product.description);
    } else {
      setProdName('');
      setProdPrice('');
      setProdCategory('');
      setProdImageUrl('');
      setProdDesc('');
    }
    setFormError('');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodCategory || !prodImageUrl || !prodDesc) {
      setFormError('Please fill in all fields.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    const productPayload = {
      name: prodName,
      price: parseFloat(prodPrice),
      category: prodCategory,
      imageUrl: prodImageUrl,
      description: prodDesc,
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productPayload);
      } else {
        await api.post('/products', productPayload);
      }
      setShowProductModal(false);
      loadDashboardData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${prodId}`);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Analytics helpers
  const calculateTotalEarnings = () => {
    return orders
      .filter((o) => o.status === 'PAID' || o.status === 'SHIPPED')
      .reduce((acc, o) => acc + o.totalAmount, 0);
  };

  const getFilteredProducts = () => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(prodSearch.toLowerCase())
    );
  };

  const getFilteredOrders = () => {
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.status.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingAddress.toLowerCase().includes(orderSearch.toLowerCase())
    );
  };

  if (isLoading || !isAuthenticated || user?.role !== 'SELLER') {
    return null;
  }

  return (
    <div className="admin-dashboard container">
      {/* Header */}
      <motion.header
        className="admin-header"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="admin-tag">
          <Store size={14} /> {user?.storeName || 'My Store'} storefront
        </span>
        <h1 className="display-title">Seller Hub</h1>
        <p className="muted-body">
          Manage your personal inventory catalog and monitor scoped order deliveries.
        </p>
      </motion.header>

      {/* Tabs Menu */}
      <div className="admin-tabs">
        {(['overview', 'products', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            className={`admin-tab-btn ${activeTab === tab ? 'admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loader">
          <Loader2 className="spinner" size={32} />
          <p>Syncing storefront nodes...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="overview-tab"
            >
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <TrendingUp size={20} />
                  </div>
                  <span className="stat-card__label">My Net Earnings</span>
                  <span className="stat-card__value">${calculateTotalEarnings().toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span className="stat-card__label">Store Orders</span>
                  <span className="stat-card__value">{orders.length} orders</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <ListFilter size={20} />
                  </div>
                  <span className="stat-card__label">My Listed Products</span>
                  <span className="stat-card__value">{products.length} items</span>
                </div>
              </div>

              {/* Action notice */}
              <div className="dashboard-sections">
                <div className="admin-card">
                  <h3 className="admin-card__title">Recent Store Orders</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Address</th>
                          <th>Earnings Share</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td className="font-mono" style={{ fontSize: '0.8rem' }}>{order.id.slice(0, 8)}...</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="truncate-text" style={{ maxWidth: '200px' }}>{order.shippingAddress}</td>
                            <td>${order.totalAmount.toFixed(2)}</td>
                            <td>
                              <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                              No orders received yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="products-tab"
            >
              <div className="tab-actions">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search my products..."
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenProductModal()}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredProducts().map((prod) => (
                        <tr key={prod.id}>
                          <td>
                            <div
                              className="admin-table__thumb"
                              style={{ backgroundImage: `url(${prod.imageUrl})` }}
                            />
                          </td>
                          <td>
                            <strong>{prod.name}</strong>
                            <p className="truncate-text" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '250px' }}>
                              {prod.description}
                            </p>
                          </td>
                          <td>{prod.category}</td>
                          <td>${prod.price.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-group">
                              <button
                                className="action-icon-btn"
                                onClick={() => handleOpenProductModal(prod)}
                                title="Edit Product"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="action-icon-btn action-icon-btn--danger"
                                onClick={() => handleDeleteProduct(prod.id)}
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getFilteredProducts().length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            No products found in inventory.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="orders-tab"
            >
              <div className="tab-actions">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by ID or Status..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-card">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Shipping Address</th>
                        <th>Items Scoped</th>
                        <th>Earnings Share</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredOrders().map((order) => (
                        <tr key={order.id}>
                          <td className="font-mono" style={{ fontSize: '0.8rem' }}>{order.id}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="truncate-text" style={{ maxWidth: '250px' }}>{order.shippingAddress}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {order.items.map((it) => (
                                <span key={it.id} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  • Product: {it.productId.slice(0, 8)}... (x{it.quantity})
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>${order.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                              <Lock size={12} /> Admin-Only Action
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getFilteredOrders().length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                            No orders found matching search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* PRODUCT CREATION/EDIT MODAL (matching AdminDashboard patterns) */}
      <AnimatePresence>
        {showProductModal && (
          <div className="modal-backdrop">
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
            >
              <div className="admin-modal__header">
                <h3>{editingProduct ? 'Edit Catalog Product' : 'Add New Product'}</h3>
                <button className="close-btn" onClick={() => setShowProductModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="admin-modal__form">
                {formError && (
                  <div className="admin-modal__error">
                    <AlertTriangle size={14} />
                    {formError}
                  </div>
                )}

                <div className="form-field">
                  <label>Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <input
                      type="text"
                      required
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Image URL</label>
                  <input
                    type="url"
                    required
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    rows={4}
                    required
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                  />
                </div>

                <div className="admin-modal__footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowProductModal(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                    {formSubmitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

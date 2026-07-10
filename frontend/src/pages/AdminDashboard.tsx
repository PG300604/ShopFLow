import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  ListFilter,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Megaphone,
  Loader2,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './AdminDashboard.css';

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
  status: string; // CREATED, PENDING_PAYMENT, PAID, FAILED, CANCELLED, SHIPPED
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface Promotion {
  id: string;
  productId: string;
  title: string;
  tagLine: string;
  description: string;
  imageUrl: string;
  status: string; // PENDING, APPROVED, REJECTED
  sellerName: string;
  createdAt: string;
}

type TabType = 'overview' | 'products' | 'orders' | 'promotions';

export const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Search queries
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'ADMIN' && user?.email !== 'admin@shopflow.com') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Load stats, products, orders, promotions
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, promoRes] = await Promise.all([
        api.get<any>('/products?size=100'),
        api.get<any>('/orders'),
        api.get<Promotion[]>('/products/promotions'),
      ]);

      const prodArray = prodRes && Array.isArray(prodRes) ? prodRes : (prodRes?.content || []);
      setProducts(prodArray);
      
      const orderArray = orderRes && Array.isArray(orderRes) ? orderRes : (orderRes?.content || []);
      setOrders(orderArray);
      
      setPromotions(promoRes || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.email === 'admin@shopflow.com') {
      loadDashboardData();
    }
  }, [user]);

  // Handle Product CRUD
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

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/admin-status`, { status: newStatus });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Handle Promotion Status Update
  const handleUpdatePromoStatus = async (promoId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/products/promotions/${promoId}/status`, { status });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to update promotion status:', err);
    }
  };

  // Analytics helper calculations
  const calculateTotalSales = () => {
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

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.email !== 'admin@shopflow.com')) {
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
          <ShieldCheck size={14} /> Control Panel
        </span>
        <h1 className="display-title">Platform Dashboard</h1>
        <p className="muted-body">
          Manage system inventory, monitor transactions, and authorize promotional slider banners.
        </p>
      </motion.header>

      {/* Tabs Menu */}
      <div className="admin-tabs">
        {(['overview', 'products', 'orders', 'promotions'] as TabType[]).map((tab) => (
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
          <p>Syncing dashboard nodes...</p>
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
                  <span className="stat-card__label">Total Revenue</span>
                  <span className="stat-card__value">${calculateTotalSales().toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span className="stat-card__label">Transactions</span>
                  <span className="stat-card__value">{orders.length} orders</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <ListFilter size={20} />
                  </div>
                  <span className="stat-card__label">Active Products</span>
                  <span className="stat-card__value">{products.length} items</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    <Megaphone size={20} />
                  </div>
                  <span className="stat-card__label">Pending Ads</span>
                  <span className="stat-card__value">
                    {promotions.filter((p) => p.status === 'PENDING').length} requests
                  </span>
                </div>
              </div>

              {/* Recent Alerts & Logs */}
              <div className="dashboard-sections">
                <div className="admin-card">
                  <h3 className="admin-card__title">Recent Platform Orders</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Address</th>
                          <th>Total</th>
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
                    placeholder="Search catalog products..."
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
                        <th>Total</th>
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
                          <td>${order.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-group">
                              {order.status === 'PAID' && (
                                <button
                                  className="admin-fulfill-btn"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                                >
                                  Mark Shipped
                                </button>
                              )}
                              {order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && (
                                <button
                                  className="admin-cancel-btn"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROMOTIONS TAB */}
          {activeTab === 'promotions' && (
            <motion.div
              key="promotions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="promotions-tab"
            >
              <div className="admin-card">
                <h3 className="admin-card__title">Pending Ads Approvals</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Title / Tagline</th>
                        <th>Description</th>
                        <th>Seller Name</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotions.map((promo) => (
                        <tr key={promo.id}>
                          <td>
                            <div
                              className="admin-table__thumb"
                              style={{ backgroundImage: `url(${promo.imageUrl})` }}
                            />
                          </td>
                          <td>
                            <strong>{promo.title}</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {promo.tagLine}
                            </p>
                          </td>
                          <td className="truncate-text" style={{ maxWidth: '250px' }}>{promo.description}</td>
                          <td>{promo.sellerName}</td>
                          <td>
                            <span className={`status-pill status-pill--${promo.status.toLowerCase()}`}>
                              {promo.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {promo.status === 'PENDING' && (
                              <div className="table-actions-group" style={{ justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleUpdatePromoStatus(promo.id, 'APPROVED')}
                                  className="action-icon-btn"
                                  style={{ color: 'var(--color-accent)' }}
                                  title="Approve Banner"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdatePromoStatus(promo.id, 'REJECTED')}
                                  className="action-icon-btn action-icon-btn--danger"
                                  title="Reject Request"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* PRODUCT CREATION/EDIT MODAL */}
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

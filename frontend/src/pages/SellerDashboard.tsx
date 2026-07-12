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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './AdminDashboard.css'; // Reuse premium admin dashboard styles

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  sellerId?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  sellerId: string;
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });

  // Search Filter States
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Redirect non-sellers
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/seller/login');
      return;
    }
    if (user?.role !== 'SELLER') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Load seller dashboard data
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

  // Handle Product CRUD
  const handleOpenProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProdForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        imageUrl: product.imageUrl,
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        imageUrl: '',
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodForm.name,
        description: prodForm.description,
        price: parseFloat(prodForm.price),
        category: prodForm.category,
        imageUrl: prodForm.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600',
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductModal(false);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please check input formats.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is permanent.')) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product.');
    }
  };

  // Metrics
  const totalSales = orders
    .filter((o) => o.status === 'PAID' || o.status === 'SHIPPED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'PAID').length;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.shippingAddress.toLowerCase().includes(orderSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 className="admin-loading__spinner" size={40} />
        <p>Loading Seller Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Store size={22} className="admin-sidebar__brand-icon" />
          <div>
            <h1 className="admin-sidebar__brand-title">{user?.storeName || 'My Store'}</h1>
            <p className="admin-sidebar__brand-role">Seller Partner</p>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            onClick={() => setActiveTab('overview')}
            className={`admin-sidebar__nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <TrendingUp size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`admin-sidebar__nav-item ${activeTab === 'products' ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            My Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`admin-sidebar__nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ListFilter size={18} />
            My Orders Scoped
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-content-header">
          <div className="admin-content-header__title-group">
            <h2 className="admin-content-header__title">
              {activeTab === 'overview' && 'Store Performance'}
              {activeTab === 'products' && 'Product Inventory'}
              {activeTab === 'orders' && 'Order Management'}
            </h2>
            <p className="admin-content-header__subtitle">
              Manage your ShopFlow storefront and client deliveries
            </p>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="admin-overview-grid">
            {/* Stat Cards */}
            <div className="admin-stat-cards">
              <motion.div className="admin-stat-card" whileHover={{ y: -4 }}>
                <span className="admin-stat-card__label">Total Revenue</span>
                <span className="admin-stat-card__value">${totalSales.toFixed(2)}</span>
                <span className="admin-stat-card__sub">From completed sales</span>
              </motion.div>

              <motion.div className="admin-stat-card" whileHover={{ y: -4 }}>
                <span className="admin-stat-card__label">Product Count</span>
                <span className="admin-stat-card__value">{products.length}</span>
                <span className="admin-stat-card__sub">Active in catalog</span>
              </motion.div>

              <motion.div className="admin-stat-card" whileHover={{ y: -4 }}>
                <span className="admin-stat-card__label">Pending Delivery</span>
                <span className="admin-stat-card__value">{pendingOrdersCount}</span>
                <span className="admin-stat-card__sub">Awaiting shipment</span>
              </motion.div>
            </div>

            {/* Notification alert */}
            {pendingOrdersCount > 0 && (
              <div className="admin-banner-alert" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '1.5rem' }}>
                <AlertTriangle color="var(--color-accent)" size={20} />
                <div>
                  <h4 style={{ fontWeight: 600 }}>Action Required</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    You have {pendingOrdersCount} order(s) waiting to be shipped. Please check the orders tab.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === 'products' && (
          <div className="admin-products-view">
            <div className="admin-table-actions">
              <div className="admin-search-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
              </div>
              <button onClick={() => handleOpenProductModal(null)} className="admin-btn-primary">
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-table-product-cell">
                          <img src={product.imageUrl} alt={product.name} />
                          <div>
                            <div className="product-name">{product.name}</div>
                            <div className="product-id">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--neutral">{product.category}</span>
                      </td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <div className="admin-table-actions-cell">
                          <button onClick={() => handleOpenProductModal(product)} className="btn-icon" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="btn-icon btn-icon--danger" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        No products found. Add your first product to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div className="admin-orders-view">
            <div className="admin-table-actions">
              <div className="admin-search-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search orders by ID or address..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Shipping Details</th>
                    <th>Your Share Items</th>
                    <th>Status</th>
                    <th>Total Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="admin-font-mono">{order.id}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{order.shippingAddress}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {order.items.map((it) => (
                            <div key={it.id} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              • Product ID: {it.productId} (x{it.quantity} @ ${it.unitPrice})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${
                          order.status === 'PAID' || order.status === 'SHIPPED' ? 'success' :
                          order.status === 'PENDING_PAYMENT' ? 'warning' : 'danger'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>${order.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                        No orders received yet. Once customers purchase your items, they will show up here!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <header className="admin-modal-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowProductModal(false)} className="btn-close">
                  <X size={18} />
                </button>
              </header>

              <form onSubmit={handleProductSubmit} className="admin-modal-form">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      required
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={prodForm.imageUrl}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    required
                    rows={4}
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  />
                </div>

                <footer className="admin-modal-footer">
                  <button type="button" onClick={() => setShowProductModal(false)} className="admin-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </footer>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

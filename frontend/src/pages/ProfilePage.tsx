import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Package,
  LogOut,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './ProfilePage.css';

interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  productName?: string;
}

interface Order {
  id: number;
  status: string;
  shippingAddress: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, updateAddress } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user address
  useEffect(() => {
    if (user?.defaultShippingAddress) {
      setAddress(user.defaultShippingAddress);
    }
  }, [user]);

  // Load order history
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const res = await api.get<Order[]>('/orders/history');
        setOrders(res);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const handleSaveAddress = async () => {
    if (!address.trim()) return;
    setSavingAddress(true);
    try {
      await updateAddress(address.trim());
      setAddressSaved(true);
      setTimeout(() => setAddressSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="profile-page">
      {/* Page Header */}
      <motion.header
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="profile-header__title">My Profile</h1>
        <p className="profile-header__subtitle">
          Manage your account information and view your order archive
        </p>
      </motion.header>

      <div className="profile-layout">
        {/* Left: Account Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="profile-card">
            <div className="profile-card__avatar">
              <User size={28} strokeWidth={1.5} />
            </div>
            <h2 className="profile-card__section-title">Account Details</h2>
            <div className="profile-card__info">
              <div>
                <span className="profile-card__field-label">
                  <User
                    size={12}
                    strokeWidth={1.5}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: '0.3rem',
                    }}
                  />
                  Full Name
                </span>
                <span className="profile-card__field-value">{user.name}</span>
              </div>
              <div>
                <span className="profile-card__field-label">
                  <Mail
                    size={12}
                    strokeWidth={1.5}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: '0.3rem',
                    }}
                  />
                  Email Address
                </span>
                <span className="profile-card__field-value">{user.email}</span>
              </div>
              <div>
                <span className="profile-card__field-label">Role</span>
                <span className="profile-card__field-value">{user.role}</span>
              </div>
            </div>

            {/* Address */}
            <div className="profile-address">
              <h3 className="profile-address__title">
                <MapPin
                  size={14}
                  strokeWidth={1.5}
                  style={{ verticalAlign: 'middle', marginRight: '0.3rem' }}
                />
                Shipping Address
              </h3>
              <textarea
                className="profile-address__input"
                placeholder="Enter your default shipping address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button
                className="profile-address__save-btn"
                onClick={handleSaveAddress}
                disabled={savingAddress || !address.trim()}
              >
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
              {addressSaved && (
                <motion.div
                  className="profile-address__success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle size={14} strokeWidth={1.5} />
                  Address saved
                </motion.div>
              )}
            </div>

            {/* Logout */}
            <button className="profile-logout-btn" onClick={handleLogout}>
              <LogOut
                size={14}
                strokeWidth={1.5}
                style={{ verticalAlign: 'middle', marginRight: '0.4rem' }}
              />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Right: Order History */}
        <motion.div
          className="profile-orders"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="profile-orders__title">
            <Package size={18} strokeWidth={1.5} />
            Order History
          </h2>

          {ordersLoading ? (
            <div className="profile-orders__loading">
              <div className="detail-spinner" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="profile-orders__empty">
              <ShoppingBag
                size={40}
                strokeWidth={1}
                className="profile-orders__empty-icon"
              />
              <p className="profile-orders__empty-text">
                You haven't placed any orders yet.
              </p>
            </div>
          ) : (
            <div className="profile-orders__list">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="order-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                >
                  <div className="order-card__header">
                    <div>
                      <span className="order-card__id">
                        Order #{order.id}
                      </span>
                      <span className="order-card__date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="order-card__status">{order.status}</span>
                  </div>

                  <ul className="order-card__items">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.productName || `Product #${item.productId}`} × {item.quantity} — ${item.unitPrice.toFixed(2)}
                      </li>
                    ))}
                  </ul>

                  <div className="order-card__footer">
                    <span className="order-card__total-label">Total paid</span>
                    <span className="order-card__total-value">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

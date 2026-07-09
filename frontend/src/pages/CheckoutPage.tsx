import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  MapPin,
  Trash2,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { items, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill shipping address from user profile
  useEffect(() => {
    if (user?.defaultShippingAddress) {
      setShippingAddress(user.defaultShippingAddress);
    }
  }, [user]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0),
    [items],
  );

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setError('');
    setPlacing(true);

    try {
      await api.post('/orders/checkout', {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.productPrice,
        })),
        shippingAddress: shippingAddress.trim(),
      });
      clearCart();
      setOrderPlaced(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to place order. Please try again.';
      setError(message);
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuthenticated) return null;

  // Success state
  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <motion.div
          className="checkout-success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="checkout-success__icon">
            <CheckCircle size={40} strokeWidth={1.5} />
          </div>
          <h2 className="checkout-success__title">Order Confirmed!</h2>
          <p className="checkout-success__text">
            Thank you for your purchase. Your order has been placed
            successfully and will be shipped to your address shortly.
          </p>
          <Link to="/" className="checkout-success__link">
            Continue Shopping
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <motion.header
          className="checkout-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="checkout-header__title">Checkout</h1>
          <p className="checkout-header__subtitle">
            Review and place your order
          </p>
        </motion.header>
        <motion.div
          className="checkout-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ShoppingBag
            size={48}
            strokeWidth={1}
            className="checkout-empty__icon"
          />
          <h3 className="checkout-empty__title">Your cart is empty</h3>
          <p className="checkout-empty__text">
            Add some items to your cart before checking out.
          </p>
          <Link to="/" className="checkout-empty__link">
            Browse Products
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <motion.header
        className="checkout-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="checkout-header__title">Checkout</h1>
        <p className="checkout-header__subtitle">
          Review your items and complete your purchase
        </p>
      </motion.header>

      <div className="checkout-layout">
        {/* Left: Cart Items & Shipping */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="checkout-items__title">
            <Package size={18} strokeWidth={1.5} />
            Your Items ({items.length})
          </h2>
          <div className="checkout-items">
            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                className="checkout-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="checkout-item__image"
                  />
                )}
                <div className="checkout-item__info">
                  <div className="checkout-item__name">{item.productName}</div>
                  <div className="checkout-item__meta">Qty: {item.quantity}</div>
                </div>
                <span className="checkout-item__price">
                  ${(item.productPrice * item.quantity).toFixed(2)}
                </span>
                <button
                  className="checkout-item__remove"
                  onClick={() => removeItem(item.productId)}
                  title="Remove item"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="checkout-shipping">
            <h3 className="checkout-shipping__title">
              <MapPin size={16} strokeWidth={1.5} />
              Shipping Address
            </h3>
            <textarea
              className="checkout-shipping__input"
              placeholder="Enter your full shipping address..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Right: Order Summary */}
        <motion.div
          className="checkout-summary"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="checkout-summary__title">Order Summary</h2>

          <div className="checkout-summary__rows">
            {items.map((item) => (
              <div key={item.productId} className="checkout-summary__row">
                <span className="checkout-summary__row-label">
                  {item.productName} × {item.quantity}
                </span>
                <span className="checkout-summary__row-value">
                  ${(item.productPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-summary__rows">
            <div className="checkout-summary__row">
              <span className="checkout-summary__row-label">Subtotal</span>
              <span className="checkout-summary__row-value">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="checkout-summary__row">
              <span className="checkout-summary__row-label">Shipping</span>
              <span className="checkout-summary__shipping">Complimentary</span>
            </div>
          </div>

          <div className="checkout-summary__total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <button
            className="checkout-place-btn"
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? (
              'Placing Order...'
            ) : (
              <>
                Place Order
                <ArrowRight size={16} strokeWidth={1.5} />
              </>
            )}
          </button>

          {error && (
            <motion.div
              className="checkout-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AlertCircle size={16} strokeWidth={1.5} />
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

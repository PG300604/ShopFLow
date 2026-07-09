import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Package, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

export const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, itemCount, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={toggleCart}
          />

          {/* Drawer */}
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <h2>
                <ShoppingBag size={18} strokeWidth={1.5} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Cart ({itemCount})
              </h2>
              <button className="cart-drawer-close" onClick={toggleCart} aria-label="Close cart">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="cart-drawer-items">
              {items.length === 0 ? (
                <div className="cart-drawer-empty">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      className="cart-item"
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="cart-item-image"
                        />
                      ) : (
                        <div className="cart-item-image-placeholder">
                          <Package size={20} strokeWidth={1.5} />
                        </div>
                      )}

                      <div className="cart-item-details">
                        <div className="cart-item-name">{item.productName}</div>
                        <div className="cart-item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span className="cart-item-price">
                            {formatPrice(item.productPrice * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-drawer-total">
                  <span className="cart-drawer-total-label">Total</span>
                  <span className="cart-drawer-total-amount">{formatPrice(totalPrice)}</span>
                </div>
                <button className="cart-drawer-checkout" onClick={handleCheckout}>
                  Proceed to Checkout
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

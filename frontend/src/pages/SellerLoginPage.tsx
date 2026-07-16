import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export const SellerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, registerSeller } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else if (user.role === 'ADMIN' || user.email === 'admin@shopflow.com') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBypassSeller = async () => {
    setError('');
    setLoading(true);
    const bypassEmail = 'seller_bypass@shopflow.com';
    const bypassPassword = 'password123';
    const bypassName = 'ShopFlow Seller';
    const storeName = 'Premium Store';

    try {
      await login(bypassEmail, bypassPassword);
      navigate('/seller/dashboard');
    } catch (err: any) {
      try {
        await registerSeller(bypassName, bypassEmail, bypassPassword, storeName);
        navigate('/seller/dashboard');
      } catch (regErr: any) {
        setError('Seller bypass failed: ' + (regErr?.message || 'Could not register/login'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <header className="login-header">
          <div className="login-header__icon">
            <Store size={22} strokeWidth={1.5} />
          </div>
          <h2 className="login-header__title">Seller Dashboard</h2>
          <p className="login-header__subtitle">
            Sign in to manage your store
          </p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AlertCircle size={16} strokeWidth={1.5} />
              {error}
            </motion.div>
          )}

          <div className="login-field">
            <input
              id="login-email"
              type="email"
              className="login-field__input"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Mail
              size={16}
              strokeWidth={1.5}
              className="login-field__icon"
            />
            <label htmlFor="login-email" className="login-field__label">
              Seller Email Address
            </label>
          </div>

          <div className="login-field">
            <input
              id="login-password"
              type="password"
              className="login-field__input"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Lock
              size={16}
              strokeWidth={1.5}
              className="login-field__icon"
            />
            <label htmlFor="login-password" className="login-field__label">
              Password
            </label>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In as Seller'}
          </button>
        </form>

        <div className="login-divider" style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></span>
          <span style={{ padding: '0 0.75rem' }}>or</span>
          <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></span>
        </div>

        <button
          type="button"
          onClick={handleBypassSeller}
          disabled={loading}
          className="login-bypass-btn"
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            borderRadius: '4px',
            border: '1px dashed var(--color-border)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-active)';
            e.currentTarget.style.color = 'var(--color-active)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          Bypass: Seller
        </button>

        <div className="login-footer" style={{ marginTop: '1.5rem' }}>
          Interested in selling?{' '}
          <Link to="/seller/register" className="login-footer__link">
            Register your store
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

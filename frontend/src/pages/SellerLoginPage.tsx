import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Store, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export const SellerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
        err?.message ||
        'Invalid email or password. Please use seller@shopflow.com with password: password123';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillSeller = () => {
    setEmail('seller@shopflow.com');
    setPassword('password123');
    setError('');
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

        <div style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={handleQuickFillSeller}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <KeyRound size={13} />
            Fill Seller Credentials (seller@shopflow.com)
          </button>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            Password: <strong style={{ color: 'var(--color-active)' }}>password123</strong>
          </span>
        </div>

        <div className="login-footer" style={{ marginTop: '1.25rem' }}>
          Interested in selling?{' '}
          <Link to="/seller/register" className="login-footer__link">
            Register your store
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

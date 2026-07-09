import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
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

  const handleGoogleClick = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError('Google authentication failed. Please try again.');
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
            <LogIn size={22} strokeWidth={1.5} />
          </div>
          <h2 className="login-header__title">Welcome Back</h2>
          <p className="login-header__subtitle">
            Sign in to your ShopFlow account
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
              Email Address
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider" style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></span>
          <span style={{ padding: '0 0.75rem' }}>or</span>
          <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></span>
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="login-google-btn"
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--color-active)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            e.currentTarget.style.borderColor = 'var(--color-active)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'block' }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.85 2.69-6.57z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71h-3v2.3C2.43 16.5 5.42 18 9 18z"/>
            <path fill="#FBBC05" d="M3.95 10.72A10.8 10.8 0 0 1 3.5 9c0-.6.1-1.17.28-1.72v-2.3h-3a9 9 0 0 0 0 8.04l3-2.3z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.43 0 9 0 5.42 0 2.43 1.5.94 4.18l3 2.3C4.66 4.66 6.65 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="login-footer" style={{ marginTop: '1.5rem' }}>
          New to ShopFlow?{' '}
          <Link to="/register" className="login-footer__link">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

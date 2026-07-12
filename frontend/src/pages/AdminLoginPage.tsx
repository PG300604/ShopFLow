import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export const AdminLoginPage: React.FC = () => {
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
      if (user.role === 'ADMIN' || user.email === 'admin@shopflow.com') {
        navigate('/admin/dashboard');
      } else if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid admin credentials. Please try again.';
      setError(message);
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
          <div className="login-header__icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}>
            <ShieldAlert size={22} strokeWidth={1.5} />
          </div>
          <h2 className="login-header__title">Admin Terminal</h2>
          <p className="login-header__subtitle">
            Sign in to access global admin dashboard
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
              Admin Email Address
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
            style={{ backgroundColor: 'rgb(239, 68, 68)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(220, 38, 38)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(239, 68, 68)';
            }}
          >
            {loading ? 'Entering Terminal...' : 'Sign In to Terminal'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

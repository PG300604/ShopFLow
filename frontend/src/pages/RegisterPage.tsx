import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await register(name.trim(), email, password);
      navigate('/');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <header className="register-header">
          <div className="register-header__icon">
            <UserPlus size={22} strokeWidth={1.5} />
          </div>
          <h2 className="register-header__title">Create Account</h2>
          <p className="register-header__subtitle">
            Join the ShopFlow premium network
          </p>
        </header>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              className="register-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AlertCircle size={16} strokeWidth={1.5} />
              {error}
            </motion.div>
          )}

          {/* Name */}
          <div
            className={`register-field ${
              fieldErrors.name ? 'register-field--error' : ''
            }`}
          >
            <input
              id="reg-name"
              type="text"
              className="register-field__input"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((p) => ({ ...p, name: '' }));
              }}
              autoComplete="name"
            />
            <User
              size={16}
              strokeWidth={1.5}
              className="register-field__icon"
            />
            <label htmlFor="reg-name" className="register-field__label">
              Full Name
            </label>
            {fieldErrors.name && (
              <span className="register-field__hint">{fieldErrors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="register-field">
            <input
              id="reg-email"
              type="email"
              className="register-field__input"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Mail
              size={16}
              strokeWidth={1.5}
              className="register-field__icon"
            />
            <label htmlFor="reg-email" className="register-field__label">
              Email Address
            </label>
          </div>

          {/* Password */}
          <div
            className={`register-field ${
              fieldErrors.password ? 'register-field--error' : ''
            }`}
          >
            <input
              id="reg-password"
              type="password"
              className="register-field__input"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((p) => ({ ...p, password: '' }));
              }}
              autoComplete="new-password"
            />
            <Lock
              size={16}
              strokeWidth={1.5}
              className="register-field__icon"
            />
            <label htmlFor="reg-password" className="register-field__label">
              Password
            </label>
            {fieldErrors.password && (
              <span className="register-field__hint">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div
            className={`register-field ${
              fieldErrors.confirmPassword ? 'register-field--error' : ''
            }`}
          >
            <input
              id="reg-confirm"
              type="password"
              className="register-field__input"
              placeholder="Confirm"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              autoComplete="new-password"
            />
            <ShieldCheck
              size={16}
              strokeWidth={1.5}
              className="register-field__icon"
            />
            <label htmlFor="reg-confirm" className="register-field__label">
              Confirm Password
            </label>
            {fieldErrors.confirmPassword && (
              <span className="register-field__hint">
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          Already have an account?{' '}
          <Link to="/login" className="register-footer__link">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

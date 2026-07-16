import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sun, Moon, Monitor, ShoppingBag, User, LogOut, Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val)}`);
    } else {
      navigate('/');
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const renderThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} strokeWidth={1.5} />;
      case 'dark':
        return <Moon size={18} strokeWidth={1.5} />;
      case 'system':
        return <Monitor size={18} strokeWidth={1.5} />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="glass-header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.1em' }}>
          SHOPFLOW
        </Link>

        {/* Header Search Bar */}
        <div className="header-search-container">
          <div className="header-search">
            <Search size={16} className="header-search-icon" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Actions (User, Cart, Theme, Admin, Seller) */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {/* Sell on ShopFlow link for guest users or customers */}
          {(!isAuthenticated || (user && user.role !== 'SELLER' && user.role !== 'ADMIN' && user.email !== 'admin@shopflow.com')) && (
            <Link
              to="/seller/register"
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                marginRight: '0.5rem',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-active)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              Sell on ShopFlow
            </Link>
          )}

          {/* Admin link for easy bypass testing */}
          {!isAuthenticated && (
            <Link
              to="/admin/login"
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                marginRight: '0.5rem',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-active)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              Admin
            </Link>
          )}

          {/* Admin Links */}
          {isAuthenticated && (user?.role === 'ADMIN' || user?.email === 'admin@shopflow.com') && (
            <div style={{ display: 'flex', gap: '1rem', marginRight: '0.5rem' }}>
              <Link to="/admin/dashboard" style={{ color: 'var(--color-text-main)', fontSize: '0.85rem', fontWeight: 600 }}>Admin</Link>
              <Link to="/promotions" style={{ color: 'var(--color-text-main)', fontSize: '0.85rem', fontWeight: 600 }}>Promotions</Link>
            </div>
          )}

          {/* Seller Links */}
          {isAuthenticated && user?.role === 'SELLER' && (
            <div style={{ display: 'flex', gap: '1rem', marginRight: '0.5rem' }}>
              <Link to="/seller/dashboard" style={{ color: 'var(--color-text-main)', fontSize: '0.85rem', fontWeight: 600 }}>Seller Dashboard</Link>
            </div>
          )}
          <button
            onClick={toggleTheme}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--color-active)'
            }}
            title={`Active Theme: ${theme}. Click to change.`}
          >
            {renderThemeIcon()}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                style={{
                  color: 'var(--color-active)',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                <User size={18} strokeWidth={1.5} />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--color-active)',
                }}
                title="Logout"
              >
                <LogOut size={18} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={{
                color: 'var(--color-active)',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <User size={18} strokeWidth={1.5} />
              <span>Login</span>
            </Link>
          )}

          {user?.role !== 'ADMIN' && (
            <button
              onClick={toggleCart}
              style={{
                color: 'var(--color-active)',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                background: 'none',
                border: 'none',
              }}
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: 'var(--color-accent)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

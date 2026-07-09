import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { CartDrawer } from './CartDrawer';

export const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <CartDrawer />
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
      <footer style={{
        padding: '3rem 0',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)',
        backgroundColor: 'var(--bg-secondary)',
        marginTop: 'auto'
      }}>
        <div className="container">
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SHOPFLOW</p>
          <p>&copy; {new Date().getFullYear()} ShopFlow Premium. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

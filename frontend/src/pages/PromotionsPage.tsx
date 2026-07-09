import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Megaphone,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './PromotionsPage.css';

interface Product {
  id: number;
  name: string;
  category: string;
}

interface Promotion {
  id: string;
  productId: string;
  title: string;
  tagLine: string;
  description: string;
  imageUrl: string;
  status: string; // PENDING, APPROVED, REJECTED
  sellerName: string;
  createdAt: string;
}

export const PromotionsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [title, setTitle] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load products and promotions on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [prodList, promoList] = await Promise.all([
          api.get<Product[]>('/products'),
          api.get<Promotion[]>('/products/promotions'),
        ]);
        setProducts(prodList);
        setPromotions(promoList);
      } catch (err) {
        console.error('Failed to load promotions details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !title || !tagLine || !description || !imageUrl) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/products/promotions', {
        productId: selectedProductId,
        title,
        tagLine,
        description,
        imageUrl,
        sellerName: user?.name || 'ShopFlow Seller',
        sellerId: user?.id,
      });

      setSuccess(true);
      setTitle('');
      setTagLine('');
      setDescription('');
      setImageUrl('');
      setSelectedProductId('');

      // Refresh list
      const updated = await api.get<Promotion[]>('/products/promotions');
      setPromotions(updated);
    } catch (err: any) {
      setError('Failed to submit promotion request. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (promoId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/products/promotions/${promoId}/status`, { status });
      // Refresh list
      const updated = await api.get<Promotion[]>('/products/promotions');
      setPromotions(updated);
    } catch (err) {
      console.error('Failed to update promotion status:', err);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin@shopflow.com';

  if (!isAuthenticated || !user) return null;

  return (
    <div className="promotions-page container">
      {/* Page Header */}
      <motion.header
        className="promotions-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="promotions-header__tag">
          {isAdmin ? 'Admin Console' : 'Seller Hub'}
        </span>
        <h1 className="display-title">
          {isAdmin ? 'Banner Management' : 'Promote Your Products'}
        </h1>
        <p className="muted-body">
          {isAdmin
            ? 'Review, customize, and approve banner promotions submitted by sellers to display on the home page slider.'
            : 'Request custom banner slots on the landing page slider to display and promote your designs.'}
        </p>
      </motion.header>

      <div className="promotions-content">
        {loading ? (
          <div className="promotions-loading">Loading promotion center...</div>
        ) : (
          <div className="promotions-grid">
            {/* Left Column: Form (only for Sellers/Customers) or Admin Stats */}
            {!isAdmin ? (
              <motion.div
                className="promotions-card promotions-form-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="promotions-card__title">
                  <PlusCircle size={18} strokeWidth={1.5} />
                  New Promotion Request
                </h2>

                <form onSubmit={handleSubmitRequest} className="promotions-form">
                  {error && (
                    <div className="promotions-error">
                      <AlertCircle size={16} strokeWidth={1.5} />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="promotions-success">
                      <CheckCircle size={16} strokeWidth={1.5} />
                      Promotion request submitted successfully for approval!
                    </div>
                  )}

                  <div className="promotions-form__field">
                    <label>Select Product</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a product --</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} [{prod.category}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="promotions-form__field">
                    <label>Tag Line (e.g. New Arrival, Limited Edition)</label>
                    <input
                      type="text"
                      placeholder="e.g. Curated Knitwear"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                      required
                    />
                  </div>

                  <div className="promotions-form__field">
                    <label>Promotion Title (Bold banner text)</label>
                    <input
                      type="text"
                      placeholder="e.g. Sculpted Comfort & Geometric Form"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="promotions-form__field">
                    <label>Banner Image URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="promotions-form__field">
                    <label>Description (Subtext overlay)</label>
                    <textarea
                      rows={3}
                      placeholder="A short, compelling description of your product..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary promotions-form__submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                className="promotions-card promotions-admin-stats"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="promotions-card__title">
                  <ShieldCheck size={18} strokeWidth={1.5} />
                  System Overview
                </h2>
                <div className="promotions-stats">
                  <div className="promotions-stat">
                    <span className="promotions-stat__number">
                      {promotions.filter((p) => p.status === 'APPROVED').length}
                    </span>
                    <span className="promotions-stat__label">Active Banners</span>
                  </div>
                  <div className="promotions-stat">
                    <span className="promotions-stat__number">
                      {promotions.filter((p) => p.status === 'PENDING').length}
                    </span>
                    <span className="promotions-stat__label">Pending Review</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Right Column: Listing */}
            <motion.div
              className="promotions-card promotions-list-wrap"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="promotions-card__title">
                <Megaphone size={18} strokeWidth={1.5} />
                {isAdmin ? 'All Request Submissions' : 'Your Promotion History'}
              </h2>

              <div className="promotions-list">
                {promotions.length === 0 ? (
                  <div className="promotions-empty">
                    <Megaphone size={32} strokeWidth={1} />
                    <p>No banner promotions found.</p>
                  </div>
                ) : (
                  promotions.map((promo) => {
                    const matchedProduct = products.find((p) => String(p.id) === String(promo.productId));
                    return (
                      <div key={promo.id} className="promotions-item">
                        <div className="promotions-item__left">
                          <div
                            className="promotions-item__thumb"
                            style={{ backgroundImage: `url(${promo.imageUrl})` }}
                          >
                            {!promo.imageUrl && <FileImage size={20} />}
                          </div>
                          <div className="promotions-item__info">
                            <span className="promotions-item__tag">{promo.tagLine}</span>
                            <h3 className="promotions-item__title-text">{promo.title}</h3>
                            <p className="promotions-item__desc">{promo.description}</p>
                            <div className="promotions-item__meta">
                              <span>Seller: {promo.sellerName}</span>
                              {matchedProduct && (
                                <span className="promotions-item__product-link">
                                  Linked Product: <strong>{matchedProduct.name}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="promotions-item__right">
                          {/* Status Badge */}
                          <div className={`promotions-status promotions-status--${promo.status.toLowerCase()}`}>
                            {promo.status === 'PENDING' && <Clock size={14} />}
                            {promo.status === 'APPROVED' && <CheckCircle size={14} />}
                            {promo.status === 'REJECTED' && <XCircle size={14} />}
                            <span>{promo.status}</span>
                          </div>

                          {/* Admin Actions */}
                          {isAdmin && promo.status === 'PENDING' && (
                            <div className="promotions-actions">
                              <button
                                onClick={() => handleUpdateStatus(promo.id, 'APPROVED')}
                                className="promotions-action-btn promotions-action-btn--approve"
                                title="Approve and make live"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(promo.id, 'REJECTED')}
                                className="promotions-action-btn promotions-action-btn--reject"
                                title="Reject request"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

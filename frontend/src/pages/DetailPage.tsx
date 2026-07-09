import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Send, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './DetailPage.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface RatingInfo {
  averageRating: number;
  totalReviews: number;
}

function StarRating({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="detail-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          strokeWidth={1.5}
          className={
            star <= Math.round(rating)
              ? 'detail-star--filled'
              : 'detail-star--empty'
          }
        />
      ))}
    </div>
  );
}

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingInfo, setRatingInfo] = useState<RatingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes, ratingRes] = await Promise.all([
          api.get<Product>(`/products/${id}`),
          api.get<{ content: Review[] }>(`/products/${id}/reviews?page=0&size=10`),
          api.get<RatingInfo>(`/products/${id}/rating`),
        ]);
        setProduct(productRes);
        setReviews(reviewsRes.content || []);
        setRatingInfo(ratingRes);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        }
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addItem(product.id, 1);
  }, [product, addItem]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || reviewRating === 0 || !reviewComment.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setSubmitSuccess(true);
      setReviewComment('');
      setReviewRating(0);

      // Refresh reviews and rating
      const [reviewsRes, ratingRes] = await Promise.all([
        api.get<{ content: Review[] }>(`/products/${id}/reviews?page=0&size=10`),
        api.get<RatingInfo>(`/products/${id}/rating`),
      ]);
      setReviews(reviewsRes.content || []);
      setRatingInfo(ratingRes);

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-loading">
          <div className="detail-spinner" />
          <span className="muted-body">Loading product...</span>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="detail-page">
        <div className="detail-not-found">
          <h2 className="detail-not-found__title">Product Not Found</h2>
          <Link to="/" className="btn btn-primary">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" className="detail-back">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Catalog
        </Link>
      </motion.div>

      {/* Product Layout */}
      <div className="detail-layout">
        {/* Image */}
        <motion.div
          className="detail-image-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="detail-image"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          className="detail-info"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>

          {/* Rating */}
          {ratingInfo && ratingInfo.totalReviews > 0 && (
            <div className="detail-rating">
              <StarRating rating={ratingInfo.averageRating} />
              <span className="detail-rating__text">
                {ratingInfo.averageRating.toFixed(1)} ({ratingInfo.totalReviews}{' '}
                review{ratingInfo.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          <span className="detail-price">${product.price.toFixed(2)}</span>
          <p className="detail-description">{product.description}</p>

          <div className="detail-actions">
            <button className="detail-add-btn" onClick={handleAddToCart}>
              <ShoppingCart size={16} strokeWidth={1.5} />
              Add to Cart
            </button>
            <Link to="/checkout" className="detail-buy-btn">
              Instant Buy
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <motion.div
        className="reviews-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="reviews-header">
          <h2 className="reviews-title">
            <MessageSquare
              size={20}
              strokeWidth={1.5}
              style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}
            />
            Customer Reviews
          </h2>
        </div>

        {/* Review List */}
        {reviews.length === 0 ? (
          <div className="reviews-empty">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          <div className="review-list">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="review-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <div className="review-card__header">
                  <span className="review-card__author">
                    {review.userName || 'Anonymous'}
                  </span>
                  <div className="review-card__stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        strokeWidth={1.5}
                        className={
                          star <= review.rating
                            ? 'detail-star--filled'
                            : 'detail-star--empty'
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="review-card__comment">{review.comment}</p>
                {review.createdAt && (
                  <span className="review-card__date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Review Form */}
        {isAuthenticated ? (
          <motion.div
            className="review-form"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="review-form__title">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="review-form__rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className="review-form__star-btn"
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(star)}
                  >
                    <Star
                      size={22}
                      strokeWidth={1.5}
                      className={
                        star <= (reviewHover || reviewRating)
                          ? 'detail-star--filled'
                          : 'detail-star--empty'
                      }
                    />
                  </button>
                ))}
              </div>
              <textarea
                className="review-form__textarea"
                placeholder="Share your experience with this product..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
              />
              {submitSuccess && (
                <div
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                  }}
                >
                  ✓ Review submitted successfully!
                </div>
              )}
              <button
                type="submit"
                className="review-form__submit"
                disabled={submitting || reviewRating === 0}
              >
                <Send size={14} strokeWidth={1.5} />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="review-form__login-prompt">
            <Link to="/login">Log in</Link> to write a review.
          </div>
        )}
      </motion.div>
    </div>
  );
};

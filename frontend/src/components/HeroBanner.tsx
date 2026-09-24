import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';
import './HeroBanner.css';

interface Slide {
  id: number;
  tag: string;
  title: string;
  description: string;
  cta: string;
  bgClass: string;
  imageUrl: string;
  productId: string;
  price?: number;
  category?: string;
  rating?: number;
  reviewsCount?: number;
}

interface Promotion {
  id: string;
  productId: string;
  title: string;
  tagLine: string;
  description: string;
  imageUrl: string;
  price?: number;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    tag: 'Wink Collection 2026',
    title: 'Japan Green Outer Jacket',
    description:
      'Minimalist military-inspired utility jacket tailored with durable water-repellent Japanese cotton twill and matte horn buttons.',
    cta: 'Explore Collection',
    bgClass: 'hero-slide-bg--1',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    productId: '1',
    price: 3499,
    category: 'Outerwear',
    rating: 4.9,
    reviewsCount: 148,
  },
  {
    id: 2,
    tag: 'Acoustic Flagship',
    title: 'Aura Studio Wireless Over-Ear',
    description:
      'Custom acoustic architecture with 40mm dynamic drivers, spatial audio tracking, and 40-hour battery life.',
    cta: 'Explore Aura Studio',
    bgClass: 'hero-slide-bg--2',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    productId: '9',
    price: 18999,
    category: 'Tech & Lifestyle',
    rating: 4.9,
    reviewsCount: 142,
  },
  {
    id: 3,
    tag: 'Everyday Essential',
    title: 'Soft Minimalist Sage Hoodie',
    description:
      'Cloud-soft 450 GSM brushed French terry cotton hoodie featuring double-layer hood, hidden phone pouch, and seamless cuffs.',
    cta: 'Shop Hoodie',
    bgClass: 'hero-slide-bg--3',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    productId: '3',
    price: 2799,
    category: 'Hoodies',
    rating: 4.9,
    reviewsCount: 185,
  },
  {
    id: 4,
    tag: 'Limited Timepiece',
    title: 'Chronos Swiss Chronograph Watch',
    description:
      'Precision Swiss quartz movement with sapphire crystal glass and interchangeable Italian top-grain leather straps.',
    cta: 'View Timepiece',
    bgClass: 'hero-slide-bg--4',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    productId: '10',
    price: 12499,
    category: 'Accessories',
    rating: 4.8,
    reviewsCount: 96,
  },
  {
    id: 5,
    tag: 'Modern Tailoring',
    title: 'One Set Tailored Modern Suit',
    description:
      'Two-piece deconstructed blazer and relaxed pleat trousers crafted with breathable wool-blend fabric for effortless elegance.',
    cta: 'Explore Tailoring',
    bgClass: 'hero-slide-bg--5',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    productId: '5',
    price: 7999,
    category: 'Suits & Formal',
    rating: 4.9,
    reviewsCount: 78,
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: 'easeOut' as const },
  }),
};

export const HeroBanner = () => {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [[currentIndex, direction], setSlide] = useState([0, 0]);
  const navigate = useNavigate();

  const paginate = useCallback(
    (newDirection: number) => {
      setSlide(([prev]) => {
        const next = (prev + newDirection + slides.length) % slides.length;
        return [next, newDirection];
      });
    },
    [slides.length]
  );

  const goToSlide = (index: number) => {
    const dir = index > currentIndex ? 1 : -1;
    setSlide([index, dir]);
  };

  // Fetch active promotions from backend on mount (if available)
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const promotions = await api.get<Promotion[]>('/products/promotions/active');
        if (promotions && promotions.length > 0) {
          const mapped: Slide[] = promotions.map((p, idx) => ({
            id: idx + 1,
            tag: p.tagLine || 'Wink Collection 2026',
            title: p.title,
            description: p.description,
            cta: 'Shop Now',
            bgClass: `hero-slide-bg--${(idx % 5) + 1}`,
            imageUrl: p.imageUrl,
            productId: p.productId,
            price: p.price || 2499,
          }));
          setSlides(mapped);
          setSlide([0, 0]);
        } else {
          setSlides(defaultSlides);
        }
      } catch {
        setSlides(defaultSlides);
      }
    };
    fetchPromotions();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [paginate]);

  const currentSlide = slides[currentIndex] || defaultSlides[0];

  return (
    <section className="hero-banner">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide.id}
          className="hero-slide"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' as const }}
        >
          {/* Ambient background with subtle zoom */}
          <div
            className={`hero-slide-bg ${currentSlide.bgClass}`}
            key={`bg-${currentSlide.id}`}
          />
          <div className="hero-slide-overlay" />

          {/* Content Container (Two-column layout on desktop) */}
          <div className="hero-slide-content">
            {/* Left Column: Heading, Description, CTA */}
            <div className="hero-slide-left">
              <motion.span
                className="hero-slide-tag"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0.1}
              >
                {currentSlide.tag}
              </motion.span>

              <motion.h1
                className="hero-slide-title"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0.25}
              >
                {currentSlide.title}
              </motion.h1>

              <motion.p
                className="hero-slide-description"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0.4}
              >
                {currentSlide.description}
              </motion.p>

              <motion.button
                className="hero-slide-cta"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0.55}
                onClick={() =>
                  navigate(currentSlide.productId ? `/product/${currentSlide.productId}` : '/')
                }
              >
                {currentSlide.cta}
                <ArrowRight size={16} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Right Column: Hero Product Showcase Visual Card */}
            <div className="hero-slide-right">
              <motion.div
                className="hero-product-card"
                initial={{ opacity: 0, scale: 0.92, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={() =>
                  navigate(currentSlide.productId ? `/product/${currentSlide.productId}` : '/')
                }
              >
                <div className="hero-product-image-wrap">
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="hero-product-image"
                    loading="eager"
                  />
                  <div className="hero-product-glass-glow" />

                  {currentSlide.rating && (
                    <div className="hero-product-badge-rating">
                      <Star size={13} className="hero-product-star-icon" />
                      <span>{currentSlide.rating.toFixed(1)}</span>
                      {currentSlide.reviewsCount && (
                        <span className="hero-product-review-count">
                          ({currentSlide.reviewsCount})
                        </span>
                      )}
                    </div>
                  )}

                  {currentSlide.category && (
                    <div className="hero-product-badge-category">
                      {currentSlide.category}
                    </div>
                  )}
                </div>

                <div className="hero-product-info">
                  <div className="hero-product-details">
                    <span className="hero-product-name">{currentSlide.title}</span>
                    <span className="hero-product-status">
                      <span className="hero-product-status-dot" />
                      In Stock • Priority Delivery
                    </span>
                  </div>

                  {currentSlide.price !== undefined && (
                    <div className="hero-product-price-box">
                      <span className="hero-product-price-label">Price</span>
                      <span className="hero-product-price">
                        {formatPrice(currentSlide.price)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        className="hero-arrow hero-arrow--left"
        onClick={() => paginate(-1)}
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      <button
        className="hero-arrow hero-arrow--right"
        onClick={() => paginate(1)}
        aria-label="Next slide"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      {/* Navigation dots */}
      <div className="hero-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`hero-dot ${index === currentIndex ? 'hero-dot--active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

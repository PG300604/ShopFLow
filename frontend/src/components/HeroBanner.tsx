import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './HeroBanner.css';

interface Slide {
  id: number;
  tag: string;
  title: string;
  description: string;
  cta: string;
  bgClass: string;
  imageUrl?: string;
  productId?: string;
}

interface Promotion {
  id: string;
  productId: string;
  title: string;
  tagLine: string;
  description: string;
  imageUrl: string;
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    tag: 'New Season',
    title: 'Elevate Your Everyday Essentials',
    description:
      'Discover our curated collection of premium products designed for modern living. Quality meets aesthetic perfection.',
    cta: 'Shop Collection',
    bgClass: 'hero-slide-bg--1',
  },
  {
    id: 2,
    tag: 'Limited Edition',
    title: 'Crafted With Precision & Purpose',
    description:
      'Exclusive pieces that blend form and function. Each item tells a story of meticulous craftsmanship.',
    cta: 'Explore Now',
    bgClass: 'hero-slide-bg--2',
  },
  {
    id: 3,
    tag: 'Summer 2026',
    title: 'Bold Colors, Timeless Design',
    description:
      'This season\'s palette celebrates vibrant energy and natural tones. Find your signature style.',
    cta: 'View Lookbook',
    bgClass: 'hero-slide-bg--3',
  },
  {
    id: 4,
    tag: 'Free Shipping',
    title: 'Premium Quality, Delivered Free',
    description:
      'All orders ship free, worldwide. Experience luxury without limits — from our studio to your doorstep.',
    cta: 'Start Shopping',
    bgClass: 'hero-slide-bg--4',
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

  // Fetch active promotions from backend on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const promotions = await api.get<Promotion[]>('/products/promotions/active');
        if (promotions && promotions.length > 0) {
          const mapped: Slide[] = promotions.map((p, idx) => ({
            id: idx + 1,
            tag: p.tagLine,
            title: p.title,
            description: p.description,
            cta: 'Shop Now',
            bgClass: '',
            imageUrl: p.imageUrl,
            productId: p.productId,
          }));
          setSlides(mapped);
          setSlide([0, 0]);
        } else {
          setSlides(defaultSlides);
        }
      } catch (err) {
        console.error('Failed to load active promotions:', err);
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
          {/* Background with zoom animation */}
          <div
            className={`hero-slide-bg ${currentSlide.bgClass}`}
            key={`bg-${currentSlide.id}`}
            style={
              currentSlide.imageUrl
                ? {
                    backgroundImage: `url(${currentSlide.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          />
          <div className="hero-slide-overlay" />

          {/* Content */}
          <div className="hero-slide-content">
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

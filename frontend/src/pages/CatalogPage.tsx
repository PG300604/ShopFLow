import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Eye, 
  PackageOpen, 
  Filter, 
  ArrowUpDown, 
  Heart, 
  Star, 
  RotateCcw,
  Check
} from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { MOCK_PRODUCTS, type Product } from '../data/mockProducts';
import { formatPrice } from '../utils/format';
import './CatalogPage.css';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const AVAILABLE_COLORS = [
  { label: 'All', value: 'all', colorHex: 'transparent' },
  { label: 'Forest Green', value: '#2e4a3d', colorHex: '#2e4a3d' },
  { label: 'Onyx Black', value: '#1a1a1a', colorHex: '#1a1a1a' },
  { label: 'Sage', value: '#8fae9b', colorHex: '#8fae9b' },
  { label: 'Mocha Brown', value: '#6b4423', colorHex: '#6b4423' },
  { label: 'Off White', value: '#f4f3ee', colorHex: '#f4f3ee', border: true },
  { label: 'Dusty Rose', value: '#d8b4b4', colorHex: '#d8b4b4' },
  { label: 'Slate Navy', value: '#1e293b', colorHex: '#1e293b' },
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function SkeletonCard() {
  return (
    <div className="pinterest-card pinterest-card--skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--tag" />
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--desc" />
        <div className="skeleton-footer">
          <div className="skeleton-line skeleton-line--price" />
          <div className="skeleton-line skeleton-line--btn" />
        </div>
      </div>
    </div>
  );
}

export const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [addedNotice, setAddedNotice] = useState<number | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<any>('/products');
        if (res && Array.isArray(res) && res.length > 0) {
          setProducts(res);
        } else if (res && res.content && Array.isArray(res.content) && res.content.length > 0) {
          setProducts(res.content);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.warn('Backend unavailable, using catalog showcase mock data:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['All', ...cats];
  }, [products]);

  // Compute counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const toggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1, {
      productName: product.name,
      productPrice: product.price,
      productImage: product.imageUrl,
    });
    setAddedNotice(product.id);
    setTimeout(() => {
      setAddedNotice((cur) => (cur === product.id ? null : cur));
    }, 1500);
  };

  const resetFilters = () => {
    setActiveCategory('All');
    setPriceRange('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setSortBy('default');
  };

  const hasActiveFilters =
    activeCategory !== 'All' ||
    priceRange !== 'all' ||
    selectedColor !== 'all' ||
    selectedSize !== 'all' ||
    sortBy !== 'default';

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // 1. Category
      const matchesCategory =
        activeCategory === 'All' || p.category === activeCategory;

      // 2. Price in INR
      let matchesPrice = true;
      if (priceRange === 'under-2000') {
        matchesPrice = p.price < 2000;
      } else if (priceRange === '2000-4000') {
        matchesPrice = p.price >= 2000 && p.price <= 4000;
      } else if (priceRange === '4000-8000') {
        matchesPrice = p.price >= 4000 && p.price <= 8000;
      } else if (priceRange === 'over-8000') {
        matchesPrice = p.price > 8000;
      }

      // 3. Color
      let matchesColor = true;
      if (selectedColor !== 'all') {
        matchesColor = p.color?.toLowerCase() === selectedColor.toLowerCase();
      }

      // 4. Size
      let matchesSize = true;
      if (selectedSize !== 'all') {
        matchesSize = p.sizes ? p.sizes.includes(selectedSize) : true;
      }

      return matchesCategory && matchesPrice && matchesColor && matchesSize;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [products, activeCategory, priceRange, selectedColor, selectedSize, sortBy]);

  return (
    <div className="catalog-page">
      {/* Editorial Hero Banner Slider */}
      <HeroBanner />

      <div className="catalog-container container">
        {/* Left Side Filter Sidebar (Pinterest Aesthetic) */}
        <aside className="catalog-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-header__title-wrap">
              <Filter size={16} />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button className="sidebar-reset-btn" onClick={resetFilters} title="Reset all filters">
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="sidebar-section">
            <h4 className="sidebar-section__title">Categories</h4>
            <div className="category-list">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    className={`category-list-btn ${isActive ? 'category-list-btn--active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    <span className="category-list-btn__label">{cat}</span>
                    <span className="category-list-btn__count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter (in INR) */}
          <div className="sidebar-section">
            <h4 className="sidebar-section__title">Price Range</h4>
            <div className="filter-options-list">
              {[
                { label: 'All Prices', value: 'all' },
                { label: 'Under ₹2,000', value: 'under-2000' },
                { label: '₹2,000 – ₹4,000', value: '2000-4000' },
                { label: '₹4,000 – ₹8,000', value: '4000-8000' },
                { label: 'Over ₹8,000', value: 'over-8000' },
              ].map((opt) => (
                <label key={opt.value} className="filter-radio-label">
                  <input
                    type="radio"
                    name="price-range"
                    checked={priceRange === opt.value}
                    onChange={() => setPriceRange(opt.value)}
                  />
                  <span className="filter-radio-custom" />
                  <span className="filter-radio-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Filter Swatches */}
          <div className="sidebar-section">
            <h4 className="sidebar-section__title">Color</h4>
            <div className="color-swatches-grid">
              {AVAILABLE_COLORS.map((col) => {
                const isSelected = selectedColor === col.value;
                if (col.value === 'all') {
                  return (
                    <button
                      key={col.value}
                      className={`color-chip-all ${isSelected ? 'color-chip-all--active' : ''}`}
                      onClick={() => setSelectedColor('all')}
                      title="All Colors"
                    >
                      All
                    </button>
                  );
                }
                return (
                  <button
                    key={col.value}
                    className={`color-swatch-circle ${isSelected ? 'color-swatch-circle--active' : ''} ${col.border ? 'color-swatch-circle--border' : ''}`}
                    style={{ backgroundColor: col.colorHex }}
                    onClick={() => setSelectedColor(isSelected ? 'all' : col.value)}
                    title={col.label}
                  >
                    {isSelected && <Check size={11} color={col.border ? '#111' : '#fff'} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter Chips */}
          <div className="sidebar-section">
            <h4 className="sidebar-section__title">Sizes</h4>
            <div className="size-chips-grid">
              {AVAILABLE_SIZES.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    className={`size-chip ${isSelected ? 'size-chip--active' : ''}`}
                    onClick={() => setSelectedSize(isSelected ? 'all' : size)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Side Content Results */}
        <main className="catalog-content">
          {/* Section Top Bar */}
          <div className="catalog-content-header">
            <div>
              <span className="catalog-content-header__label">Curated Collection</span>
              <h2 className="catalog-content-header__title">
                {activeCategory === 'All' ? 'All Products' : activeCategory}
              </h2>
            </div>
            
            <div className="catalog-header-actions">
              <span className="catalog-items-count">
                {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
              </span>
              <div className="sort-wrapper">
                <ArrowUpDown size={13} className="sort-icon" />
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort products"
                >
                  <option value="default">Featured</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid: 3-column Pinterest Style Layout */}
          {loading ? (
            <div className="catalog-grid-3col">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="catalog-empty">
              <PackageOpen size={48} strokeWidth={1} className="catalog-empty__icon" />
              <h3 className="catalog-empty__title">No matching products found</h3>
              <p className="catalog-empty__text">
                Try resetting your filters or selecting a different category.
              </p>
              <button className="catalog-empty__btn" onClick={resetFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <motion.div
              className="catalog-grid-3col"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.map((product) => {
                const isLiked = wishlist.has(product.id);
                const wasAdded = addedNotice === product.id;

                return (
                  <motion.div
                    key={product.id}
                    className="pinterest-card"
                    variants={cardVariants}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Top Image Box with Wishlist & Badge */}
                    <div className="pinterest-card__image-container">
                      <Link to={`/product/${product.id}`} className="pinterest-card__image-link">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="pinterest-card__image"
                          loading="lazy"
                        />
                      </Link>

                      {/* Category Pill Tag */}
                      <span className="pinterest-card__badge">
                        {product.category}
                      </span>

                      {/* Wishlist Heart Icon Button */}
                      <button
                        className={`pinterest-card__wishlist-btn ${isLiked ? 'pinterest-card__wishlist-btn--liked' : ''}`}
                        onClick={(e) => toggleWishlist(e, product.id)}
                        aria-label="Save to wishlist"
                      >
                        <Heart
                          size={16}
                          fill={isLiked ? '#ef4444' : 'none'}
                          stroke={isLiked ? '#ef4444' : 'currentColor'}
                        />
                      </button>
                    </div>

                    {/* Card Body Details */}
                    <div className="pinterest-card__body">
                      {/* Rating and Reviews */}
                      <div className="pinterest-card__meta-row">
                        <div className="pinterest-card__rating">
                          <Star size={13} fill="#f59e0b" stroke="#f59e0b" />
                          <span className="pinterest-card__rating-score">
                            {product.rating ? product.rating.toFixed(1) : '4.8'}
                          </span>
                          <span className="pinterest-card__rating-count">
                            ({product.reviewsCount || 42})
                          </span>
                        </div>
                        {product.sizes && product.sizes.length > 0 && (
                          <span className="pinterest-card__sizes-preview">
                            {product.sizes.slice(0, 3).join(' · ')}
                            {product.sizes.length > 3 ? '+' : ''}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <Link to={`/product/${product.id}`} className="pinterest-card__title-link">
                        <h3 className="pinterest-card__title">{product.name}</h3>
                      </Link>

                      {/* Short editorial description */}
                      <p className="pinterest-card__desc">{product.description}</p>

                      {/* Bottom Row: Price in INR and Add to Cart Button */}
                      <div className="pinterest-card__footer">
                        <div className="pinterest-card__price-wrap">
                          <span className="pinterest-card__price">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <div className="pinterest-card__btn-group">
                          <button
                            className={`pinterest-card__add-btn ${wasAdded ? 'pinterest-card__add-btn--success' : ''}`}
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            {wasAdded ? (
                              <>
                                <Check size={14} /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={14} /> Add to Cart
                              </>
                            )}
                          </button>
                          <Link
                            to={`/product/${product.id}`}
                            className="pinterest-card__view-btn"
                            title="View product details"
                          >
                            <Eye size={15} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

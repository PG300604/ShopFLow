import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, PackageOpen, Filter, ArrowUpDown } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import './CatalogPage.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line skeleton-line--medium" />
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line skeleton-line--btn" />
      </div>
    </div>
  );
}

export const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<any>('/products');
        if (res && Array.isArray(res)) {
          setProducts(res);
        } else if (res && res.content && Array.isArray(res.content)) {
          setProducts(res.content);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
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

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory =
        activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesPrice = true;
      if (priceRange === 'under-25') {
        matchesPrice = p.price < 25;
      } else if (priceRange === '25-50') {
        matchesPrice = p.price >= 25 && p.price <= 50;
      } else if (priceRange === '50-100') {
        matchesPrice = p.price >= 50 && p.price <= 100;
      } else if (priceRange === 'over-100') {
        matchesPrice = p.price > 100;
      }

      return matchesCategory && matchesSearch && matchesPrice;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, activeCategory, searchQuery, priceRange, sortBy]);

  const handleAddToCart = (product: Product) => {
    addItem(product.id, 1);
  };

  return (
    <div className="catalog-page">
      {/* Hero Banner Slider */}
      <HeroBanner />

      <div className="catalog-container container">
        {/* Left Side Filter Sidebar */}
        <aside className="catalog-sidebar">
          <div className="sidebar-section">
            <h4 className="sidebar-section__title">
              <Filter size={14} /> Categories
            </h4>
            <div className="category-list">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-list-btn ${activeCategory === cat ? 'category-list-btn--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-section__title">Price</h4>
            <div className="filter-options-list">
              {[
                { label: 'All Prices', value: 'all' },
                { label: 'Under $25', value: 'under-25' },
                { label: '$25 to $50', value: '25-50' },
                { label: '$50 to $100', value: '50-100' },
                { label: 'Over $100', value: 'over-100' },
              ].map((opt) => (
                <label key={opt.value} className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="price-range"
                    checked={priceRange === opt.value}
                    onChange={() => setPriceRange(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-section__title">
              <ArrowUpDown size={14} /> Sort By
            </h4>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Right Side Content Results */}
        <main className="catalog-content">
          {/* Section Header */}
          <div className="catalog-content-header">
            <div>
              <span className="catalog-content-header__label">Curated Selection</span>
              <h2 className="catalog-content-header__title">
                {activeCategory === 'All' ? 'All Products' : activeCategory}
              </h2>
            </div>
            {!loading && (
              <p className="catalog-content-header__count">
                {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="catalog-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="catalog-empty">
              <PackageOpen size={48} strokeWidth={1} className="catalog-empty__icon" />
              <h3 className="catalog-empty__title">No products found</h3>
              <p className="catalog-empty__text">
                Try adjusting your search query, price filter, or category.
              </p>
            </div>
          ) : (
            <motion.div
              className="catalog-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/product/${product.id}`} className="product-card__image-wrap">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-card__image"
                      loading="lazy"
                    />
                    <span className="product-card__category">{product.category}</span>
                  </Link>
                  <div className="product-card__body">
                    <h3 className="product-card__name">{product.name}</h3>
                    <span className="product-card__price">
                      ${product.price.toFixed(2)}
                    </span>
                    <div className="product-card__actions">
                      <button
                        className="product-card__add-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={14} strokeWidth={1.5} />
                        Add
                      </button>
                      <Link
                        to={`/product/${product.id}`}
                        className="product-card__view-btn"
                      >
                        <Eye size={14} strokeWidth={1.5} />
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};
